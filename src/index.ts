import dotenv from 'dotenv';
import app from "./server";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(
  process.env.MONGODB_ENDPOINT || "",
  {},
  () => {
    console.log("connected to database");
  }
);

app.listen(process.env.PORT || 25800, () => {
  console.log("Hello");
});
