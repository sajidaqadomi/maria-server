import express from 'express'

import { payment_post } from '../conrollers/stripe.js';

const router = express.Router()

router.post("/payment", payment_post);


export default router;
