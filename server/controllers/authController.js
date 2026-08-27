import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login=async (req,res,next)=>{

    try{
        const {email,password}=req.body
        const result=await User.findByEmail(email)
        if(result.length===0){
            return res.status(401).json({message:'Invalid email or password'})
        }
        const user=result[0]
        const isMatch = await bcrypt.compare(password, user.password);

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

        res.json({
            message: "Login successful",
            token
        });
    }
    catch(err){
        next(err)
    }

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

}