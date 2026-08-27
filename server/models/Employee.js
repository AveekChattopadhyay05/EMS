import db from "../config/db.js";

class Employee {

    static addEmployee(empName,email,dob,deptName,reptTo,reptToId) {

        return new Promise((resolve, reject) => {

            const deptCheckQuery =
                `SELECT * FROM departments WHERE dept_name = ?`;

            db.query(
                deptCheckQuery,[deptName],(err, deptResult) => {

                    if (err) {
                        return reject(err);
                    }

                    if (deptResult.length === 0) {
                        return reject(
                            new Error("Department does not exist")
                        );
                    }

                    const insertSql = `
                        INSERT INTO employees
                        (name, email, DOB, Dept, Dept_Lead, lead_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        insertSql,[empName,email,dob,deptName,reptTo,reptToId],(err, insertResult) => {

                            if (err) {
                                return reject(err);
                            }

                            resolve(insertResult);
                        }
                    );
                }
            );
        });
    }
    static listEmployees(){
       return new Promise((resolve,reject)=>{
        const listEmpsql=`SELECT * FROM employees`
        db.query(listEmpsql,(err,ListResult)=>{
          if(err){
           return reject(err)
          }
          
          const formattedResult=(ListResult.map(emp=>({
            ...emp,
            DOB: emp.DOB ? new Date(emp.DOB).toISOString().split("T")[0] : null
           

          })
          
        ))
         resolve(formattedResult);

        })
       })
    }
    static deleteEmployee(id){
      return new Promise((resolve,reject)=>{
        if(!id){
          return reject(new Error('Invalid Id Provided'))
        }
        const delSql=`DELETE FROM employees WHERE id = ?`
        db.query(delSql,[id],(err,DelResult)=>{
          if(err){
            return reject(err)
          }
          resolve(DelResult)
        })
      })
    }
    static updateEmployee(id, dept, lead) {
    return new Promise((resolve, reject) => {

        if (!id) {
            return reject(new Error("Employee ID is required"));
        }

        if (!dept && !lead) {
            return reject(
                new Error("At least one field (dept or lead) must be provided")
            );
        }

        // Step 1: Get current employee
        const getCurrentEmployeeSql =
            "SELECT * FROM employees WHERE id = ?";

        db.query(
            getCurrentEmployeeSql,
            [id],
            (err, empResult) => {

                if (err) {
                    return reject(err);
                }

                if (empResult.length === 0) {
                    return reject(new Error("Employee not found"));
                }

                const currentEmployee = empResult[0];

                let finalDept = currentEmployee.Dept;
                let finalLead = currentEmployee.Dept_Lead;

                const performUpdate = () => {

                    const updateSql = `
                        UPDATE employees
                        SET Dept = ?, Dept_Lead = ?
                        WHERE id = ?
                    `;

                    db.query(
                        updateSql,
                        [finalDept, finalLead, id],
                        (err3) => {

                            if (err3) {
                                return reject(err3);
                            }

                            resolve({
                                success: "Employee updated successfully",
                                updatedFields: {
                                    dept: dept ? finalDept : "unchanged",
                                    lead: lead ? finalLead : "unchanged"
                                }
                            });
                        }
                    );
                };

                // Step 2: If department is provided, validate it
                if (dept) {

                    const checkDeptSql =
                        "SELECT * FROM departments WHERE dept_name = ?";

                    db.query(
                        checkDeptSql,
                        [dept],
                        (err2, deptResult) => {

                            if (err2) {
                                return reject(err2);
                            }

                            if (deptResult.length === 0) {
                                return reject(
                                    new Error("Department does not exist")
                                );
                            }

                            finalDept = dept;

                            // If both department and lead are being updated
                            if (lead) {

                                const checkLeadSql =
                                    "SELECT * FROM users WHERE name = ? AND role = ?";

                                db.query(
                                    checkLeadSql,
                                    [lead, dept],
                                    (err3, leadResult) => {

                                        if (err3) {
                                            return reject(err3);
                                        }

                                        if (leadResult.length === 0) {
                                            return reject(
                                                new Error(
                                                    "Lead does not exist in the given department"
                                                )
                                            );
                                        }

                                        finalLead = lead;

                                        performUpdate();
                                    }
                                );

                            } else {
                                // Only department is being updated
                                performUpdate();
                            }
                        }
                    );

                } else {

                    // Only lead is being updated
                    const checkLeadSql =
                        "SELECT * FROM users WHERE name = ? AND role = ?";

                    db.query(
                        checkLeadSql,
                        [lead, currentEmployee.Dept],
                        (err2, leadResult) => {

                            if (err2) {
                                return reject(err2);
                            }

                            if (leadResult.length === 0) {
                                return reject(
                                    new Error(
                                        "Lead does not exist in the current department"
                                    )
                                );
                            }

                            finalLead = lead;

                            performUpdate();
                        }
                    );
                }
            }
        );
    });
}
}

export default Employee;