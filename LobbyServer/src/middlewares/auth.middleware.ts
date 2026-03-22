import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET  || "supersecret"

export const authenticate =(req: Request, res: Response, next :NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader|| authHeader.startsWith("Bearer ")){
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
    return res.status(401).json({ message: "Token missing" });
    }


    try{
        const payload = jwt.verify(token, SECRET_KEY) as { userId: string; role: string };

        //отдать пользователя
        //req.player =
        next()
    }catch(err){
        return res.status(401).json({ message: "Invalid token" });
    }
}