import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Order from "../models/order.js";

export const orders_get = async (req, res) => {
    const { isAdmin } = req.user;

    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        const orderList = await Order.find();
        if (orderList) return res.status(200).json(orderList);
        return res.status(404).json({ error: "Orders cannot be found" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const orders_get_income = async (req, res) => {
    const { isAdmin } = req.user;
    const productId = req.query.pid;


    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const prevMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

    //put pipline ouside to solve Arguments must be aggregate pipeline operators
    //////
    let agregPipline = [{
        $match: {
            createdAt: { $gte: prevMonth },
        },
    },



    {
        $project: {
            month: { $substr: ["$createdAt", 5, 2] },
            sales: "$amount",
            ...(productId && {
                sales: {
                    $reduce: {
                        input: "$orderItem-doc",
                        initialValue: { sum: 0 },
                        in: {
                            sum: { $add: ["$$value.sum", "$$this.totalProduct"] },
                        },
                    },
                },

            })

        },
    },
    {
        $group: {
            _id: "$month",
            total: {
                ...(productId ? {
                    $sum: "$sales.sum"
                } : { $sum: "$sales" })
            },
        },
    },
    {
        $sort: {
            _id: -1,
        },
    },
    ]

    if (productId) {
        let lookup = {

            $lookup: {
                from: "orderitems",
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$product", mongoose.Types.ObjectId(productId)] },
                        },
                    },
                    {
                        $lookup: {
                            from: "products",
                            let: { productQ: "$quantity" },
                            as: "product-doc",
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ["$_id", mongoose.Types.ObjectId(productId)] },
                                    },
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        totalProduct: { $multiply: ["$price", "$$productQ"] },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: [
                                    { $arrayElemAt: ["$product-doc", 0] },
                                    "$$ROOT",
                                ],
                            },
                        },
                    },
                ],
                as: "orderItem-doc",
            },

        }
        agregPipline.unshift(lookup)
    }
    //////

    try {
        const orderList = await Order.aggregate(agregPipline);

        if (orderList) return res.status(200).json(orderList);

        return res.status(404).json({ error: "Orders cannot be found" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const order_get_byUserId = async (req, res) => {
    const { isAdmin, id: userId } = req.user;
    const id = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid user id" });

    if (!(isAdmin || userId == id))
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        const order = await Cart.find({ userId: id });
        if (order) return res.status(200).json(order);
        return res.status(404).json({ error: "Order cannot be found" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const order_create = async (req, res) => {
    const newOrder = req.body;

    let order = new Order(newOrder);
    try {
        order = await order.save();
        if (order) return res.status(201).json(order);
        return res.status(400).json({ error: "Cannot create order" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const order_update_byId = async (req, res) => {
    const { id } = req.params;
    const orderData = req.body;
    const { isAdmin, id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid order id" });

    try {
        const oldOrder = await Cart.findById(id);
        if (!(isAdmin || oldOrder._userId.toHexString() == userId))
            return res.status(403).json({ error: "You are not alowed to do that!" });

        const orderUpdate = await Order.findByIdAndUpdate(
            id,
            { $set: orderData },
            { new: true }
        );

        if (orderUpdate) return res.status(200).json(orderUpdate);
        return res.status(400).json({ error: "the order cannot be updated" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const order_delete = async (req, res) => {
    const { id } = req.params;
    const { isAdmin, id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid order id" });

    try {
        const oldOrder = await Order.findById(id);
        if (!(isAdmin || oldOrder._userId.toHexString() == userId))
            return res.status(403).json({ error: "You are not alowed to do that!" });

        const deletedOrder = await Order.findByIdAndDelete(id);
        if (deletedOrder) return res.status(200).json("Order has been deleted...");
        return res.status(400).json({ error: "Ordert cannot delete" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
