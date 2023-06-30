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
  return ables.map((able) => {
    return Type.Object({
      [able]: Type.Union([
        Type.Object({ $exact: Type.String() }),
        Type.Object({ $like: Type.String() }),
      ]),
    });
  });
};

const filterStructureSchema = (
  ables: string[],
  maxComplexity = 5,
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
        ])
      : Type.Union(fields(ables));
  }
};

const filterSchema = (ables: string[]) => {
  const schema = filterStructureSchema(ables);
  if (!schema) throw new Error('this is not possible');
  return Type.Partial(schema);
};

const status = Value.Check(filterSchema(filterAbles), {$or: 7});
const status2 = Value.Check(filterSchema(filterAbles), {email: 7});
console.log(status);
console.log(status2);
