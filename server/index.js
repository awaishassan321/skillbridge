const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes import karo
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const skillRoutes = require('./routes/skillRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const requestRoutes = require('./routes/requestRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Routes use karo
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'SkillBridge Backend Chal Raha Hai! 🚀',
        status: 'success'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server port ${PORT} par chal raha hai ✅`);
});
