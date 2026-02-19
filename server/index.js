import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import db from "./config/db.js";// ✅ import db connection
import { Department } from "./models/Department.js";
import { Employee } from "./models/Employee.js";
import { Lead } from "./models/Lead.js";
import jwt from "jsonwebtoken";
const app = express();
const PORT = 5000;

// ✅ Allow frontend origin
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

// ✅ Initialize models with db
const departmentModel = new Department(db);
const employeeModel = new Employee(db);
const leadModel = new Lead(db);
// ---------------------------------------------
// Root + Auth
// ---------------------------------------------
app.get("/", (req, res) => {
  res.send("Hello I am Aveek");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (cmpErr, isMatch) => {
      if (cmpErr) {
        return res.status(500).json({ error: "Error checking password" });
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Wrong password" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        "yourSecretKey",
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        message: "User Login Successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
});

/* ===========================
   DEPARTMENT ROUTES
=========================== */
app.post("/api/department/add", (req, res) => {
  const { deptName,description } = req.body;
  departmentModel.addDepartment(deptName,description, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/department/list", (req, res) => {
  departmentModel.listDepartments((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
app.post("/api/departments/update",(err,result)=>{
  departmentModel.updateDepartment(oldName,newName,description,(err,result)=>{
    if(err) return res.status(400).json({error:err.message});
    res.json(result);
  });
});

app.delete("/api/departments/delete", (req, res) => {
  const { id } = req.body;   // ✅ get from request body

  departmentModel.deleteDepartment(id, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});


/* ===========================
   EMPLOYEE ROUTES
=========================== */
app.post("/api/employee/add", (req, res) => {
  const { empName, email, dob, deptName, reptTo } = req.body;
  employeeModel.addEmployee(empName, email, dob, deptName, reptTo, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/employee/list", (req, res) => {
  employeeModel.listEmployees((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.delete("/api/employee/delete", (req, res) => {
  const { id } = req.body;   // ✅ get from body

  employeeModel.deleteEmployee(id, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});
app.post("/api/employee/update", (req, res) => {
  const { id, dept, lead } = req.body;

  employeeModel.updateEmployee(id, dept, lead, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(result);
  });
});

/* ===========================
   LEAD ROUTES
=========================== */
app.post("/api/lead/add", (req, res) => {
  const { name, email, password, role } = req.body;
  leadModel.addLead(name, email, password, role, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/lead/list", (req, res) => {
  leadModel.listLeads((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.put("/api/lead/reset-password/:email", (req, res) => {
  const { newPassword } = req.body;
  leadModel.resetPassword(req.params.id, newPassword, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});

app.delete("/api/lead/delete", (req, res) => {
  const { id } = req.body; // ✅ get from body
  leadModel.deleteLead(id, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/lead/:email", (req, res) => {
  leadModel.getLeadByEmail(req.params.email, (err, result) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(result);
  });
});

app.put("/api/lead/update/:email", (req, res) => {
  const { newName, newEmail, password } = req.body;
  leadModel.updateLead(req.params.email, newName, newEmail, password, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(result);
  });
});
// Add this new endpoint to your index.js file
app.get("/api/lead/list-emp", (req, res) => {
  leadModel.listLeadsWithEmployees((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
