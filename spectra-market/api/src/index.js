import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRouter from './routes/auth.js';
import nftRouter from './routes/nft.js';
import collectionRouter from './routes/collections.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.ORIGIN?.split(',') || ['http://localhost:3000'], credentials: true }
});

// expose io for routes to emit sales
app.set('io', io);

app.use(morgan('dev'));
app.use(cors({ origin: process.env.ORIGIN?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRouter);
app.use('/api/nft', nftRouter);
app.use('/api/collections', collectionRouter);

io.on('connection', (socket) => {
  // could implement rooms, etc.
  socket.emit('hello', { msg: 'connected to Spectra Market ticker' });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });