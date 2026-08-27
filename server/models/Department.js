import db from "../config/db.js";
class Department{
    static addDepartment(deptName,description){
        return new Promise((resolve,reject)=>{
            
            const addSql=`INSERT INTO departments (dept_name, description) VALUES (?, ?)`
            db.query(addSql,[deptName,description],(err,result)=>{
                if(err){
                    return reject(err)
                }
                resolve(result)
            })
        })  
    }
    static listDepartment(){
        return new Promise((resolve,reject)=>{
            const listSql=`SELECT * FROM departments`
            db.query(listSql,(err,result)=>{
                if(err){
                    return reject(err)
                }
                if(result.length===0){
                    return reject(new Error('No department found'))
                }
                resolve(result)
            })
        })
    }
    static deleteDepartment(id){
        return new Promise((resolve,reject)=>{
             if(!id){
                    return reject(new Error('Id not found'))
                }
            const delSql=`DELETE FROM departments WHERE dept_id = ?`
            db.query(delSql,[id],(err,result)=>{
               if(err){
                    return reject(err)
                }
                resolve(result)
            })
        })
    }
    static updateDepartment(oldName, newName, description){
        return new Promise((resolve,reject)=>{
            const updateSql=`UPDATE departments SET dept_name = ?, description = ? WHERE dept_name = ?`
            db.query(updateSql,[newName,description,oldName],(err,result)=>{
                if(err){
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

}
export default Department