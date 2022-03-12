import express from "express";

import {
    category_create,
    category_delete_byId,
    category_find_byId,
    category_get,
    category_update,
} from "../conrollers/category.js";

const router = express.Router();

router.post("/", category_create);
router.get("/:id", category_find_byId);
router.delete("/:id", category_delete_byId);
router.get("/", category_get);
router.patch("/:id", category_update);

export default router;
