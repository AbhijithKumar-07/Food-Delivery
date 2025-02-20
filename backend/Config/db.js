import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect('mongodb+srv://Abhi:Yak2006@fooddelivery.txvge.mongodb.net/food-del');
        console.log("DB Connected🔗");
    } catch(error) {
        console.log(error);
    }
}

export default connectDB;