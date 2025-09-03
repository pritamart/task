import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['mint', 'list', 'sale', 'unlist'], required: true },
  nft: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Activity', ActivitySchema);