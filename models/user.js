import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true

    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,

    },
    address: {
        type: 'string'

    },

    img: {
        type: String,
    }

}, { timestamps: true });

UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserSchema.set("toJSON", {
    virtuals: true,
});

const User = mongoose.model('User', UserSchema)
export default User