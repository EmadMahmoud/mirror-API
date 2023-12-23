const jwt = require('jsonwebtoken');
const { JWTSECRETKEY } = require('../util/config')

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, JWTSECRETKEY);
        if (!decodedToken) {
            const error = new Error('Malformed token');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}