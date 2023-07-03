import {
  TObject,
  TProperties,
  TSchema,
  TString,
  Type,
} from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import * as assert from "assert";

const filterAbles = ["email", "phone"];

type filterStructure =
  | {
      $and: filterStructure[];
    }
  | {
      $or: filterStructure[];
    }
  | {
      [key: string]: TString;
    };

const fields = (ables: string[]) => {
  const ablesSchema: TObject[] = [];
  ables.map((able) => {
    ablesSchema.push(
      Type.Object({
        [able]: Type.Union([
          Type.Object({ $exact: Type.String() }),
          Type.Object({ $like: Type.String() }),
        ]),
      })
    );
  });
  return ablesSchema;
};

const filterStructureSchema = (
  ables: string[],
  maxComplexity = 3,
  currentComplexity = 0
): TSchema | void => {
  if (currentComplexity < maxComplexity) {
    currentComplexity++;

    const nextLevel = filterStructureSchema(
      ables,
      maxComplexity,
      currentComplexity
    );

    return nextLevel
      ? Type.Union([
          ...fields(ables),
          Type.Object({ $and: Type.Array(nextLevel) }),
          Type.Object({ $or: Type.Array(nextLevel) }),
          Type.Object({}),
        ])
      : Type.Union([...fields(ables), Type.Object({})]);
  }
};

export const filterSchema = (ables: string[]) => {
  const schema = filterStructureSchema(ables);
  if (!schema) throw new Error("this is not possible");
  return Type.Optional(schema);
};

const status = Value.Check(filterSchema(filterAbles), {$or: 7});
const status2 = Value.Check(filterSchema(filterAbles), {email: 7});
console.log(status);
console.log(status2);
