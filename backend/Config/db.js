import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB Connected🔗");
    } catch(error) {
        console.log(error);
    }
}

export default connectDB;