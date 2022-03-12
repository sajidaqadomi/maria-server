import express from 'express'
import { user_get, user_get_byId, user_get_count, user_remove, user_update, user_stats } from '../conrollers/user.js'

const router = express.Router()

router.get('/', user_get)
router.get('/stats', user_stats)
router.get('/:id', user_get_byId)
router.get('/get/count', user_get_count)
router.patch('/:id', user_update)
router.delete('/:id', user_remove)

export default router