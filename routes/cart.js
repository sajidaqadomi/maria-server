import express from "express";

import {
    add_to_cart,
    carts_get,
    cart_create,
    cart_delete,
    cart_get_byUserId,
    cart_update_byId,
    clear_cart_byUserId,
} from "../conrollers/cart.js";
import { orderItem_remove_byId, orderItem_update_byId } from "../conrollers/orderItem.js";

const router = express.Router();

router.post("/", cart_create);
router.get("/:id", cart_get_byUserId);
router.delete("/:id", cart_delete);
router.get("/", carts_get);
router.patch("/:id", cart_update_byId);
router.patch("/add/:id", add_to_cart);
router.patch("/clear/:id", clear_cart_byUserId);
router.patch("/orderitem/:id", orderItem_update_byId)
router.delete("/orderitem/:id", orderItem_remove_byId)

export default router;
