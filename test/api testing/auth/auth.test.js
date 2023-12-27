const app = require('../../../app');
const request = require('supertest');
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const pendingUsersSchema = require('../../../models/userspendingconfirmation');
const UserSchema = require('../../../models/user');



describe('Auth Routes', () => {

    let createTransportSpy;
    let jwtToken;
    beforeEach(async () => {
        // Mock the transport method of Nodemailer
        createTransportSpy = jest.spyOn(nodemailer, 'createTransport');
        createTransportSpy.mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({ done: "true" })
        });

    })

    afterEach(() => {
        createTransportSpy.mockRestore();
        jest.clearAllMocks();
    });

    describe('Signup', () => {

        beforeAll(async () => {
            // Delete all pending users
            await pendingUsersSchema.deleteMany();
            // Delete all users
            await UserSchema.deleteMany();

        })
        test('POST /auth/signup <=success=> 201 && {message, email} ', async () => {
            const response = await request(app).post('/auth/signup').send({
                email: 'emadis4char@gmail.com',
                password: '123456',
                confirmPassword: '123456'
            });

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Signup successful, check your email for verification.',
                email: 'emadis4char@gmail.com'
            }));
        });

        test('POST /auth/signup <=validation fail=> 422 && {message, data} ', async () => {
            const response = await request(app).post('/auth/signup').send({
                email: 'emadis4char@gmail.com',
                password: '1'
            });

            expect(response.statusCode).toBe(422);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Validation Failed',
                data: expect.arrayContaining([expect.objectContaining({
                    location: expect.stringMatching(/body/),
                    path: expect.stringMatching(/password|confirmPassword|email/),
                    msg: expect.any(String),
                    type: expect.stringMatching(/field/)
                })])
            }));
        })
    });

    describe('Confirm Email', () => {


        test(' POST /auth/confirmEmail <=validation fail=> 422 && {message, data}', async () => {
            const response = await request(app).post('/auth/confirmEmail').send({
                email: 'emadis4char@gmail.com'
            });
            expect(response.statusCode).toBe(422);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Validation Failed',
                data: expect.arrayContaining([expect.objectContaining({
                    location: expect.stringMatching(/body/),
                    path: expect.stringMatching(/confirmationCode|email/),
                    msg: expect.any(String),
                    type: expect.stringMatching(/field/)
                })])
            }));

        })

        test(' POST /auth/confirmEmail <=user not found=> 401 && {message}', async () => {
            const email = 'nofeagellg@gmail.com';
            const response = await request(app).post('/auth/confirmEmail').send({
                email: email,
                confirmationCode: 1234567
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'User not found'
            }));
        });

        test(' POST /auth/confirmEmail <=wrong confirmation code=> 401 && {message}', async () => {
            const email = 'emadis4char@gmail.com';
            const response = await request(app).post('/auth/confirmEmail').send({
                email: email,
                confirmationCode: 1234567
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Wrong Confirmation Code'
            }));
        });

        test(' POST /auth/confirmEmail <=success=> 201 && { userId }', async () => {
            const email = 'emadis4char@gmail.com';
            const user = await pendingUsersSchema.findOne({ email: email }).exec();
            const response = await request(app).post('/auth/confirmEmail').send({
                email: email,
                confirmationCode: user.confirmationCode
            });

            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual(expect.objectContaining({
                userId: expect.any(String),
                message: 'Email Confirmed, You now can Signin.'
            }));
        });
    })


    describe('Login', () => {

        test(' POST /auth/login <=validation fail=> 422 && {message, data}', async () => {
            const response = await request(app).post('/auth/login').send({
                email: 'foiajeffe@gmail.com'
            });
            expect(response.statusCode).toBe(422);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Validation Failed',
                data: expect.arrayContaining([expect.objectContaining({
                    location: expect.stringMatching(/body/),
                    path: expect.stringMatching(/password|email/),
                    msg: expect.any(String),
                    type: expect.stringMatching(/field/)
                })])
            }));
        });

        test(' POST /auth/login <=user not found=> 401 && {message}', async () => {
            const response = await request(app).post('/auth/login').send({
                email: 'emmawatsonismywife@gmail.com',
                password: '123456'
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'User not found'
            }));
        })

        test(' POST /auth/login <=wrong password=> 401 && {message}', async () => {
            const response = await request(app).post('/auth/login').send({
                email: 'emadis4char@gmail.com',
                password: 'wrongPassword'
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Wrong Password'
            }));
        })

        test(' POST /auth/login <=success=> 200 && {token, userId}', async () => {
            const response = await request(app).post('/auth/login').send({
                email: 'emadis4char@gmail.com',
                password: '123456'
            });
            jwtToken = response.body.token;
            console.log(jwtToken);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                token: expect.any(String),
                userId: expect.any(String)
            }));
        })
    })
})