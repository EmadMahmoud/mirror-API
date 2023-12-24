jest.mock('../../models/thing');
jest.mock('express-validator');
jest.mock('../../models/user');


const Thing = require('../../models/thing');
const { validationResult } = require('express-validator');
const User = require('../../models/user');

const { addThing } = require('../../controllers/mirror');


const mockRequest = jest.fn(() => {
    return {
        body: {
            category: 'category',
            name: 'name',
            comment: 'comment'
        },
        userId: 'userId'
    }
});

const mockResponse = jest.fn(() => {
    return {
        status: jest.fn(),
        json: jest.fn()
    }
});

const mockNext = jest.fn();


describe('Mirror Controller - addThing', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if validation does not pass, and not saving thing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Validation error' }]
        });

        await addThing(req, res, next);

        expect(validationResult).toHaveBeenCalled();
        expect(validationResult).toHaveBeenCalledWith(req);
        expect(validationResult(req).isEmpty()).toBeFalsy();
        expect(validationResult(req).array()).toEqual([{ msg: 'Validation error' }]);
        expect(Thing).not.toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('Validation Failed');
        expect(next.mock.calls[0][0].statusCode).toBe(422);
        expect(next.mock.calls[0][0].data).toEqual([{ msg: 'Validation error' }]);
    });

    test('should throw an error if thing.save() fails, and not saving thing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        Thing.mockReturnValue({
            save: jest.fn().mockRejectedValue(new Error('save error'))
        });

        await addThing(req, res, next);

        expect(validationResult).toHaveBeenCalled();
        expect(validationResult).toHaveBeenCalledWith(req);
        expect(validationResult(req).isEmpty()).toBeTruthy();
        expect(validationResult(req).array()).toEqual([]);
        expect(Thing).toHaveBeenCalled();
        expect(Thing).toHaveBeenCalledWith({
            category: req.body.category,
            name: req.body.name,
            comment: req.body.comment,
            userId: req.userId
        });
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('save error');
        expect(next.mock.calls[0][0].statusCode).toBe(500);
    });

    test('should save the thing into the database with the correct thing information', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        Thing.mockReturnValue({
            save: jest.fn().mockResolvedValue({
                _id: '23432523523'
            })
        });

        User.findById.mockReturnValue({
            profile: {
                things: []
            },
            save: jest.fn()
        })

        await addThing(req, res, next);

        expect(validationResult).toHaveBeenCalled();
        expect(validationResult).toHaveBeenCalledWith(req);
        expect(validationResult(req).isEmpty()).toBeTruthy();
        expect(validationResult(req).array()).toEqual([]);
        expect(Thing).toHaveBeenCalled();
        expect(Thing).toHaveBeenCalledWith({
            category: req.body.category,
            name: req.body.name,
            comment: req.body.comment,
            userId: req.userId
        });
        expect(Thing(req.body).save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: 'Thing created',
            thing: expect.any(Object)
        });
        expect(next).not.toHaveBeenCalled();
    });
});