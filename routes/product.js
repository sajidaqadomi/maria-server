import express from "express";

import {
    product_create,
    product_delete_byId,
    product_find_byId,
    product_get,
    product_getCount,
    product_get_bySearch,
    product_like,
    product_update,
} from "../conrollers/product.js";

const router = express.Router();

router.post("/", product_create);
router.get("/search", product_get_bySearch);
router.get("/:id", product_find_byId);
router.delete("/:id", product_delete_byId);
router.get("/", product_get);
router.get("/get/count", product_getCount);
router.patch("/:id", product_update);
router.patch("/:id/like", product_like);


export default router;
