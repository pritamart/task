import { Router } from 'express';
import { z } from 'zod';
import Collection from '../models/Collection.js';
import Nft from '../models/Nft.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const items = await Collection.find().sort({ createdAt: -1 });
  res.json({ items });
});

router.get('/:id', async (req, res) => {
  const col = await Collection.findById(req.params.id);
  if (!col) return res.status(404).json({ error: 'Not found' });
  const nfts = await Nft.find({ collection: col._id });
  res.json({ collection: col, items: nfts });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const name = z.string().min(1).parse(req.body.name);
    const description = z.string().optional().parse(req.body.description ?? '');
    const coverImageUrl = z.string().optional().parse(req.body.coverImageUrl ?? '');
    const created = await Collection.create({ name, description, coverImageUrl, creator: req.userId });
    res.json({ ok: true, collection: created });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;