const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/auth');

router.post('/signup', authcontroller.signup);


module.exports = router;