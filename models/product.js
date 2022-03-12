import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        desc: {
            type: String,
            required: true,
        },
        img: {
            type: String,
            required: true,
        },
        targetGender: {
            type: String,
            required: true,

        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        size: {
            type: Array,
        },
        color: {
            type: Array,
        },
        price: {
            type: Number,
            required: true,
        },
        inStock: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

ProductSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ProductSchema.set("toJSON", {
    virtuals: true,
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;
