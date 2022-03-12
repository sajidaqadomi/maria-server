import mongoose from "mongoose";

const CartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true

    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',

        //required: true,
    }],
    quantity: {
        type: Number,
        default: 0
    }


}, { timestamps: true });

CartSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

CartSchema.set("toJSON", {
    virtuals: true,
});

const Cart = mongoose.model('Cart', CartSchema)
export default Cart