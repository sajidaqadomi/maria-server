import mongoose from "mongoose";

const CategorySchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            // unique: true,
        },
        img: {
            type: String,
            required: true,
        },
        mainCat: {
            type: Array,
            required: true,

        },
        cat: {
            type: String,
            required: true
        },
        targetGender: {
            type: String,
            default: 'both',


        }
    },
    { timestamps: true }
);

CategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

CategorySchema.set("toJSON", {
    virtuals: true,
});

const Caregory = mongoose.model("Category", CategorySchema);
export default Caregory;
