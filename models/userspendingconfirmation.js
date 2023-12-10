const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        minlength: 7
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    confirmationCode: {
        type: Number,
        require: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('confirmemail', userSchema);