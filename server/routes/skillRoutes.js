const express = require('express');
const router = express.Router();
const { addSkill, getSkills, updateSkill, deleteSkill } = require('../controllers/skillController');
const { verifyToken } = require('../middleware/auth');

router.get('/', getSkills);
router.post('/', verifyToken, addSkill);
router.put('/:id', verifyToken, updateSkill);
router.delete('/:id', verifyToken, deleteSkill);

module.exports = router;