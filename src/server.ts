import express from "express";
import { json } from "body-parser";
import { recordsRouter } from "./routes/records";

const app = express();
app.use(json());
app.use(recordsRouter);

export default app;
