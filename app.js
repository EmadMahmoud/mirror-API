const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const envars = require('./util/config');
const app = express();
const authRoutes = require('./routes/auth');
// const mirrorRoutes = require('./routes/mirror');



app.use(bodyParser.json()); // application/json

// CORS error handling
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT', 'OPTIONS');
    next();
});

app.use('/auth', authRoutes);
// app.use('/mirror', mirrorRoutes);

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