import mongoose from "mongoose";

import Product from "../models/product.js";
import Category from "../models/category.js";
//http//locahost:5000/products?categoriey=,
export const product_get = async (req, res) => {
    // console.log(req.query, 'req-quer')
    const qCategory = req.query?.category;
    const qNew = req.query?.new;
    const qTarget = req.query?.target
    const qLikeId = req.query?.likeId

    let filter = {};
    if (qCategory) filter = { categories: { $in: [...qCategory.split(",")] } };
    if (qLikeId) filter = { likes: { $in: [...qLikeId.split(",")] } }
    if (qTarget) filter = { targetGender: qTarget };
    if (qTarget && qCategory) filter = { targetGender: qTarget, categories: { $in: [...qCategory.split(",")] } };


    try {
        const productList = qNew
            ? await Product.find().sort({ _id: -1 }).limit(5)
            : await Product.find(filter).sort({ _id: -1 });
        //  return res.status(404).json({ error: 'Cannot found the productList' })//err
        if (productList) return res.status(200).json(productList);
        return res.status(404).json({ error: 'Cannot found the productList' });

    } catch (error) {
        return res.status(500).json({ error });
    }
};

//search//
export const product_get_bySearch = async (req, res) => {
    // console.log(req.query, 'req-quer')
    //  return res.status(404).json({ error: "Search cannot found" });//err
    const searchQuery = req.query.searchQuery?.trim();

    const reqQuery = new RegExp("\\b" + searchQuery + "\\b", "ig")

    try {
        const productList = await Product.aggregate([
            {
                $lookup:
                {
                    from: "categories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "category_docs",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                catTitle: '$title',
                                catDesc: '$cat',
                                mainCat: {
                                    $reduce: {
                                        input: "$mainCat",
                                        initialValue: "",
                                        in: { $concat: ["$$value", "$$this", " "] }
                                    }
                                }
                            },

                        },

                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: [
                                        { $arrayElemAt: ["$category_docs", 0] },
                                        "$$ROOT",
                                    ],
                                },
                            },
                        }

                    ],



                },

            },
            { $unwind: "$category_docs" },

            {
                $match: {
                    $expr: {
                        $or: [

                            { $regexMatch: { input: "$title", regex: reqQuery } },
                            { $regexMatch: { input: "$desc", regex: reqQuery } },
                            { $regexMatch: { input: "$category_docs.catTitle", regex: reqQuery } },
                            { $regexMatch: { input: "$category_docs.catDesc", regex: reqQuery } },
                            { $regexMatch: { input: "$category_docs.mainCat", regex: reqQuery } },

                        ]
                    }
                }
            },
        ])

        if (productList) return res.status(200).json(productList);
        return res.status(404).json({ error: 'Cannot found the products' });

    } catch (error) {
        return res.status(500).json({ error });
    }
};
////
export const product_create = async (req, res) => {
    const product = req.body;
    const { isAdmin } = req.user;

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    let newProduct = new Product({ ...product });
    try {
        //check category

        if (product.categories) {
            const categoryList = await Category.find({
                _id: { $in: [...product.categories] },
            });
            if (categoryList.length !== product.categories.length)
                return res.status(404).json({ error: "Invalid category" });
        }

        newProduct = await newProduct.save();
        if (newProduct) return res.status(201).json(newProduct);
        return res.status(400).json({ error: "Cannot create product" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const product_update = async (req, res) => {
    const product = req.body;
    const { id } = req.params;
    const { isAdmin } = req.user;

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid Product id" });

        let updatedProduct = await Product.findByIdAndUpdate(
            id,
            { ...product },
            { new: true }
        );

        if (updatedProduct) return res.status(200).json(updatedProduct);
        return res.status(404).json({ error: "the product cannot be updated" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
export const product_find_byId = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid product id" });

        let product = await Product.findById(id).populate("categories");
        // return res.status(404).json({ error: "the product cannot found" });//err


        if (product) return res.status(200).json(product);
        return res.status(404).json({ error: "the product cannot found" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
export const product_delete_byId = async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.user;

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });
    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid product id" });

        let product = await Product.findByIdAndRemove(id);

        if (product) return res.status(200).json(product);
        return res.status(400).json({ error: "the product cannot delete" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
export const product_getCount = async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        return res.status(200).json({ productCount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const product_like = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    if (!userId) return res.json({ error: "Unauthenticated" })

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No product with that id')

    try {

        let product = await Product.findById(id)

        let likeIndex = product.likes.findIndex(likeRef => {
            console.log(likeRef, userId, 'ref,id')
            return likeRef.toHexString() === userId
        })

        if (likeIndex >= 0) {
            product.likes = product.likes.filter(likeRef => likeRef.toHexString() !== userId)
        } else {
            product.likes = [...product.likes, userId]
        }
        let updateProduct = await Product.findByIdAndUpdate(id, { likes: product.likes }, { new: true })
        res.status(201).json(updateProduct)
    } catch (error) {
        res.status(409).json({ error: error.message })

    }

}
