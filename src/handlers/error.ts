import moment from "moment";

export type Schema = {
  fields: { [key: string]: string };
  required?: string[];
};

const required = (obj: any, required: string[]) => {
  // undefined check
  for (let key of required) {
    if (obj[key] === undefined)
      return {
        code: 10001,
        msg: obj[key]
          ? obj[key] + " parameter is missing"
          : "The response body is incorrect",
      };
  }
  return {
    code: 0,
    msg: "Success",
  };
};

export const validate = async (obj: any, model: Schema) => {
  if (model.required) {
    const statusObj = required(obj, model.required);
    if (statusObj.code > 0)
      return {
        code: 11001,
        msg: statusObj.msg,
      };
  }

  for (let key of Object.keys(obj)) {
    // different conditions for if/else
    const dateCheck =
      !moment(obj[key], "YYYY-MM-DD", true).isValid() &&
      model.fields[key] === "Date";
    const otherCheck =
      model.fields[key] !== "Date" && typeof obj[key] !== model.fields[key];

    if (model.fields[key] === undefined)
      return {
        code: 11002,
        msg: key + " parameter is undefined.",
      };
    else if (dateCheck)
      return {
        code: 11003,
        msg: key + " parameter does not fit the date format",
      };
    else if (otherCheck)
      return {
        code: 11004,
        msg: key + " parameter does not fit the given format",
      };
  }
  return {
    code: 0,
    msg: "Success",
  };
};
