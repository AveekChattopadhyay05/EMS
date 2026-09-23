import express from "express";

import {
    getAdminApprovalList,
    getAdminApprovalHistory,
    getAdminSummary
} from "../controllers/leaveController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/approve", verifyToken, getAdminApprovalList);
router.get("/approve/history", verifyToken, getAdminApprovalHistory);
router.get("/summary", verifyToken, getAdminSummary);

export default router;
