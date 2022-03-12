import mongoose from "mongoose";
import Cart from "../models/cart.js";
import OrderItem from "../models/orderItem.js"

export const orderItem_update_byId = async (req, res) => {
    const { id } = req.params
    const order = req.body
    const { isAdmin, id: userId } = req.user;

    if (false)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid OrderItem id" });

        const updatedOrder = await OrderItem.findByIdAndUpdate(id, { ...order }, { new: true })

        if (updatedOrder) return res.status(200).json(updatedOrder);
        return res.status(404).json({ error: "the OrderItem cannot be updated" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }


}

export const orderItem_remove_byId = async (req, res) => {
    const { id } = req.params
    // const order = req.body
    const { isAdmin, id: userId } = req.user;

    // if (!(isAdmin || userId == id))
    //     return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ error: "Invalid OrderItem id" });

        //  const orderItem= await OrderItem.findById(id)

        const currCart = await Cart.findOne({ userId })
        console.log(currCart, 'currCart')
        if (currCart) {
            let newOrderItem = currCart.products.filter(ref => ref.toHexString() !== id)
            console.log(newOrderItem, ' newOrderItem')
            let updatedCart = await Cart.findOneAndUpdate({ userId }, { products: newOrderItem, quantity: newOrderItem.length }, { new: true })
            if (updatedCart) {
                let deletedItem = await OrderItem.findByIdAndDelete(id).populate({ path: "product" })
                if (deletedItem) return res.status(200).json(deletedItem);
            }

        }

        return res.status(404).json({ error: "the OrderItem cannot be deleted" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }


}