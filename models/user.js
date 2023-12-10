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
    resetToken: String,
    resetTokenEpiration: Date,
    profile: {
        things: [
            {
                thingId: {

                    type: Schema.Types.ObjectId,
                    ref: 'Thing',
                    required: true
                }
            }
        ]
    }
}, {
    timestamps: true,
});

userSchema.methods.deleteAThing = function (thingId) {
    const things = [...this.profile.things];
    const updatedThings = things.filter(thing => thing.thingId.toString() !== thingId.toString());
    this.profile.things = updatedThings;
    return this.save();
}

module.exports = mongoose.model('User', userSchema);