import mongoose from "mongoose";
import Cart from "../models/cart.js";
import OrderItem from "../models/orderItem.js";

export const carts_get = async (req, res) => {
    const { isAdmin } = req.user;
    if (!isAdmin)
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        const cartList = await Cart.find();
        if (cartList) return res.status(200).json(cartList);
        return res.status(404).json({ error: "carts cannot be found" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const cart_get_byUserId = async (req, res) => {

    const { isAdmin, id: userId } = req.user;
    const { id } = req.params;
    console.log(id, "userid")
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid user id" });

    if (!(isAdmin || userId == id))
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        let cart = await Cart.findOne({ userId: id });
        console.log(cart, 'Cart')
        cart = cart.products.length ? await cart.populate({ path: "products", populate: { path: "product" } }) : (cart)

        if (cart) return res.status(200).json(cart);

        return res.status(404).json({ error: "cart cannot be found " });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const cart_create = async (req, res) => {
    const newCart = req.body;

    let cart = new Cart(newCart);
    try {
        cart = await cart.save();
        if (cart) return res.status(201).json(cart);
        return res.status(400).json({ error: "Cannot create cart" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const cart_update_byId = async (req, res) => {
    const { id } = req.params;
    const cartData = req.body;
    const { isAdmin, id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid cart id" });

    try {
        const oldCart = await Cart.findById(id);
        if (!(isAdmin || oldCart._userId.toHexString() == userId))
            return res.status(403).json({ error: "You are not alowed to do that!" });

        const cartUpdate = await Cart.findByIdAndUpdate(
            id,
            { $set: cartData },
            { new: true }
        );

        if (cartUpdate) return res.status(200).json(cartUpdate);
        return res.status(400).json({ error: "the cart cannot be updated" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const add_to_cart = async (req, res) => {
    const { id } = req.params;
    const product = req.body;
    const { isAdmin, id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid cart id" });


    try {
        const oldCart = await Cart.findById(id);
        if (!(isAdmin || oldCart.userId.toHexString() == userId))
            return res.status(403).json({ error: "You are not alowed to do that!" });
        //save order Item
        let newOrderItem = new OrderItem({ ...product })
        newOrderItem = await newOrderItem.save()

        if (newOrderItem) {
            console.log(newOrderItem)
            //add to cart
            let updateProducts = [...oldCart.products, newOrderItem._id]

            const cartUpdate = await Cart.findByIdAndUpdate(
                id,
                { products: updateProducts, quantity: updateProducts.length },
                { new: true }
            ).populate({ path: "products", populate: { path: "product" } })

            let orderItem = await newOrderItem.populate('product')
            if (cartUpdate) return res.status(200).json({ cart: cartUpdate, orderItem });

        }
        return res.status(400).json({ error: "the cart cannot be updated" });





    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}

export const cart_delete = async (req, res) => {
    const { id } = req.params
    const { isAdmin, id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid cart id" });

    try {
        const oldCart = await Cart.findById(id);
        if (!(isAdmin || oldCart._userId.toHexString() == userId))
            return res.status(403).json({ error: "You are not alowed to do that!" });

        const deletedCart = await Cart.findByIdAndDelete(id);
        if (deletedCart) return res.status(200).json("Cart has been deleted...");
        return res.status(400).json({ error: 'Cart cannot delete' })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
////////////////router.patch("/clear/:id", clear_cart_byUserId);
export const clear_cart_byUserId = async (req, res) => {
    const { isAdmin, id: userId } = req.user;
    const { id } = req.params;
    // console.log(id, "userid")
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ error: "Invalid user id" });

    if (!(isAdmin || userId == id))
        return res.status(403).json({ error: "You are not alowed to do that!" });

    try {
        let cart = await Cart.findOne({ userId: id });
        //  console.log(cart, 'Cart')
        //cart = cart.products.length ? await cart.populate({ path: "products", populate: { path: "product" } }) : (cart)
        //im not remove order item till resive order
        if (cart) {
            const cartClear = await Cart.findByIdAndUpdate(
                cart._id,
                { $set: { products: [], quantity: 0 } },
                { new: true }


            );
            if (cartClear) return res.status(200).json(cartClear)
            return res.status(404).json({ error: "Cart cannot be Clear " });
        };

        return res.status(404).json({ error: "cart cannot be found " });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

