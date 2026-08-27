import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import db from "./config/db.js";// ✅ import db connection
import { Department } from "./models/Department.js";
import { Employee } from "./models/Employee.js";
import { Lead } from "./models/Lead.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import { Leaves } from "./models/Leaves.js";
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
const leaveModel=new Leaves(db);
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
        { id: user.id, employee_id: user.employee_id, role: user.role },
        "yourSecretKey",
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        message: "User Login Successful",
        token,
        user: {
          id: user.id,
           employee_id: user.employee_id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
});
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "yourSecretKey"); // MUST match login
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
/* ===========================
   ADMIN ROUTES
=========================== */
app.get('/admin/summary',(req,res)=>{
  const empsql=`SELECT id FROM employees`
  const deptsql=`SELECT dept_id FROM departments`
  const leavesql=`SELECT id FROM leaves`
  const appLeavesql=`SELECT id FROM leaves WHERE status='Approved'`
  const penLeavesql=`SELECT id FROM leaves WHERE status='Pending'`
  const rejLeavesql=`SELECT id FROM leaves WHERE status='Rejected'`


  db.query(empsql,(err,EmpResult)=>{
    if(err){
      return res.status(500).json({error:'Message fetching error'})
    }
    const EmpID=EmpResult.length
  
  db.query(deptsql,(err,DeptResult)=>{
    if(err){
      return res.status(500).json({error:'Message fetching error'})
    }
    const DeptId=DeptResult.length
  db.query(leavesql,(err,LeaveResult)=>{
    if(err){
      return res.status(500).json({error:'Message not fetching'})
    }
    const totLeaves=LeaveResult.length
   db.query(appLeavesql,(err,AppLeaveResult)=>{
    if(err){
      return res.status(500).json({error:'Message not fetching'})
    }
  const approved=AppLeaveResult.length
  db.query(penLeavesql,(err,PenLeaveResult)=>{
    if(err){
      return res.status(500).json({error:'Message not fetching'})
    }
  const pending=PenLeaveResult.length
  db.query(rejLeavesql,(err,RejLeaveResult)=>{
    if(err){
      return res.status(500).json({error:'Message not fetching'})
    }
  const rejected=RejLeaveResult.length
  
  return res.status(200).json ({
    employees:EmpID,
    department:DeptId,
    total:totLeaves,
    pending:pending,
    approved:approved,
    rejected:rejected

  })
  })
})
  })
})
  })
})
})
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
app.post("/api/department/update",(req,res)=>{
  const {oldName,newName,description}=req.body
  departmentModel.updateDepartment(oldName,newName,description,(err,result)=>{
    if(err) return res.status(400).json({error:err.message});
    res.json(result);
  });
});

