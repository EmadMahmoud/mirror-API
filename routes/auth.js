const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const authController = require('../controllers/auth');

router.post('/signup',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail').normalizeEmail().custom(async value => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error('e-mail already in use, please choose another one');
            }
        }),
        body('password', 'The Password need to be between 5-30 character length and alphanumeric').isLength({ min: 5, max: 30 }).isAlphanumeric(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })

    ],
    authController.signup);

router.post('/confirmEmail',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail'),
        body('confirmationCode', 'The code you entered is not correct!').isNumeric().isLength({ min: 7, max: 7 })
    ],
    authController.confirmEmail)

router.post('/login',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail'),
        body('password', 'Incorrect Password').isAlphanumeric()
    ],
    authController.login)

router.post('/sendResetPasswordLink',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail'),
    ],
    authController.sendResetPasswordLink)
router.patch('/setNewPassword',
    [
        body('password', 'The Password need to be between 5-30 character length and alphanumeric').isLength({ min: 5, max: 30 }).isAlphanumeric(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        }),
    ],
    authController.setNewPassword
)


module.exports = router;