import express from "express";

import {
    getAdminLeaves,
    getSummary,
    applyLeave,
    cancelLeave,
    getHistory,
    getPendingApprovals,
    approveLeave,
    rejectLeave,
    getApprovalHistory
} from "../controllers/leaveController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/admin", verifyToken, getAdminLeaves);

router.get("/summary", verifyToken, getSummary);

router.post("/apply", verifyToken, applyLeave);

router.delete("/:id", verifyToken, cancelLeave);

router.get("/history", verifyToken, getHistory);

router.get("/approve", verifyToken, getPendingApprovals);

router.put("/approve/:id", verifyToken, approveLeave);

router.put("/reject/:id", verifyToken, rejectLeave);

router.get("/approve/history", verifyToken, getApprovalHistory);

export default router;