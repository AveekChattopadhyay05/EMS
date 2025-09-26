import mysql from 'mysql';
import bcrypt from 'bcrypt';

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'aveekSql123',
    database: 'ems'
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");

  // 1. Departments table
  const createDepartmentsTable = `
    CREATE TABLE IF NOT EXISTS departments(
      dept_id INT AUTO_INCREMENT PRIMARY KEY,
      dept_name VARCHAR(50),
      description VARCHAR(50)
    );
  `;

  // 2. Employees table 
  const createEmployeesTable = `
    CREATE TABLE IF NOT EXISTS employees(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      DOB DATE,
      Dept VARCHAR(50),
      Dept_Lead VARCHAR(50)
    );
  `;

  // 3. Users (Leads/Admins) table (nullable employee_id for admins)
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NULL,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
  `;

  // Create in correct order
  db.query(createDepartmentsTable, (err) => {
    if (err) throw err;
    console.log("Departments table ready");

    db.query(createEmployeesTable, (err) => {
      if (err) throw err;
      console.log("Employees table ready");

      db.query(createUsersTable, (err) => {
        if (err) throw err;
        console.log("Users table ready");

        // ✅ Insert default admin (no employee_id)
        const checkAdminSql = 'SELECT * FROM users WHERE email = ?';
        db.query(checkAdminSql, ['admin@gmail.com'], (err, result) => {
          if (err) throw err;

          if (result.length === 0) {
            const plainPassword = "admin123";
            const saltRounds = 10;

            bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
              if (err) throw err;

              const insertUser = `
                INSERT INTO users (name, employee_id, email, password, role) 
                VALUES (?, ?, ?, ?, ?)
              `;
              const values = ["admin", null, "admin@gmail.com", hashedPassword, "admin"];

              db.query(insertUser, values, (err) => {
                if (err) throw err;
                console.log("Admin user inserted");
              });
            });
          } else {
            console.log("Admin user already exists");
          }
        });
      });
    });
  });
});

export default db;
