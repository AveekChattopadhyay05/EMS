import Department from "../models/Department.js";

const addDepartment=async(req,res,next)=>{
    try{
        const {deptName,description}=req.body
        await Department.addDepartment(deptName,description)
        return res.status(201).json({message:'Successfully added department'})

    }
    catch(err){
        next(err)
    }

}
const listDepartment=async(req,res,next)=>{
    try{
         const result=await Department.listDepartment()
         return res.status(200).json(result)
         
    }
    catch(err){
        next(err)
    }
}
const deleteDepartment=async(req,res,next)=>{
    try{
        const {id}=req.body
        await Department.deleteDepartment(id)
        return res.status(200).json({message:'Successfully deleted'})

    }
    catch(err){
        next(err)
    }
}
const updateDepartment=async(req,res,next)=>{
    try{
        const{oldName,newName,description}=req.body
        await Department.updateDepartment(oldName,newName,description)
        return res.status(200).json({message:'Successfully updated'})

    }
    catch(err){
        next(err)
    }
}
export {listDepartment,addDepartment,deleteDepartment,updateDepartment}