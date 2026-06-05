const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());


app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mente backend is running' });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Backend running at http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });
