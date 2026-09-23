import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res, next) => {
    console.log("🔥 NEW AUTH CONTROLLER LOGIN HIT");
    try {
        const { email, password } = req.body;

        const result = await User.findByEmail(email);

        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                employee_id: user.employee_id,
                role: user.role
            },
              process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "User Login Successful",
            token,
            user: {
                id: user.id,
                employee_id: user.employee_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        next(err);
    }
};

export const setupAccount = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await User.setupAccount(
            email,
            password
        );

        return res.status(201).json(result);

    } catch (err) {
        next(err);
    }
};