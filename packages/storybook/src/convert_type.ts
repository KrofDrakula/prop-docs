import {
  Node,
  SyntaxKind,
  Type,
  ts,
  PropertyAssignment,
  PropertySignature,
} from "ts-morph";
import type { ArgTypes, SBType } from "@storybook/types";

const getDescription = (node: Node): string | void => {
  if (node.isKind(SyntaxKind.PropertyAssignment)) {
    // @ts-expect-error https://github.com/dsherret/ts-morph/issues/1379
    const docs = node.compilerNode.jsDoc as ts.JSDoc[];
    return docs?.length > 0 ? docs.map((c) => c.comment).join("\n") : undefined;
  }
};

const convertObject = (type: Type): Record<string, SBType> => {
  const result: Record<string, SBType> = {};
  for (const prop of type.getProperties()) {
    const required = !prop.isOptional();
    const resolvedType = convertTypeToStorybookType(
      prop.getDeclarations()[0].getType(),
      required
    );
    if (resolvedType) result[prop.getName()] = resolvedType;
  }
  return result;
};

const convertTypeToStorybookType = (
  type: Type,
  required?: boolean
): SBType | void => {
  let result: SBType | undefined = undefined;
  const normalized = type.getBaseTypeOfLiteralType();
  if (normalized.isBoolean()) {
    result = { name: "boolean" };
  } else if (normalized.isNumber()) {
    result = { name: "number" };
  } else if (normalized.isString()) {
    result = { name: "string" };
  } else if (normalized.getCallSignatures().length > 0) {
    result = { name: "function" };
  } else if (normalized.isArray()) {
    result = {
      name: "array",
      value:
        convertTypeToStorybookType(type.getNumberIndexType()!) ?? ({} as any),
    };
  } else if (normalized.isObject()) {
    result = {
      name: "object",
      value: convertObject(normalized),
    };
  }
  if (result && required != undefined) (result as SBType).required = required;
  return result;
};

const getPropertyAssignmentType = (node: PropertyAssignment): SBType | void => {
  const initializer = node.getInitializer();
  if (!initializer) return;
  const propType = initializer.getType();
  return propType
    ? convertTypeToStorybookType(propType, !node.hasQuestionToken())
    : undefined;
};

const getPropertySignatureType = (node: PropertySignature): SBType | void => {
  let propType = node.getType();
  const isUnionType = propType.isUnion();
  const hasUndefined =
    isUnionType && propType.getUnionTypes().some((t) => t.isUndefined());
  if (isUnionType)
    propType = propType.getUnionTypes().filter((t) => !t.isUndefined())[0];
  const required = !node.hasQuestionToken() && !hasUndefined;
  return convertTypeToStorybookType(propType, required);
};

const extractTypeForProperty = (node: Node | undefined): SBType | void => {
  if (node?.isKind(SyntaxKind.PropertyAssignment)) {
    return getPropertyAssignmentType(node);
  } else if (node?.isKind(SyntaxKind.PropertySignature)) {
    return getPropertySignatureType(node);
  }
};

const convertType = (type: Type): ArgTypes => {
  const result: ArgTypes = {};
  if (type.isObject() || type.isInterface()) {
    for (const property of type.getProperties()) {
      const name = property.getName();
      const [decl] = property.getDeclarations() ?? [];
      const valueType = extractTypeForProperty(decl);
      result[name] = valueType ? { type: valueType } : {};
      const description = getDescription(decl);
      if (description) result[name].description = description;
    }
  }
  return result;
};

export default convertType;
