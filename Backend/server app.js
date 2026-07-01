import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to IntellMeet Backend API"
    });
});

app.use("/api/auth", authRoutes);

export default app;
