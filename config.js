const dotenv = require('dotenv');

const loadEnv = (env) => {
    const result = dotenv.config({ path: `${env}.env` });

    if (result.error) {
        throw result.error;
    }
};

module.exports = loadEnv;
