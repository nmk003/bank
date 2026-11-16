import "dotenv/config";
import express from "express";
import routers from "./routes/routes.ts";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(bodyParser.json());

app.use(routers);

app.listen(PORT, () => {
  console.log(`Server is Running on Port: ${PORT}`);
});
