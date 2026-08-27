import axios from "axios";
import express from "express";
import cors from "cors";
import initDatabase from "./config/initDatabase.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js"
import departmentRoutes from "./routes/departmentRoutes.js"
import leadRoutes from "./routes/leadRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import adminLeaveRoutes from "./routes/adminLeaveRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/admin-leaves", adminLeaveRoutes);

app.post("/api/ask", async (req, res) => {
    try {
        const { query } = req.body;

        const response = await axios.post(
            "http://127.0.0.1:8000/ask",
            { query }
        );

        const answer = response.data.answer;

        return res.status(200).json({ answer });

    } catch (error) {
        console.log(
            "FULL ERROR:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            error: "AI interaction failed"
        });
    }
});

app.get("/api/ask", (req, res) => {
    res.send("Use POST request with JSON body");
});

// Error middleware LAST
app.use(errorMiddleware);

initDatabase();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});