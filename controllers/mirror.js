const Thing = require('../models/thing');
const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.addThing = async (req, res, next) => {
    const category = req.body.category;
    const name = req.body.name;
    const comment = req.body.comment;
    const userId = req.userId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try {
        const thing = new Thing({
            category: category,
            name: name,
            comment: comment,
            userId: userId
        });
        const result = await thing.save();
        const user = await User.findById(userId);
        user.profile.things.push({ thingId: result._id });
        await user.save();
        res.status(201).json({
            message: 'Thing created',
            thing: result
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getThings = async (req, res, next) => {
    const userId = req.userId;

    let totalItems;
    try {
        const things = await Thing.find({ userId: userId });
        totalItems = things.length;
        res.status(200).json({
            message: 'Things fetched',
            things: things,
            totalItems: totalItems
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getThing = async (req, res, next) => {

    const thingId = req.params.thingid;
    const userId = req.userId;
    console.log(thingId)

    try {
        const thing = await Thing.findById(thingId);
        console.log(thing)
        if (!thing) {
            const error = new Error('Thing not found');
            error.statusCode = 404;
            throw error;
        }
        if (thing.userId.toString() !== userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        res.status(200).json({
            message: 'Thing fetched',
            thing: thing
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.editThing = async (req, res, next) => {
    const thingId = req.params.thingid;
    const category = req.body.category;
    const name = req.body.name;
    const comment = req.body.comment;
    const userId = req.userId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    try {
        const thing = await Thing.findById(thingId);
        if (!thing) {
            const error = new Error('Thing not found');
            error.statusCode = 404;
            throw error;
        }
        if (thing.userId.toString() !== userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        thing.category = category;
        thing.name = name;
        thing.comment = comment;
        const result = await thing.save();
        res.status(200).json({
            message: 'Thing updated',
            thing: result
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteThing = async (req, res, next) => {
    const thingId = req.params.thingid;
    const userId = req.userId;
    try {
        const thing = await Thing.findById(thingId);
        if (!thing) {
            const error = new Error('Thing not found');
            error.statusCode = 404;
            throw error;
        }
        if (thing.userId.toString() !== userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        const user = await User.findById(userId);
        await user.deleteAThing(thingId);
        await user.save();
        await Thing.findByIdAndDelete(thingId);
        res.status(200).json({
            message: 'Thing deleted'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}