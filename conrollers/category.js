import mongoose from "mongoose";

import Category from "../models/category.js";
import Product from "../models/product.js";

export const category_get = async (req, res) => {
    const { targetGender, cat } = req.query;

    let filter =
        targetGender && cat
            ? { mainCat: { $in: [...cat.split(",")] }, targetGender }
            : {};
    try {
        const categoryList = await Category.find(filter);
        //  return res.status(500).json({ error: "not found" });
        res.status(200).json(categoryList);
    } catch (error) {
        res.status(500).json({ error });
    }
};
export const category_create = async (req, res) => {
    const { img, title, cat, mainCat, targetGender } = req.body;
    const { isAdmin } = req.user;
    let category = new Category({ img, title, cat, mainCat, targetGender });

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        // not allow to have the samecat in same mainCat and same target
        const prevCat = await Category.findOne({ mainCat: mainCat, targetGender, title });
        console.log(prevCat)
        if (prevCat)
            return res.status(404).json({ error: "Category name must be unique" });

        category = await category.save();
        if (category) return res.status(201).json(category);
        return res.status(404).json({ error: "The category cannot be created" });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};
export const category_update = async (req, res) => {
    const category = req.body;
    const { id } = req.params;
    const { isAdmin } = req.user;

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid Category id" });
        let updatedCategory = await Category.findByIdAndUpdate(
            id,
            { ...category },
            { new: true }
        );
        if (updatedCategory) return res.status(200).json(updatedCategory);
        return res.status(404).json({ error: "the category cannot be  updated" });
    } catch (error) {
        return res.status(500).json({ error });
    }
};
export const category_find_byId = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid Category id" });

        let category = await Category.findById(id);

        if (category) return res.status(200).json(category);
        return res.status(404).json({ err: "the category cannot found" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
export const category_delete_byId = async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.user;

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid Category id" });

        const ProductList = await Product.find({
            categories: { $in: [id] },
        }).select("title _id categories");

        if (ProductList.length) {
            console.log(ProductList);
            const updatedProducts = Promise.all(
                ProductList.map(async (product) => {
                    let filterCategories = product.categories.filter(
                        (catRef) => catRef.toHexString() !== id
                    );
                    console.log(filterCategories, "filterCATE");
                    let updateProduct = await Product.findByIdAndUpdate(
                        product._id.toHexString(),
                        { categories: filterCategories },
                        { new: true }
                    );
                    return updateProduct;
                })
            );
            const updatedProductsResolved = await updatedProducts;
            if (!updatedProductsResolved)
                return res.status(500).json({ error: "categ ref canot deleted" });
        }
        let deletedCategory = await Category.findByIdAndRemove(id);
        if (deletedCategory) return res.status(200).json(deletedCategory);
        return res.status(404).json({ error: "the category cannot be deleted" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
