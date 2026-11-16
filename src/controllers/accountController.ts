import type { Request, Response } from "express";
import sql from "../db.ts";

export const CreateAccount = async (req: Request, res: Response) => {
  const { accountName } = req.body;
  try {
    if (!accountName) {
      return res.status(400).json({
        message: "Please provide account name",
      });
    }
    const accounts = await sql`SELECT * FROM accounts`;

    const isAccountExist = accounts.find((a) => {
      if (a.account_holder_name === accountName) {
        return true;
      }
    });
    if (isAccountExist) {
      return res.status(400).json({
        message: `Account is already exists on this name ${accountName}`,
      });
    }
    const accuntNumber = `32510${(accounts.count + 1).toString().padStart(7, "0")}`;
    const customerId = `DFC${new Date().getFullYear().toString().slice(2)}${accounts.count + 1}`;
    const accountResponse = await sql`
    INSERT INTO accounts(customer_id, account_no, account_holder_name)
    VALUES(${customerId}, ${accuntNumber}, ${accountName}) RETURNING *`;
    return res.status(200).json({
      success: true,
      message: "Account is created successfully",
      data: accountResponse,
    });
  } catch (error) {
    console.log(error, "Create User Error");
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const Accounts = async (req: Request, res: Response) => {
  try {
    const usersResponse = await sql`
    SELECT * FROM accounts`;
    if (usersResponse.count > 0) {
      return res.status(200).json({
        message: "Success",
        data: usersResponse,
      });
    } else {
      return res.status(404).json({
        message: "No Accounts",
        data: usersResponse,
      });
    }
  } catch (error) {
    console.log(error, "Get Users Error");
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const Transfer = async (req: Request, res: Response) => {
  const { amount, accountNumber, payeeAccountNumber } = req.body;
  try {
    let notFound;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Please provide amount",
      });
    }
    if (!accountNumber || !payeeAccountNumber) {
      return res.status(400).json({
        message: "Please provide account number",
      });
    }
    if (accountNumber.length !== 12 || payeeAccountNumber.length !== 12) {
      return res.status(400).json({
        message: "Account number should be in 12 Digits",
      });
    }
    const transferSucceeded = await sql.begin(async (tx) => {
      const accounts = await tx`
        SELECT * FROM accounts
        WHERE account_no IN (${accountNumber}, ${payeeAccountNumber})
        FOR UPDATE
      `;

      const senderAccount = accounts.find(
        (account) => account.account_no === accountNumber,
      );
      const payeeAccount = accounts.find(
        (account) => account.account_no === payeeAccountNumber,
      );

      if (!senderAccount || !payeeAccount) {
        return (notFound = true);
      }

      if (senderAccount.balance < amount) {
        return false;
      }

      await tx`
        UPDATE accounts
        SET balance = ${senderAccount.balance - amount}
        WHERE account_no = ${accountNumber}
      `;

      await tx`
        UPDATE accounts
        SET balance = ${payeeAccount.balance + amount}
        WHERE account_no = ${payeeAccountNumber}
      `;

      return true;
    });

    if (notFound) {
      return res.status(200).json({
        message: "One or both accounts were not found",
      });
    }

    if (!transferSucceeded) {
      return res.status(200).json({
        message: "Insufficient balance",
      });
    }

    return res.status(200).json({
      message: "Transaction Sucessfully Done",
    });
  } catch (error) {
    console.log(error, "Transfer Error");
    return res.status(400).json({
      message: "Transfer failed",
    });
  }
};

export const BalanceCredit = async (req: Request, res: Response) => {
  const { amount, accountNumber } = req.body;
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Please provide amount",
      });
    }
    if (!accountNumber) {
      return res.status(400).json({
        message: "Please provide account number",
      });
    }
    if (accountNumber.length !== 12) {
      return res.status(400).json({
        message: "Account number should be in 12 Digits",
      });
    }

    const acc = await sql.begin(async (tx) => {
      const creditResponse = await tx`
      SELECT * FROM accounts
        WHERE account_no = ${accountNumber}
        FOR UPDATE`;

      if (creditResponse.count > 0) {
        await tx`
        UPDATE accounts
        SET balance = ${creditResponse[0].balance + amount}
        WHERE account_no = ${accountNumber}`;

        return creditResponse;
      } else {
        return false;
      }
    });
    if (acc) {
      return res.status(200).json({
        message: "Your account has beed created",
        credit_amount: amount,
        accountNumber: acc[0].account_no,
        current_balance: acc[0].balance + amount,
      });
    } else {
      return res.status(200).json({
        message: "Account number is not found with our records",
      });
    }
  } catch (error) {
    console.log(error, "Add Amount Error");
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};
