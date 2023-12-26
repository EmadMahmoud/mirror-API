jest.mock('jsonwebtoken')
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/is-auth');



// Mocks
const mockRequest = jest.fn(() => {
    return {
        headers: {},
    };
});

const mockResponse = jest.fn();
const mockNext = jest.fn();



// Test suite
describe('is-Auth Middleware', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });


    it('should set req.userId if a valid token is provided', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        jwt.verify.mockReturnValue({ userId: 'testUserId' })

        req.headers.authorization = `Bearer fjoiae324$`;

        await authMiddleware(req, res, next);

        expect(req.userId).toBe('testUserId');
        expect(next).toHaveBeenCalled();
    });

    test('should throw an error if no Authorization header is provided', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        await authMiddleware(req, res, next);
        // console.log(next.mock.calls[0][0]);
        expect.assertions(1)
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Not authenticated',
            statusCode: 401,
        }));
    });

    test('should throw an error if the token is invalid', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        jwt.verify.mockReturnValue(undefined);

        req.headers.authorization = `Bearer invalidToken`;

        await authMiddleware(req, res, next);

        expect.assertions(1)
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Malformed token',
            statusCode: 401,
        }));
    });
});






















// it('should throw an error if an invalid token is provided', async () => {
//     const req = mockRequest();
//     const res = mockResponse();
//     const next = mockNext;

//     req.headers.authorization = 'Bearer invalidToken';

//     await authMiddleware(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//         message: 'Not authenticated',
//     });
// });

// it('should throw an error if the token is not provided', async () => {
//     const req = mockRequest();
//     const res = mockResponse();
//     const next = mockNext;

//     await authMiddleware(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//         message: 'Not authenticated',
//     });
// });
