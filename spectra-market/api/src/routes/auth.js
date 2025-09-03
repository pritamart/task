import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { makeNonce } from '../utils/sign.js';

const router = Router();

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

router.post('/register', async (req, res) => {
  try {
    const email = emailSchema.parse(req.body.email);
    const password = passwordSchema.parse(req.body.password);
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ ok: true, user: { id: user._id, email: user.email } });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = emailSchema.parse(req.body.email);
    const password = passwordSchema.parse(req.body.password);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash || '');
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ ok: true, user: { id: user._id, email: user.email } });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Wallet login: step 1 - get nonce
router.post('/wallet/nonce', async (req, res) => {
  try {
    const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/).parse((req.body.address || '').toLowerCase());
    let user = await User.findOne({ 'wallet.address': address });
    const nonce = makeNonce();
    if (!user) {
      user = await User.create({ wallet: { address, nonce } });
    } else {
      user.wallet.nonce = nonce;
      await user.save();
    }
    res.json({ address, nonce });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Wallet login: step 2 - verify signature (personal_sign server-side)
import { recoverAddress, hashMessage } from 'viem';

router.post('/wallet/verify', async (req, res) => {
  try {
    const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/).parse((req.body.address || '').toLowerCase());
    const signature = z.string().min(10).parse(req.body.signature);
    const user = await User.findOne({ 'wallet.address': address });
    if (!user || !user.wallet?.nonce) return res.status(400).json({ error: 'Nonce missing, request a new one' });

    const message = `Sign in to Spectra Market\n\nNonce: ${user.wallet.nonce}`;
    const recovered = await recoverAddress({
      hash: hashMessage(message),
      signature
    });
    if (recovered.toLowerCase() !== address) {
      return res.status(400).json({ error: 'Signature invalid' });
    }
    user.wallet.nonce = null;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ ok: true, user: { id: user._id, address } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;