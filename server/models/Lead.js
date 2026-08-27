import db from "../config/db.js";
import bcrypt from "bcrypt";
class Lead{
   static addLead(name, email, password, role) {
    return new Promise((resolve, reject) => {

        if (!name || !email || !password || !role) {
            return reject(new Error("Some parameter is missing"));
        }

        const checkSql = "SELECT * FROM employees WHERE name = ?";

        db.query(checkSql, [name], (err, result) => {

            if (err) {
                return reject(err);
            }

            if (result.length === 0) {
                return reject(new Error("Employee not found"));
            }

            const employeeId = result[0].id;
            const employeeDept = result[0].Dept;

            bcrypt.hash(password, 10, (errHash, hashedPassword) => {

                if (errHash) {
                    return reject(errHash);
                }

                const insertSql = `
                    INSERT INTO users
                    (name, email, password, role, employee_id)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [name, email, hashedPassword, role, employeeId],
                    (err2) => {

                        if (err2) {
                            return reject(err2);
                        }

                        const updateEmployeesSql = `
                            UPDATE employees
                            SET lead_id = ?
                            WHERE Dept = ? AND id != ?
                        `;

                        db.query(
                            updateEmployeesSql,
                            [employeeId, employeeDept, employeeId],
                            (err3, result3) => {

                                if (err3) {
                                    return reject(err3);
                                }

                                const updateLeadSql = `
                                    UPDATE employees
                                    SET lead_id = NULL
                                    WHERE id = ?
                                `;

                                db.query(
                                    updateLeadSql,
                                    [employeeId],
                                    (err4) => {

                                        if (err4) {
                                            return reject(err4);
                                        }

                                        resolve({
                                            success: "Lead added successfully",
                                            leadAdded: name,
                                            employeesUpdated:
                                                result3.affectedRows
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    });
}
    static getEmployeesRecursively(leadId) {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id, name, email, Dept, DOB
            FROM employees
            WHERE lead_id = ?
        `;

        db.query(sql, [leadId], async (err, employees) => {

            if (err) {
                return reject(err);
            }

            if (employees.length === 0) {
                return resolve([]);
            }

            try {

                const result = await Promise.all(
                    employees.map(async (emp) => {

                        const nestedEmployees =
                            await Lead.getEmployeesRecursively(emp.id);

                        return {
                            ...emp,
                            DOB: emp.DOB
                                ? new Date(emp.DOB)
                                    .toISOString()
                                    .split("T")[0]
                                : null,

                            employees: nestedEmployees,

                            employeeCount:
                                nestedEmployees.length
                        };
                    })
                );

                resolve(result);

            } catch (err) {
                reject(err);
            }
        });
    });
}
    static listLeads() {
    return new Promise((resolve, reject) => {

        const getLeadsSql =
            'SELECT id, name, email, role, employee_id FROM users WHERE role != "admin"';

        db.query(getLeadsSql, async (err, leads) => {

            if (err) {
                return reject(err);
            }

            if (leads.length === 0) {
                return resolve([]);
            }

            try {

                const result = await Promise.all(
                    leads.map(async (lead) => {

                        const employees =
                            await Lead.getEmployeesRecursively(
                                lead.employee_id
                            );

                        return {
                            ...lead,
                            employees,
                            employeeCount: employees.length
                        };
                    })
                );

                resolve(result);

            } catch (err) {
                reject(err);
            }
        });
    });
}
    static resetPassword(email, newPassword) {
    return new Promise((resolve, reject) => {

        if (!newPassword) {
            return reject(new Error("New password required"));
        }

        bcrypt.hash(newPassword, 10, (err, hashed) => {

            if (err) {
                return reject(err);
            }

            const sql = "UPDATE users SET password = ? WHERE email = ?";

            db.query(sql, [hashed, email], (err2, result) => {

                if (err2) {
                    return reject(err2);
                }

                if (result.affectedRows === 0) {
                    return reject(new Error("Lead not found"));
                }

                resolve({
                    success: "Password reset successfully"
                });
            });
        });
    });
}
 static deleteLead(email) {
    return new Promise((resolve, reject) => {

        const sql = "DELETE FROM users WHERE email = ?";

        db.query(sql, [email], (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve({
                success: "Successfully deleted"
            });
        });
    });
}
 static getLeadByEmail(email) {
    return new Promise((resolve, reject) => {

        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], (err, result) => {

            if (err) {
                return reject(err);
            }

            if (result.length === 0) {
                return reject(new Error("User not found"));
            }

            resolve(result[0]);
        });
    });
}
 static updateLead(email, newName, newEmail, password) {
    return new Promise((resolve, reject) => {

        if (!newName || !newEmail) {
            return reject(new Error("Name and email required"));
        }

        const getUserSql = "SELECT * FROM users WHERE email = ?";

        db.query(getUserSql, [email], (err, result) => {

            if (err) {
                return reject(err);
            }

            if (result.length === 0) {
                return reject(new Error("User not found"));
            }

            const updateUser = (hashedPassword) => {

                let sql;
                let params;

                if (hashedPassword) {

                    sql =
                        "UPDATE users SET name=?,email=?,password=? WHERE email=?";

                    params = [
                        newName,
                        newEmail,
                        hashedPassword,
                        email
                    ];

                } else {

                    sql =
                        "UPDATE users SET name=?,email=? WHERE email=?";

                    params = [
                        newName,
                        newEmail,
                        email
                    ];
                }

                db.query(sql, params, (err2) => {

                    if (err2) {
                        return reject(err2);
                    }

                    resolve({
                        message: "User updated successfully"
                    });
                });
            };

            if (password && password.trim() !== "") {

                bcrypt.hash(password, 10, (errHash, hashed) => {

                    if (errHash) {
                        return reject(errHash);
                    }

                    updateUser(hashed);
                });

            } else {

                updateUser(null);
            }
        });
    });
}
}
export default Lead