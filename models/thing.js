const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const thingSchema = new Schema({
    category: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    comment: {
        type: String,
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true

    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Thing', thingSchema);