import bcrypt from "bcrypt";

export class Lead {
  constructor(db) {
    this.db = db;
  }

  // ✅ Add a new lead
  addLead(name, email, password, role, callback) {
    if (!name || !email || !password || !role) {
      return callback(new Error("Some parameter is missing"));
    }

    const saltRounds = 10;

    // Step 1: Check if employee exists
    const checkSql = "SELECT * FROM employees WHERE name = ?";
    this.db.query(checkSql, [name], (err, result) => {
      if (err) return callback(err);
      if (result.length === 0) {
        return callback(new Error("This lead does not exist in employees"));
      }

      const employeeId = result[0].id;
      const employeeDept = result[0].Dept;

      // Step 2: Hash password and insert into users
      bcrypt.hash(password, saltRounds, (errHash, hashedPassword) => {
        if (errHash) return callback(errHash);

        const insertSql = `
          INSERT INTO users (name, email, password, role, employee_id)
          VALUES (?, ?, ?, ?, ?)
        `;
        this.db.query(insertSql, [name, email, hashedPassword, role, employeeId], (err2) => {
          if (err2) return callback(err2);

          // Step 3: Update employees in dept to this new lead
          const updateEmployeesSql =
            "UPDATE employees SET Dept_Lead = ? WHERE Dept = ? AND name != ?";
          this.db.query(updateEmployeesSql, [name, employeeDept, name], (err3, result3) => {
            if (err3) return callback(err3);

            // Step 4: Set the new lead’s own Dept_Lead = 'admin'
            const updateNewLeadSql =
              "UPDATE employees SET Dept_Lead = 'admin' WHERE name = ?";
            this.db.query(updateNewLeadSql, [name], (err4, result4) => {
              if (err4) return callback(err4);

              callback(null, {
                success: "Lead added successfully and employees updated",
                leadAdded: name,
                department: employeeDept,
                employeesUpdated: result3.affectedRows,
                newLeadSetToAdmin: result4.affectedRows,
              });
            });
          });
        });
      });
    });
  }

  // ✅ List all leads
  listLeads(callback) {
  console.log("🔍 Starting recursive listLeads");

  const getLeadsSql = 'SELECT name, email, role FROM users WHERE role != "admin"';

  // Helper function to recursively fetch employees
  const getEmployeesRecursively = (leadName, done) => {
    const getEmployeesSql = 'SELECT id, name, email, Dept, DOB FROM employees WHERE Dept_Lead = ?';
    this.db.query(getEmployeesSql, [leadName], async (err, employees) => {
      if (err) {
        console.error(`❌ Error fetching employees for lead ${leadName}:`, err);
        return done([]);
      }

      if (employees.length === 0) {
        return done([]);
      }

      let completed = 0;
      const result = [];

      employees.forEach((emp, idx) => {
        // Check if this employee is also a lead (exists in users)
        const checkLeadSql = 'SELECT name, email, role FROM users WHERE name = ?';
        this.db.query(checkLeadSql, [emp.name], (leadErr, leadRows) => {
          if (leadErr) {
            console.error(`❌ Error checking if ${emp.name} is a lead:`, leadErr);
          }

          if (leadRows && leadRows.length > 0) {
            // Recursive call if the employee is also a lead
            getEmployeesRecursively(emp.name, (nestedEmployees) => {
              result[idx] = {
                ...emp,
                DOB: emp.DOB ? new Date(emp.DOB).toISOString().split('T')[0] : null,
                employees: nestedEmployees,
                employeeCount: nestedEmployees.length
              };
              completed++;
              if (completed === employees.length) done(result);
            });
          } else {
            // Normal employee (no subordinates)
            result[idx] = {
              ...emp,
              DOB: emp.DOB ? new Date(emp.DOB).toISOString().split('T')[0] : null,
              employees: [],
              employeeCount: 0
            };
            completed++;
            if (completed === employees.length) done(result);
          }
        });
      });
    });
  };

  // Main query to get all top-level leads
  this.db.query(getLeadsSql, (err, leads) => {
    if (err) {
      console.error("❌ Error fetching leads:", err);
      return callback(err);
    }

    console.log("✅ Found", leads.length, "leads");

    if (leads.length === 0) return callback(null, []);

    const leadsWithEmployees = [];
    let doneCount = 0;

    leads.forEach((lead, idx) => {
      getEmployeesRecursively(lead.name, (employees) => {
        leadsWithEmployees[idx] = {
          ...lead,
          employees,
          employeeCount: employees.length
        };

        doneCount++;
        if (doneCount === leads.length) {
          console.log("🎉 All leads processed");
          callback(null, leadsWithEmployees);
        }
      });
    });
  });
}


