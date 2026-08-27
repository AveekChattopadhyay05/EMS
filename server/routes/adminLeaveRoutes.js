import express from "express";

import {
    getAdminApprovalList,getAdminSummary
} from "../controllers/leaveController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/approve", verifyToken, getAdminApprovalList);
router.get("/summary",verifyToken,getAdminSummary);
export default router;

