import express from "express";

import {
    orders_get,
    orders_get_income,
    order_create,
    order_delete,
    order_get_byUserId,
    order_update_byId,
} from "../conrollers/order.js";

const router = express.Router();

router.post("/", order_create);
router.get("/income", orders_get_income);
router.get("/:id", order_get_byUserId);
router.delete("/:id", order_delete);
router.get("/", orders_get);
router.patch("/:id", order_update_byId);

export default router;
