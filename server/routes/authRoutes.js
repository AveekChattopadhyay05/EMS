import express from 'express'
import {
    login,
    setupAccount
} from "../controllers/authController.js";
console.log("🔥 AUTH ROUTES LOADED");
console.log("LOGIN FUNCTION:", login);

const router=express.Router()

// router.post('/login',login)
router.post('/login', (req, res, next) => {
    console.log("🔥 LOGIN ROUTE HIT");
    login(req, res, next);
});
router.post("/setup-account", setupAccount);

export default router