  // ✅ Reset password
  resetPassword(id, newPassword, callback) {
    if (!newPassword) return callback(new Error("New password is required"));

    const saltRounds = 10;
    bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
      if (err) return callback(err);

      const updateSql = "UPDATE users SET password = ? WHERE id = ?";
      this.db.query(updateSql, [hashedPassword, id], (err2, result) => {
        if (err2) return callback(err2);
        if (result.affectedRows === 0) return callback(new Error("Lead not found"));
        callback(null, { success: "Password reset successfully" });
      });
    });
  }

  // ✅ Delete lead
  deleteLead(id, callback) {
    if (!id) return callback(new Error("ID not given"));

    const sql = "DELETE FROM users WHERE email = ?";
    this.db.query(sql, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { success: "Successfully deleted" });
    });
  }

  // ✅ Get lead by email
  getLeadByEmail(email, callback) {
    const query = "SELECT * FROM users WHERE email = ?";
    this.db.query(query, [email], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error("User not found"));
      callback(null, results[0]);
    });
  }

  // ✅ Update lead by email + sync Dept_Lead
  updateLead(email, newName, newEmail, password, callback) {
    if (!newName || !newEmail) {
      return callback(new Error("Name and email are required"));
    }

    const getOldNameSql = "SELECT name FROM users WHERE email = ?";
    this.db.query(getOldNameSql, [email], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error("User not found"));

      const oldName = results[0].name.trim();
      const trimmedNewName = newName.trim();

      const runUserUpdate = (sql, params) => {
        this.db.query(sql, params, (err2, result) => {
          if (err2) return callback(err2);
          if (result.affectedRows === 0) return callback(new Error("User not found"));

          // ✅ Step 2: Sync employees’ Dept_Lead
          const updateEmployeesSql =
            "UPDATE employees SET Dept_Lead = ? WHERE Dept_Lead = ? AND name != ?";
          this.db.query(
            updateEmployeesSql,
            [trimmedNewName, oldName, trimmedNewName],
            (err3, result3) => {
              if (err3) return callback(err3);

              // Update previous lead to report to new lead
              const updatePreviousLeadSql =
                "UPDATE employees SET Dept_Lead = ? WHERE name = ? AND Dept_Lead = 'admin'";
              this.db.query(
                updatePreviousLeadSql,
                [trimmedNewName, oldName],
                (err4, result4) => {
                  if (err4) return callback(err4);

                  // New lead should report to admin
                  const updateNewLeadSql =
                    "UPDATE employees SET Dept_Lead = 'admin' WHERE name = ?";
                  this.db.query(updateNewLeadSql, [trimmedNewName], (err5, result5) => {
                    if (err5) return callback(err5);

                    callback(null, {
                      message: "User updated successfully",
                      employeesUpdated: result3.affectedRows,
                      previousLeadUpdated: result4.affectedRows,
                      newLeadSetToAdmin: result5.affectedRows,
                      oldName: oldName,
                      newName: trimmedNewName,
                    });
                  });
                }
              );
            }
          );
        });
      };

      // Step 1: Update users table (with or without password)
      if (password && password.trim() !== "") {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (errHash, hashedPassword) => {
          if (errHash) return callback(errHash);

          const updateUserSql =
            "UPDATE users SET name = ?, email = ?, password = ? WHERE email = ?";
          runUserUpdate(updateUserSql, [trimmedNewName, newEmail, hashedPassword, email]);
        });
      } else {
        const updateUserSql =
          "UPDATE users SET name = ?, email = ? WHERE email = ?";
        runUserUpdate(updateUserSql, [trimmedNewName, newEmail, email]);
      }
    });
  }
  listLeadsWithEmployees(callback) {
  console.log("🔍 Starting listLeadsWithEmployees");
  
  // First get all leads (exclude admin)
  const getLeadsSql = 'SELECT id, name, email, role FROM users WHERE role != "admin"';
  
  this.db.query(getLeadsSql, (err, leads) => {
    if (err) {
      console.error("❌ Error fetching leads:", err);
      return callback(err);
    }

    console.log("✅ Fetched leads:", leads);
    console.log("📊 Number of leads found:", leads.length);

    if (leads.length === 0) {
      console.log("📭 No leads found, returning empty array");
      return callback(null, []);
    }

    // For each lead, get their employees
    const leadsWithEmployees = [];
    let completedRequests = 0;

    console.log("🔄 Starting to fetch employees for each lead...");

    leads.forEach((lead, index) => {
      console.log(`🔍 Fetching employees for lead: ${lead.name} (index: ${index})`);
      
      const getEmployeesSql = 'SELECT id, name, email, Dept, DOB FROM employees WHERE Dept_Lead = ?';
      
      this.db.query(getEmployeesSql, [lead.name], (empErr, employees) => {
        if (empErr) {
          console.error(`❌ Error fetching employees for lead ${lead.name}:`, empErr);
          employees = []; // Continue with empty array if error
        } else {
          console.log(`✅ Found ${employees.length} employees for lead ${lead.name}:`, employees);
        }

        // Format employee DOB
        const formattedEmployees = employees.map(emp => ({
          ...emp,
          DOB: emp.DOB ? new Date(emp.DOB).toISOString().split('T')[0] : null
        }));

        leadsWithEmployees[index] = {
          ...lead,
          employees: formattedEmployees,
          employeeCount: formattedEmployees.length
        };

        completedRequests++;
        console.log(`📈 Completed ${completedRequests}/${leads.length} lead queries`);

        // When all requests are completed, send response
        if (completedRequests === leads.length) {
          console.log("🎉 All lead queries completed, preparing final response");
          
          // Sort by lead name for consistent ordering
          leadsWithEmployees.sort((a, b) => a.name.localeCompare(b.name));
          
          console.log("📤 Final response data:", leadsWithEmployees);
          callback(null, leadsWithEmployees);
        }
      });
    });
  });
}
}

