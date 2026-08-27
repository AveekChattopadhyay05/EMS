import express from 'express'
import{addEmployee,listEmployees,deleteEmployee,updateEmployee} from '../controllers/employeeController.js'

const router=express.Router()

router.post("/add", addEmployee)
router.get("/list", listEmployees)
router.delete("/delete", deleteEmployee)
router.post("/update", updateEmployee)

export default router