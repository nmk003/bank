import express from "express";
import { CreateUser, Users } from "../controllers/userControllers.ts";
import {
  Accounts,
  BalanceCredit,
  CreateAccount,
  Transfer,
} from "../controllers/accountController.ts";

const router = express.Router();

// Users
router.get("/users", Users);
router.post("/user", CreateUser);

// Accounts
router.get("/accounts", Accounts);
router.post("/account", CreateAccount);
router.post("/transfer", Transfer);
router.post("/credit", BalanceCredit);

export default router;
