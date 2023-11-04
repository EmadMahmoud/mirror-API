const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const isAuth = require('../middleware/is-auth');

const mirrorController = require('../controllers/mirror');

router.post('/addThing',
    [
        body('category', 'Not a valid Category').notEmpty().isIn(['movies', 'tv-shows', 'books', 'songs']),
        body('name', 'Not a valid Name').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('name must be between 2-100 characters'),
        body('comment', 'Not a valid Comment').trim().isLength({ min: 2, max: 1500 }).withMessage('comment must be between 2-1500 characters')
    ],
    isAuth,
    mirrorController.addThing
);
router.get('/getThings', isAuth, mirrorController.getThings);

router.get('/getThing/:thingid', isAuth, mirrorController.getThing);

router.put('/editThing/:thingid',
    [
        body('category', 'Not a valid Category').notEmpty().isIn(['movies', 'tv-shows', 'books', 'songs']),
        body('name', 'Not a valid Name').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('name must be between 2-100 characters'),
        body('comment', 'Not a valid Comment').trim().isLength({ min: 2, max: 1500 }).withMessage('comment must be between 2-1500 characters')
    ],
    isAuth,
    mirrorController.editThing
);

router.delete('/deleteThing/:thingid', isAuth, mirrorController.deleteThing);


module.exports = router;

