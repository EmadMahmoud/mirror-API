const User = require('../models/user');
const UserConfirmation = require('../models/userspendingconfirmation');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const { SENDMAILPASS, SENDMAILUSER, JWTSECRETKEY } = process.env;
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');



const createTransport = (() => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDMAILUSER,
        pass: process.env.SENDMAILPASS
    }
}))

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
        const confirmationCode = Math.floor(Math.random() * 9000000) + 10000000;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new UserConfirmation({
            email: email,
            password: hashedPassword,
            confirmationCode: confirmationCode
        })
        await user.save();
        const transporter = createTransport();
        transporter.sendMail({
            to: email,
            from: process.env.SENDMAILUSER,
            subject: 'Confirmation Code',
            html: `<h1>You successfully signed up!</h1> <p>Your Confirmation Code is ${confirmationCode}</p>
                    <u>note: this confirmation code will not be valid after 10 minute.</u>`
        })
        res.status(201)
        res.json({
            message: 'Signup successful, check your email for verification.',
            email: email
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.confirmEmail = async (req, res, next) => {
    const email = req.body.email;
    const confirmationCode = req.body.confirmationCode;

    try {
        const now = new Date();
        const pendingUser = await UserConfirmation.findOne({ email: email, createdAt: { $gte: now.setMinutes(now.getMinutes() - 10) } });
        if (!pendingUser) {
            const error = new Error('User not found');
            error.statusCode = 401;
            next(error);
        }
        if (pendingUser.confirmationCode !== +confirmationCode) {
            const error = new Error('Wrong Confirmation Code');
            error.statusCode = 401;
            next(error);
        }
        const user = new User({
            email: pendingUser.email,
            password: pendingUser.password,
            profile: {
                things: []
            }
        })
        const savedUser = await user.save();
        const removedPendingUser = await UserConfirmation.findOneAndDelete({ email: email });
        res.status(201).json({
            message: 'Email Confirmed, You now can Signin.',
            userId: savedUser._id
        })
        transporter.sendMail({
            to: savedUser.email,
            from: process.env.SENDMAILUSER,
            subject: 'Welcome To The Family!',
            html: '<h1>Email Confirmed Successfully, Start Building Your Profile Now.</h1>'
        })

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
            process.env.JWTSECRETKEY,
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

exports.sendResetPasswordLink = async (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                const error = new Error('Something went wrong');
                error.statusCode = 500;
                next(error);
            }
            const token = buffer.toString('hex');
            const user = await User.findOne({ email: email });
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 401;
                throw error;
            }
            user.resetToken = token;
            user.resetTokenEpiration = Date.now() + (36 * 36 * 1000);
            await user.save();
            transporter.sendMail({
                to: email,
                from: process.env.SENDMAILUSER,
                subject: 'Reset Password',
                html: `<h1>You requested a password reset</h1> <p>Click this <a href="http://localhost:3000/reset?t=${token}&e=${email}">link</a> to set a new password.</p>
                <u>note: this link will not be valid after 1 hour.</u>`
            })
            res.status(200).json({
                message: 'Reset Password Link Sent Successfully, Check Your Email.'
            })
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.setNewPassword = async (req, res, next) => {
    const password = req.body.password;
    const token = req.body.token;
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try {
        const user = await User.findOne({ email: email, resetToken: token, resetTokenEpiration: { $gt: Date.now() } })
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            next(error);
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenEpiration = undefined;
        await user.save();
        res.status(200).json({
            message: 'Password Changed Successfully, You now can Signin.'
        })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}