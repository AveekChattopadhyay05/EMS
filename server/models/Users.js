import db from "../config/db.js";
import bcrypt from "bcrypt";

class User {

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(result);
                }
            );
        });
    }

    static setupAccount(email, password) {
        return new Promise((resolve, reject) => {

            if (!email || !password) {
                return reject(new Error("All fields required"));
            }

            // Check whether employee exists
            const employeeSql =
                "SELECT * FROM employees WHERE email = ?";

            db.query(employeeSql, [email], (err, empResult) => {

                if (err) {
                    return reject(err);
                }

                if (empResult.length === 0) {
                    return reject(
                        new Error("Email not found in employees")
                    );
                }

                const employee = empResult[0];

                // Check whether account already exists
                const userSql =
                    "SELECT * FROM users WHERE email = ?";

                db.query(userSql, [email], async (err, userResult) => {

                    if (err) {
                        return reject(err);
                    }

                    if (userResult.length > 0) {
                        return reject(
                            new Error("Account already exists")
                        );
                    }

                    try {

                        const hashedPassword =
                            await bcrypt.hash(password, 10);

                        const insertSql = `
                            INSERT INTO users
                            (employee_id, name, email, password, role)
                            VALUES (?, ?, ?, ?, 'employee')
                        `;

                        db.query(
                            insertSql,
                            [
                                employee.id,
                                employee.name,
                                email,
                                hashedPassword
                            ],
                            (err, result) => {

                                if (err) {
                                    return reject(err);
                                }

                                resolve({
                                    message:
                                        "Account created successfully"
                                });
                            }
                        );

                    } catch (err) {
                        reject(err);
                    }
                });
            });
        });
    }
}

export default User;