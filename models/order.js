import mongoose from "mongoose";

const OrderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        // required: true,

    }],
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    }

}, { timestamps: true });

OrderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

OrderSchema.set("toJSON", {
    virtuals: true,
});

const Order = mongoose.model('Order', OrderSchema)
export default Order