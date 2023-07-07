import { TObject, TSchema, Type } from "@sinclair/typebox";

const fieldValue = Type.Union([
  Type.String(),
  Type.Object({ $eq: Type.String() }),
  Type.Object({ $like: Type.String() }),
]);

const fields = (fieldKeys: string[]) => {
  const objectFields = {};
  fieldKeys.map((fieldKey) => {
    objectFields[fieldKey] = fieldValue;
  });
  return Type.Partial(Type.Object(objectFields));
};

const filterStructureSchema = (
  ables: string[],
  maxComplexity = 3,
  currentComplexity = 0
): TSchema => {
  if (currentComplexity < maxComplexity + 1) {
    currentComplexity++;

    const possibleObjects: TObject[] = [fields(ables)];

    const nextLevel = filterStructureSchema(
      ables,
      maxComplexity,
      currentComplexity
    );
    if (nextLevel) {
      possibleObjects.push(Type.Object({ $and: Type.Array(nextLevel) }));
      possibleObjects.push(Type.Object({ $or: Type.Array(nextLevel) }));
    }

    return Type.Union(possibleObjects.reverse());
  }
};

export const filterSchema = (ables: string[]) => {
  const schema = filterStructureSchema(ables, 3);
  return Type.Optional(schema);
};
