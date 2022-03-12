import mongoose from "mongoose";

const OrderItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1
    },
    selectedColor: {
        type: String
    },
    selectedSize: {
        type: String
    }

}, { timestamps: true });

OrderItemSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

OrderItemSchema.set("toJSON", {
    virtuals: true,
});

const OrderItem = mongoose.model('OrderItem', OrderItemSchema)
export default OrderItem