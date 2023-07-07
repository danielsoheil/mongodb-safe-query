import { expect, it } from "@jest/globals";

import Ajv from "ajv";
import { filterSchema } from "./index";
import { TSchema } from "@sinclair/typebox";

const ajv = new Ajv({ removeAdditional: "all" });

const validateWithoutRemoveField = (schema: TSchema, data: {}) => {
  const dataBackup = structuredClone(data);
  expect(ajv.validate(schema, data)).toBe(true);
  expect(data).toMatchObject(dataBackup);
};

it("should validate a simple where mongo query with our schema", function () {
  const schema = filterSchema(["firstName", "lastName"]);
  validateWithoutRemoveField(schema, {
    firstName: "daniel",
    lastName: "soheil",
  });
  validateWithoutRemoveField(schema, {
    lastName: "soheil",
    firstName: "daniel",
  });
  validateWithoutRemoveField(schema, { firstName: "daniel" });
  validateWithoutRemoveField(schema, { lastName: "soheil" });
});

it("should validate and remove additional fields", function () {
  const schema = filterSchema(["firstName"]);
  {
    // removeAdditional
    const data = { firstName: "daniel", age: 12 };
    expect(ajv.validate(schema, data)).toBe(true);
    expect(data).toMatchObject({ firstName: "daniel" });
  }
});

it("should validate $like operator of where mongo query with our schema", function () {
  validateWithoutRemoveField(filterSchema(["firstName"]), {
    firstName: { $like: "%daniel%" },
  });
});

it("should validate $eq operator of where mongo query with our schema", function () {
  validateWithoutRemoveField(filterSchema(["firstName"]), {
    firstName: { $eq: "daniel" },
  });
});

it("should not validate with wrong operator", function () {
  const data = { firstName: { $xxxxxxx: "daniel" } };
  expect(ajv.validate(filterSchema(["firstName"]), data)).toBe(false);
});

it("should remove unexpected field", function () {
  const data = { xxxxxxx: "daniel" };
  ajv.validate(filterSchema(["firstName"]), data);
  expect(data).toMatchObject({});
});

it("should validate $and operator of where mongo query with our schema", function () {
  validateWithoutRemoveField(filterSchema(["firstName", "lastName"]), {
    $and: [{ firstName: "daniel" }, { lastName: "soheil" }],
  });
});

it("should validate $or operator of where mongo query with our schema", function () {
  validateWithoutRemoveField(filterSchema(["firstName", "lastName"]), {
    $or: [{ firstName: "daniel" }, { lastName: "soheil" }],
  });
});
