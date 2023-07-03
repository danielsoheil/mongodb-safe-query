import {
  TObject,
  TSchema,
  Type,
} from "@sinclair/typebox";

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