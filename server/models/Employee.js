export class Employee{
    constructor(db){
        this.db = db;
    }
   

  addEmployee(empName, email, dob, deptName, reptTo,reptToId, callback) {
    // Step 1: Check if department exists
    const deptSql = "SELECT * FROM departments WHERE dept_name = ?";
    this.db.query(deptSql, [deptName], (err, deptResult) => {
      if (err) return callback(err);

      if (deptResult.length === 0) {
        return callback(new Error("Department does not exist"));
      }

      // Step 2: Insert employee
      const sql = `
        INSERT INTO employees (name, email, DOB, Dept, Dept_Lead,lead_id)
        VALUES (?, ?, ?, ?, ?,?)
      `;
      this.db.query(sql, [empName, email, dob, deptName, reptTo,reptToId], (err2, result) => {
        if (err2) return callback(err2);
        callback(null, result);
      });
    });
  }
  listEmployees(callback) {
    const sql = "SELECT * FROM employees";
    this.db.query(sql, (err, result) => {
      if (err) return callback(err);

      const formattedResult = result.map(emp => ({
        ...emp,
        DOB: emp.DOB ? new Date(emp.DOB).toISOString().split("T")[0] : null
      }));

      callback(null, formattedResult);
    });
  }

  // ✅ Update employee dept/lead
  updateEmployee(id, dept, lead, callback) {
    if (!id) return callback(new Error("Employee ID is required"));
    if (!dept && !lead) return callback(new Error("At least one field (dept or lead) must be provided"));

    // Step 1: Get current employee
    const getCurrentEmployeeSql = "SELECT * FROM employees WHERE id = ?";
    this.db.query(getCurrentEmployeeSql, [id], (err, empResult) => {
      if (err) return callback(err);
      if (empResult.length === 0) return callback(new Error("Employee not found"));

      const currentEmployee = empResult[0];
      let finalDept = currentEmployee.Dept;
      let finalLead = currentEmployee.Dept_Lead;

      const performUpdate = () => {
        const updateSql = "UPDATE employees SET Dept = ?, Dept_Lead = ? WHERE id = ?";
        this.db.query(updateSql, [finalDept, finalLead, id], (err3) => {
          if (err3) return callback(err3);

          callback(null, {
            success: "Employee updated successfully",
            updatedFields: {
              dept: dept ? finalDept : "unchanged",
              lead: lead ? finalLead : "unchanged"
            }
          });
        });
      };

      // Step 2: If dept is provided, validate it
      if (dept) {
        const checkDeptSql = "SELECT * FROM departments WHERE dept_name = ?";
        this.db.query(checkDeptSql, [dept], (err2, deptResult) => {
          if (err2) return callback(err2);
          if (deptResult.length === 0) return callback(new Error("Department does not exist"));

          finalDept = dept;

          if (lead) {
            const checkLeadSql = "SELECT * FROM users WHERE name = ? AND role = ?";
            this.db.query(checkLeadSql, [lead, dept], (err3, leadResult) => {
              if (err3) return callback(err3);
              if (leadResult.length === 0) return callback(new Error("Lead does not exist in the given department"));

              finalLead = lead;
              performUpdate();
            });
          } else {
            performUpdate();
          }
        });
      } else {
        // Only lead is updated
        const checkLeadSql = "SELECT * FROM users WHERE name = ? AND role = ?";
        this.db.query(checkLeadSql, [lead, currentEmployee.Dept], (err2, leadResult) => {
          if (err2) return callback(err2);
          if (leadResult.length === 0) return callback(new Error("Lead does not exist in the current department"));

          finalLead = lead;
          performUpdate();
        });
      }
    });
  }

  // ✅ Delete employee
  deleteEmployee(id, callback) {
    if (!id) return callback(new Error("Employee ID is required"));

    const sql = "DELETE FROM employees WHERE id = ?";
    this.db.query(sql, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { success: "Successfully deleted" });
    });
  }
}

      
  
