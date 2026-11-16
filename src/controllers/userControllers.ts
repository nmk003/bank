import type { Request, Response } from "express";
import sql from "../db.ts";

export const Users = async (req: Request, res: Response) => {
  try {
    const usersResponse = await sql`
    SELECT * FROM users`;
    return res.status(200).json({
      message: "Success",
      data: usersResponse,
    });
  } catch (error) {
    console.log(error, "Get Users Error");
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const CreateUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({
        message: "Please provide valid details",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password should not be less than 6 charaters",
      });
    }
    const users = await sql`SELECT * FROM users`;
    const isUserExist = users.find((u) => {
      if (u.username === username) {
        return true;
      }
    });
    if (isUserExist) {
      return res.status(400).json({
        message: `User '${username}' is already exists, please use different username`,
      });
    }

    const createResponse = await sql`
    INSERT INTO users(username, password)
    VALUES (${username}, ${password})`;

    return res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error, "Create User Error");
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
