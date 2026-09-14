const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

dotenv.config();

const app = express();

// CLIENT_URL restricts CORS to the deployed frontend in production;
// left unset, it falls back to allowing any origin (fine for local dev).
app.use(cors(process.env.CLIENT_URL ? { origin: process.env.CLIENT_URL } : {}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes import karo
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const skillRoutes = require('./routes/skillRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const requestRoutes = require('./routes/requestRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Routes use karo
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requests', messageRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'SkillBridge Backend Chal Raha Hai! 🚀',
        status: 'success'
    });
});

// Multer / upload error handler (must come after routes)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message?.includes('images are allowed')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server port ${PORT} par chal raha hai ✅`);
});