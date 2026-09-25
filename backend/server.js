import express from 'express'
import cors from "cors"
import connectDB from './Config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import 'dotenv/config'
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());  // -->> Using this cors() we can access the backend from any frontend

// connect DB
connectDB();

// api endpoints
app.use("/api/food",foodRouter);
app.use("/images", express.static('uploads', {
    maxAge: '30d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
}));
app.use("/api/user",userRouter);
app.use("/api/cart",cartRouter);
app.use("/api/order",orderRouter);


app.get("/",(req,res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.send("API Working!");
})

app.get("/api/ping",(req,res) => {
    res.json({status: "ok", timestamp: Date.now()});
})

app.listen(port,() => {
    console.log(`Listening To The Server🌐 On Port ${port}`);
})

// mongodb+srv://Abhi:Yak2006@fooddelivery.txvge.mongodb.net/?