const authMiddleware = require('../middleware/is-auth');
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('Auth middleware', function () {

    it('should throw an error if no auth header is presented.', function () {
        const req = {
            get: function () {
                return null;
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not authenticated');
    })

    it('should throw an error if the authorization header is only one string.', function () {
        const req = {
            get: function () {
                return 'Bearer ';
            }
        };

        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw();
    })

    it('should yield a userId after decoded the token', function () {
        const req = {
            get: function () {
                return 'Bearer fsadfjojsafl'
            }
        }
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'abc' });
        authMiddleware(req, {}, () => { });
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    })
})