import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.api_secret,
});

export default cloudinary;
