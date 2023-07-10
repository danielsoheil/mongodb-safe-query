import {TObject, Type, TArray, TProperties, Static} from "@sinclair/typebox";

const fieldPossibleValues = () => Type.Union([
  Type.String(),
  Type.Object({ $eq: Type.String() }),
  Type.Object({ $like: Type.String() }),
]);

const fields = (fieldKeys: string[]) => {
  const objectFields: {[key: string]: ReturnType<typeof fieldPossibleValues>} = {};
  for (const fieldKey of fieldKeys) {
    objectFields[fieldKey] = fieldPossibleValues();
  }
  return Type.Partial(Type.Object(objectFields));
};

const filterStructureSchema = (
  ables: string[],
  maxComplexity = 3,
  currentComplexity = 0
) => {
  if (currentComplexity < maxComplexity + 1) {
    currentComplexity++;

    const possibleObjects: (ReturnType<typeof fields> | TObject<{$or: TArray}> | TObject<{$and: TArray}>)[] = [fields(ables)];

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
  return Type.Optional(filterStructureSchema(ables, 3) ?? Type.Object({}));
};
