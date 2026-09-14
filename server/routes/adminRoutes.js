const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
    }
    next();
};

router.use(verifyToken);
router.use(isAdmin);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/skills', adminController.getAllSkills);
router.delete('/skills/:id', adminController.deleteSkill);
router.get('/requests', adminController.getAllRequests);
router.put('/requests/:id', adminController.updateRequestStatus);
router.get('/stats', adminController.getStats);

module.exports = router;