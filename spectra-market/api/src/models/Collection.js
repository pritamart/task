import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  coverImageUrl: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Collection', CollectionSchema);