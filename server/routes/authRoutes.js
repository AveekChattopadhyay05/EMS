import express from 'express'
import {
    login,
    setupAccount
} from "../controllers/authController.js";
const router=express.Router()

router.post('/login',login)
router.post("/setup-account", setupAccount);

export default router