app.delete("/api/department/delete", (req, res) => {
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
  const { empName, email, dob, deptName, reptTo,reptToId} = req.body;
  employeeModel.addEmployee(empName, email, dob, deptName, reptTo,reptToId, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({success: true,
        message: "Employee added successfully",
    })
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
// app.put("/lead/resetpassword/:id",(req,res)=>{
//   const LeadId=req.params.employee_id
  
// })

app.put("/api/lead/reset-password/:email", (req, res) => {

  const { newPassword } = req.body;
  const email = req.params.email;

  bcrypt.hash(newPassword, 10, (err, hashed) => {

    if (err) {
      return res.status(500).json({ error: "Password hashing failed" });
    }

    const passsql = `UPDATE users SET password=? WHERE email=?`;

    db.query(passsql, [hashed, email], (err2, result) => {

      if (err2) {
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No user with this email found" });
      }

      return res.status(200).json({ success: "Password updated successfully" });

    });

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

app.get("/api/leaves/admin", (req, res) => {
  leaveModel.getAdminLeaves((err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});
app.post("/setup-account",(req,res)=>{
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  //  Check employee exists
  db.query("SELECT * FROM employees WHERE email = ?", [email], (err, empResult) => {
    if (err) {
      console.log("DB ERROR", err);
      return res.status(500).json({ error: "DB Error" });
    }

    if (empResult.length === 0) {
      return res.status(400).json({ error: "Email not found in employees" });
    }

    const employee = empResult[0];

    // Check if already in users
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, userResult) => {
      if (err) {
        console.log("DB ERROR", err);
        return res.status(500).json({ error: "DB Error" });
      }

      if (userResult.length > 0) {
        return res.status(400).json({ error: "Account already exists" });
      }

      try {
        // 3️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4️⃣ Insert into users
        db.query(
          "INSERT INTO users (employee_id,name, email, password, role) VALUES (?, ?,?, ?, 'employee')",
          [employee.id,employee.name, email, hashedPassword],
          (err, insertResult) => {
            if (err) {
              console.log("Insert error", err);
              return res.status(500).json({ error: "Insert failed" });
            }

            return res.status(201).json({ message: "Account created successfully" });
          }
        );
      } catch (hashError) {
        return res.status(500).json({ error: "Hashing failed" });
      }
    });
  });
})
app.get("/leaves/summary",verifyToken,(req,res)=>{
  const Sicksql=`SELECT SUM(total_days) as used from leaves where employee_id=? and leave_type='Sick Leave' and status='Approved'`
    const Cassql=`SELECT SUM(total_days) as used from leaves where employee_id=? and leave_type='Casual Leave' and status='Approved'`
      const Earnedsql=`SELECT SUM(total_days) as used from leaves where employee_id=? and leave_type='Earned Leave' and status='Approved'`
      const TotSql='SELECT sick_total,casual_total,earned_total from leave_policy'
      db.query(Sicksql,[req.user.employee_id],(err,SickUsedResult)=>{
        if(err) {
          console.log(err)
          return res.status(500).json({error:'DB ERROR'})
        }
         const SickUsed=SickUsedResult[0].used||0
      
     
      db.query(Cassql,[req.user.employee_id],(err,CasUsedResult)=>{
        if(err) {
          console.log(err)
          return res.status(500).json({error:'DB ERROR'})
        }
        const CasualUsed=CasUsedResult[0].used||0
      
      
      db.query(Earnedsql,[req.user.employee_id],(err,EarnedUsedResult)=>{
        if(err) {
          console.log(err)
          return res.status(500).json({error:'DB ERROR'})
        }
        const EarnedUsed=EarnedUsedResult[0].used||0
      
      
      db.query(TotSql,(err,TotAvailResult)=>{
        if(err) {
          console.log(err)
          return res.status(500).json({error:'DB ERROR'})
        }
        const policy=TotAvailResult[0]
      
      
      return res.status(200).json({
        sick:{
          total:policy.sick_total,
          used:SickUsed,
          remaining:policy.sick_total-SickUsed
        },
        casual:{
          total:policy.casual_total,
          used:CasualUsed,
          remaining:policy.casual_total-CasualUsed
        },
        earned:{
          total:policy.earned_total,
          used:EarnedUsed,
          remaining:policy.earned_total-EarnedUsed
        }

})
      })
    })
  })
})

})
app.post('/api/leaves/apply',verifyToken,(req,res)=>{
  const { type, fromDate, toDate, totDays, reason } = req.body;
  if (!type || !fromDate || !toDate || !reason) {
  return res.status(400).json({ error: "All fields are required." });
}


  const start=new Date(fromDate)
    const end=new Date(toDate)
     if (end < start) {
  return res.status(400).json({ error: "Invalid date range." });
}
      const diffTime = end - start;
        const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
      if (diffDays !== totDays) {
  return res.status(400).json({
    error: "Total days mismatch. Invalid request."
  })
}
  const insert=`INSERT INTO leaves(employee_id,leave_type,start_date,end_date,total_days,reason,status) 
  VALUES (?,?,?,?,?,?,'Pending')`
  
  db.query(insert,[req.user.employee_id,type,fromDate,toDate,totDays,reason],(err,result)=>{
    if(err){
      console.log(err)
      return res.status(500).json({error:'DB ERROR IN INSERTION'})
    }
    
    
    return res.status(200).json({success:'Apply succesfull'})
  })
})

app.delete('/api/leaves/:id', verifyToken, (req, res) => {

  const leaveId = req.params.id;

  const deleteQuery = `
    DELETE FROM leaves
    WHERE id = ?
    AND employee_id = ?
    AND status = 'Pending'
  `;

  db.query(
    deleteQuery,
    [leaveId, req.user.employee_id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json({ error: "DB ERROR IN DELETE" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          error: "Cannot cancel this leave."
        });
      }

      return res.status(200).json({
        success: "Leave cancelled successfully"
      });
    }
  );
});
app.get('/api/leaves/history',verifyToken,(req,res)=>{
  const history=`SELECT id,employee_id,leave_type,start_date,end_date,total_days,reason,status FROM leaves WHERE employee_id=? ORDER BY id DESC;`
  db.query(history,[req.user.employee_id],(err,result)=>{
    if(err){
      console.log(err)
      return res.status(500).json({error:'Error fetching Leaves'})
    }
    const formattedResult=result.map(leave=>({
      id:leave.id,
      employee_id:leave.employee_id,
      type:leave.leave_type,
      startDate: leave.start_date.toISOString().split("T")[0],
      endDate: leave.end_date.toISOString().split("T")[0],
      total:leave.total_days,
      reason:leave.reason,
      status:leave.status
}))
    return res.status(200).json(formattedResult)
  })
})
app.get('/api/leaves/approve',verifyToken,(req,res)=>{
  const leadId=req.user.employee_id
  const toApprove=`
  SELECT 
  l.id,
  l.employee_id,
  e.name,
  l.leave_type,
  l.start_date,
  l.end_date,
  l.total_days,
  l.reason,
  l.status
  FROM leaves l
  JOIN employees e ON l.employee_id = e.id
  WHERE e.lead_id = ?
  AND l.status = 'Pending'
  ORDER BY l.start_date DESC`
  db.query(toApprove,[leadId],(err,result)=>{
    if(err){
      console.log(err)
      return res.status(500).json({Error:'Cant Fetch Approval List'})
    }
    const formatResult=result.map(leave=>({
      id:leave.id,
      name:leave.name,
      type:leave.leave_type,
      from:leave.start_date.toISOString().split("T")[0],
      to:leave.end_date.toISOString().split("T")[0],
      total:leave.total_days,
      reason:leave.reason,
      status:leave.status




    }))
    return res.status(200).json(formatResult)
  })
})
app.put('/api/leaves/approve/:id',verifyToken,(req,res)=>{
  const Leaveid=req.params.id
  const leadId = req.user.employee_id

  const sql = `
  UPDATE leaves l
  JOIN employees e ON l.employee_id = e.id
  SET l.status = 'Approved'
  WHERE l.id = ?
  AND e.lead_id = ?
  `
  
  db.query(sql,[Leaveid,leadId],(err,result)=>{
    if(err){
      return res.status(500).json({error:'Update Failed'})
    }
    return res.status(200).json({message:'Update Success'})
  })
})
app.put('/api/leaves/reject/:id', verifyToken, (req, res) => {

  const leaveId = req.params.id

  const sql = `
  UPDATE leaves
  SET status = 'Rejected'
  WHERE id = ?
  `

  db.query(sql, [leaveId], (err, result) => {

    if (err) {
      return res.status(500).json({ error: 'Update Failed' })
    }

    return res.status(200).json({ message: "Leave Rejected" })

  })

})
app.get('/api/lead/approve/history',verifyToken,(req,res)=>{
   const leadId=req.user.employee_id
  const histCheck=`SELECT 
  l.id,
  l.employee_id,
  e.name,
  l.leave_type,
  l.start_date,
  l.end_date,
  l.total_days,
  l.reason,
  l.status
  FROM leaves l
  JOIN employees e ON l.employee_id = e.id
  WHERE e.lead_id = ?
  AND l.status IN ('Approved','Rejected')
  ORDER BY l.id DESC`
  db.query(histCheck,[leadId],(err,result)=>{
     if(err){
      console.log(err)
      return res.status(500).json({error:'Fetching Failed'})
     }
     const formatResult=result.map(leave=>({
      id:leave.id,
      name:leave.name,
      type:leave.leave_type,
      from:leave.start_date.toISOString().split("T")[0],
      to:leave.end_date.toISOString().split("T")[0],
      total:leave.total_days,
      reason:leave.reason,
      status:leave.status




    }))
    return res.status(200).json(formatResult)
     
})
})
app.get('/api/admin-leaves/approve',verifyToken,(req,res)=>{
  const leadId=req.user.employee_id
  const toApprove=`
  SELECT 
  l.id,
  l.employee_id,
  e.name,
  l.leave_type,
  l.start_date,
  l.end_date,
  l.total_days,
  l.reason,
  l.status
  FROM leaves l
  JOIN employees e ON l.employee_id = e.id
  WHERE e.Dept_Lead = ?
  AND l.status = 'Pending'
  ORDER BY l.start_date DESC`
  db.query(toApprove,['admin'],(err,result)=>{
    if(err){
      console.log(err)
      return res.status(500).json({Error:'Cant Fetch Approval List'})
    }
    const formatResult=result.map(leave=>({
      id:leave.id,
      name:leave.name,
      type:leave.leave_type,
      from:leave.start_date.toISOString().split("T")[0],
      to:leave.end_date.toISOString().split("T")[0],
      total:leave.total_days,
      reason:leave.reason,
      status:leave.status




    }))
    return res.status(200).json(formatResult)
  })
})
app.post('/api/ask',async (req,res)=>{
  try{
    const {query}=req.body
    const response=await axios.post('http://127.0.0.1:8000/ask',{query})
    const  answer=response.data.answer
    return res.status(200).json({answer})
  }
  catch(error){
     console.log("FULL ERROR:", error.response?.data || error.message);
     return res.status(500).json({error:'AI interaction failed'})
  }
  
})
app.get('/api/ask', (req, res) => {
  res.send("Use POST request with JSON body");
});
/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
