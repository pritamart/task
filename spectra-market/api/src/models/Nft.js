import mongoose from 'mongoose';

const NftSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String, // file path or data URL
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  price: { type: Number, default: 0 },
  listed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Nft', NftSchema);