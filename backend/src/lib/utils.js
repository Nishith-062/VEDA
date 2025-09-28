import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (userId, res) => {


    // const JWT_SECRET = process.env.JWT_SECRET 
    // console.log(JWT_SECRET);
    
    
    
    const token = jwt.sign({userId},'secret' ,{
        expiresIn:"7d",
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("jwt",token, {
        maxAge:7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: isProduction ? "none" : "lax", // allow local http dev
        secure: isProduction // cookies over https only in prod
    });
    
    return token;
};