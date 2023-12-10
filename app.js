const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const envars = require('./util/config');
const app = express();
const authRoutes = require('./routes/auth');
const mirrorRoutes = require('./routes/mirror');
const path = require('path');
const pendingUsersSchema = require('./models/userspendingconfirmation');
const cron = require('node-cron');

/*
this schedule will run every 5 hours, then delete any pending user with a sending confirmation code over than an hour.
*/
cron.schedule('0 */5 * * *', async () => {
    try {
        const now = new Date();
        const oldDocuments = await pendingUsersSchema.deleteMany({ createdAt: { $lt: now.setMinutes(now.getMinutes() - 30) } });
        console.log(`${oldDocuments.deletedCount} documents deleted`);
    } catch (err) {
        console.log(err)
    }
})

app.use(bodyParser.json()); // application/json
app.use('/data', express.static(path.join(__dirname, 'data')));


// CORS error handling
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT', 'OPTIONS');
    next();
});

app.use('/auth', authRoutes);
app.use('/mirror', mirrorRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect(envars.MONGODB_URI)
    .then(result => {
        app.listen(3000);
        console.log('Db connected');
    })
    .catch(err => {
        console.log(err);
    })