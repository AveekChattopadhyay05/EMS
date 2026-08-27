import express from 'express'
import { addDepartment,listDepartment,deleteDepartment,updateDepartment } from "../controllers/departmentController.js";

const router=express.Router()
router.get('/list',listDepartment)
router.post('/add',addDepartment)
router.post('/update',updateDepartment)
router.delete('/delete',deleteDepartment)

export default router