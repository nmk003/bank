import express from "express";
import { CreateUser } from "../controllers/userControllers.ts";

const router = express.Router();

router.get("/", CreateUser);

export default router;
