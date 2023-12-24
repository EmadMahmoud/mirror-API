jest.mock('../../models/userspendingconfirmation');
jest.mock('bcryptjs');
jest.mock('express-validator');
jest.mock('nodemailer');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')




const UserConfirmation = require('../../models/userspendingconfirmation');

const authController = require('../../controllers/auth');


const mockRequest = jest.fn(() => {
    return {
        body: {
            email: 'emadis4char@gmail.com',
            password: '2431543'
        }
    }
});

const mockResponse = jest.fn(() => {
    return {
        status: jest.fn(),
        json: jest.fn()
    }
});

const mockNext = jest.fn();


describe('Auth Controller - signUp', () => {

    let createTransportSpy;
    beforeEach(() => {
        createTransportSpy = jest.spyOn(nodemailer, 'createTransport');
        createTransportSpy.mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({ done: "true" })
        })
    })

    afterEach(() => {
        createTransportSpy.mockRestore();
        jest.clearAllMocks();
    });

    test.only('should throw an error if validation does not pass, and not saving user', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Validation error' }]
        });


        await authController.signup(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.any(String),
            statusCode: 422,
            data: expect.any(Array)
        }));
        //to make sure the user doesn't get saved in the database
        expect(UserConfirmation).toHaveBeenCalledTimes(0);

    });

    test('should save the user into the database with the correct user information', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        bcrypt.hash.mockReturnValue('hashedPassword');
        UserConfirmation.mockReturnValue({
            save: () => { }
        });

        await authController.signup(req, res, next);
        expect(UserConfirmation).toHaveBeenCalledTimes(1);
        expect(UserConfirmation).toHaveBeenCalledWith(expect.objectContaining({
            email: req.body.email,
            password: 'hashedPassword',
            confirmationCode: expect.any(Number)
        }));

    });

    test('should send an email if user created', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        bcrypt.hash.mockReturnValue('hashedPassword');
        UserConfirmation.mockReturnValue({
            save: () => { }
        });

        await authController.signup(req, res, next);
        expect(createTransportSpy).toHaveBeenCalledTimes(1);
        expect(createTransportSpy).toHaveBeenCalledWith(expect.objectContaining({
            service: 'gmail',
            auth: {
                user: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
                pass: expect.any(String)
            }
        }));
        expect(createTransportSpy().sendMail).toHaveBeenCalledTimes(1)
        expect(createTransportSpy().sendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: req.body.email,
            from: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
            subject: 'Confirmation Code',
            html: expect.any(String)
        }));

    })



    test('should send a response with status(201) if signup completed', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });

        bcrypt.hash.mockReturnValue('hashedPassword');
        UserConfirmation.mockReturnValue({
            save: () => { }
        });

        await authController.signup(req, res, next);
        expect(UserConfirmation).toHaveBeenCalledTimes(1);
        expect(createTransportSpy).toHaveBeenCalledTimes(1);
        expect(createTransportSpy().sendMail).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Signup successful, check your email for verification.',
            email: req.body.email
        });
    })
})