import express from "express";

import {addLead,listLeads,resetPassword,deleteLead,getLeadByEmail,updateLead} from "../controllers/leadController.js";

const router = express.Router();

router.post("/add", addLead);

router.get("/list", listLeads);

router.get("/list-emp", listLeads);

router.put("/reset-password/:email", resetPassword);

router.delete("/delete", deleteLead);

router.get("/:email", getLeadByEmail);

router.put("/update/:email", updateLead);

export default router;