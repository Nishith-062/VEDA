import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();

const DbConnect=async()=>{
    
    try {
        const connection=await mongoose.connect(process.env.MONGODB_URL)
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
    console.error("MongoDB connection error:", error);
    }
}
export default DbConnect