import express, { Request, Response } from "express";
import { IRecord, Record } from "../models/records";
import { Schema, validate } from "../handlers/error";

interface RecordQueryModel {
  endDate: Date;
  startDate: Date;
  minCount: Number;
  maxCount: Number;
}

interface CustomRequest<T> extends Request {
  body: T;
}

const router = express.Router();

export const BodySchema: Schema = {
  fields: {
    endDate: "Date",
    startDate: "Date",
    minCount: "number",
    maxCount: "number",
  },
  required: ["endDate", "startDate", "minCount", "maxCount"],
};

router.post(
  "/api/fetch",
  [],
  async (req: CustomRequest<RecordQueryModel>, res: Response) => {
    const validation = await validate(req.body, BodySchema);
    let returnBody: {
      code: Number;
      msg: String;
      records: Array<IRecord>;
    } = {
      code: -1,
      msg: "Unhandled Case",
      records: [],
    };

    if (validation.code > 0) {
      returnBody = {
        code: validation.code,
        msg: validation.msg,
        records: [],
      };
      res.status(400).send(returnBody);
    } else {
      const records = await Record.aggregate([
        {
          $match: {
            createdAt: {
              $lte: new Date(req.body.endDate),
              $gte: new Date(req.body.startDate),
            },
          },
        },
        { $unwind: "$counts" },
        {
          $group: {
            _id: "$key",
            createdAt: { $first: "$createdAt" },
            totalCount: {
              $sum: "$counts",
            },
          },
        },
        {
          $match: {
            totalCount: { $lte: req.body.maxCount, $gte: req.body.minCount },
          },
        },
        { $project: { _id: 0, key: "$_id", createdAt: 1, totalCount: 1 } },
      ]);

      returnBody = {
        code: 0,
        msg: "Success",
        records: records,
      };
      return res.status(200).send(returnBody);
    }
  }
);

export { router as recordsRouter };
