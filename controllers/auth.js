const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { SENDMAILPASS, SENDMAILUSER, JWTSECRETKEY } = require('../util/config');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDMAILUSER,
        pass: SENDMAILPASS
    }
})

exports.signup = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            profile: {
                things: []
            }
        })
        const savedUser = await user.save();
        try {
            res.status(201).json({
                message: 'User created',
                userId: savedUser._id
            })
            transporter.sendMail({
                to: savedUser.email,
                from: SENDMAILUSER,
                subject: 'Welcome To The Family!',
                html: '<h1>You successfully signed up!</h1>'
            })
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.login = async (req, res, next) => {




    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }

    try {
        const loggedUser = await User.findOne({ email: email });
        if (!loggedUser) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, loggedUser.password);
        if (!isEqual) {
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loggedUser.email,
                userId: loggedUser._id.toString()
            },
            JWTSECRETKEY,
            {
                expiresIn: '3h'
            }
        );
        res.status(200).json({
            token: token,
            userId: loggedUser._id.toString()
        })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}