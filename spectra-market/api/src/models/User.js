import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  wallet: {
    address: { type: String, index: true, unique: true, sparse: true },
    nonce: { type: String, default: null } // for personal_sign login
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);