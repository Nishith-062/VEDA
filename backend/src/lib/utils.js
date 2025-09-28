import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (userId, res) => {

    // const JWT_SECRET = process.env.JWT_SECRET 
    // console.log(JWT_SECRET);
    
    
    
    const token = jwt.sign({userId},'secret' ,{
        expiresIn:"7d",
    });


    res.cookie("jwt",token, {
        maxAge:7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "none", //CSRF attacks cross-site request forgery attacks
        secure: true
    });
    
    return token;
};