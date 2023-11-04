const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

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

    // try {
    //     const hashedPassword = await bcrypt.hash(password, 12);
    //     const user = new User({
    //         email: email,
    //         password: hashedPassword,
    //         name: name
    //     });
    //     const result = await user.save();
    //     res.status(201).json({
    //         message: 'User created',
    //         userId: result._id
    //     });
    // } catch (err) {
    //     if (!err.statusCode) {
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // }
}