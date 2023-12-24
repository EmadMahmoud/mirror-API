jest.mock('../../models/thing');
jest.mock('express-validator');


const Thing = require('../../models/thing');
const { validationResult } = require('express-validator');

const { getThing } = require('../../controllers/mirror');


const mockRequest = jest.fn(() => {
    return {
        userId: 'userId',
        params: {
            thingid: 'thingId'
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


describe('Mirror ontroller - getThing', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if thing not found', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        Thing.findById.mockReturnValue(null);

        await getThing(req, res, next);

        expect(Thing.findById).toHaveBeenCalled();
        expect(Thing.findById).toHaveBeenCalledWith(req.params.thingid);
        expect(Thing.findById()).toEqual(null);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 404,
            message: expect.any(String)
        }));
    });

    test('should throw an error if thing does not belong to user', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        Thing.findById.mockReturnValue({
            userId: 'anotherUserId'
        });

        await getThing(req, res, next);

        expect(Thing.findById).toHaveBeenCalled();
        expect(Thing.findById).toHaveBeenCalledWith(req.params.thingid);
        expect(Thing.findById(req.params.thingId)).toEqual({
            userId: 'anotherUserId'
        });
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 403,
            message: expect.any(String)
        }));
    });

    test('should send thing if it belongs to user', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        Thing.findById.mockReturnValue({
            userId: 'userId'
        });

        await getThing(req, res, next);

        expect(Thing.findById).toHaveBeenCalled();
        expect(Thing.findById).toHaveBeenCalledWith(req.params.thingid);
        expect(Thing.findById(req.params.thingid)).toEqual({
            userId: 'userId'
        });
        expect(res.status).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: expect.any(String),
            thing: {
                userId: 'userId'
            }
        });
        expect(next).not.toHaveBeenCalled();
    });
})