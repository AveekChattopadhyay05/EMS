import Employee from "../models/Employee.js";

const addEmployee = async (req, res, next) => {
    try {

        const {empName,email,dob,deptName,reptTo,reptToId} = req.body;

        const result = await Employee.addEmployee(empName,email,dob,deptName,reptTo,reptToId);
        return res.status(200).json({
           success:true,
           message:'Employee added successfully'

        });

    } catch (err) {

        next(err);

    }
};
const listEmployees=async (req,res,next)=>{
    try{
        const result=await Employee.listEmployees()
        return res.status(200).json(result)
    }
    catch(err){
        next(err)
    }
}
const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.body;

        const result = await Employee.deleteEmployee(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            message: "Employee deleted successfully"
        });

    } catch (err) {
        next(err);
    }
}
const updateEmployee=async(req,res,next)=>{
    try{
       const{id,dept,lead}=req.body
       const result=await Employee.updateEmployee(id,dept,lead)
       return res.status(200).json({message:'Employee updated successfully'})
       
    }
    catch(err){
        next(err)
    }

}
export {
    addEmployee,
    listEmployees,
    deleteEmployee,
    updateEmployee
};
