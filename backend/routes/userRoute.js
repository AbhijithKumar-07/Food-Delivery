import express from "express"
import {loginUser, registerUser, getUserProfile} from "../controllers/userController.js"
import authMiddleWare from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/profile", authMiddleWare, getUserProfile)

export default userRouter