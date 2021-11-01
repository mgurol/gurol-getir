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

// validation schema for request body
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
    // return body definition (default code -1)
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
      // in order (query):
      // 1. match dates
      // 2. unwind the array in the object (counts)
      // 3. group on 'key' as _id
      // 4. compare the grouped count (totalCount) to min and max value
      // 5. project the result to fit the output format
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
