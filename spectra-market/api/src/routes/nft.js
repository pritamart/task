import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import Nft from '../models/Nft.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  const { q = '', sort = 'createdAt', dir = 'desc', page = 1, limit = 20, listed } = req.query;
  const query = {};
  if (q) query.name = { $regex: q, $options: 'i' };
  if (listed === 'true') query.listed = true;
  const skip = (Number(page) - 1) * Number(limit);
  const items = await Nft.find(query).sort({ [sort]: dir === 'desc' ? -1 : 1 }).skip(skip).limit(Number(limit));
  const total = await Nft.countDocuments(query);
  res.json({ items, total });
});

router.post('/mint', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const name = z.string().min(1).parse(req.body.name);
    const description = z.string().optional().parse(req.body.description ?? '');
    const price = Number(req.body.price || 0);
    const user = await User.findById(req.userId);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '';
    const nft = await Nft.create({ name, description, imageUrl, owner: user._id, price, listed: false });
    await Activity.create({ type: 'mint', nft: nft._id, from: user._id });
    res.json({ ok: true, nft });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/:id/list', requireAuth, async (req, res) => {
  try {
    const price = Number(req.body.price || 0);
    const nft = await Nft.findById(req.params.id);
    if (!nft) return res.status(404).json({ error: 'Not found' });
    if (String(nft.owner) !== req.userId) return res.status(403).json({ error: 'Not owner' });
    nft.listed = true; nft.price = price; await nft.save();
    await Activity.create({ type: 'list', nft: nft._id, from: req.userId, price });
    res.json({ ok: true, nft });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/:id/unlist', requireAuth, async (req, res) => {
  try {
    const nft = await Nft.findById(req.params.id);
    if (!nft) return res.status(404).json({ error: 'Not found' });
    if (String(nft.owner) !== req.userId) return res.status(403).json({ error: 'Not owner' });
    nft.listed = false; await nft.save();
    await Activity.create({ type: 'unlist', nft: nft._id, from: req.userId });
    res.json({ ok: true, nft });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// "Buy" = transfer ownership + record sale (no chain transfer here; demo only)
router.post('/:id/buy', requireAuth, async (req, res) => {
  try {
    const nft = await Nft.findById(req.params.id);
    if (!nft || !nft.listed) return res.status(400).json({ error: 'Not for sale' });
    const sellerId = String(nft.owner);
    nft.owner = req.userId; nft.listed = false;
    await nft.save();
    const sale = await Activity.create({ type: 'sale', nft: nft._id, from: sellerId, to: req.userId, price: nft.price });

    // Emit to ticker
    const io = req.app.get('io');
    io.emit('sale', {
      id: String(nft._id),
      name: nft.name,
      price: nft.price,
      when: new Date().toISOString()
    });

    res.json({ ok: true, nft, sale });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/:id/history', async (req, res) => {
  const history = await Activity.find({ nft: req.params.id }).sort({ createdAt: -1 }).limit(100);
  res.json({ items: history });
});

export default router;