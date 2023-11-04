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
    profile: {
        things: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Thing',
                required: true
            }
        ]
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);