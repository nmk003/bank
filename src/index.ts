import express from "express";
import dotenv from "dotenv";
import routers from "./routes/routes.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(routers);

app.listen(PORT, () => {
  console.log(`Server is Running on Port: ${PORT}`);
});
