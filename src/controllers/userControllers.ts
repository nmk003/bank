import type { Request, Response } from "express";

export const CreateUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: "Success",
    });
  } catch (error) {
    console.log(error, "Create User Error");
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
