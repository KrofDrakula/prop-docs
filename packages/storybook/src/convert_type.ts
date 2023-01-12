import {
  Node,
  SyntaxKind,
  Type,
  ts,
  PropertyAssignment,
  PropertySignature,
} from "ts-morph";
import { ArgTypes, SBArrayType, SBObjectType, SBType } from "@storybook/types";

const getDescription = (node: Node): string | void => {
  if (node.isKind(SyntaxKind.PropertyAssignment)) {
    // @ts-expect-error https://github.com/dsherret/ts-morph/issues/1379
    const docs = node.compilerNode.jsDoc as ts.JSDoc[];
    return docs?.length > 0 ? docs.map((c) => c.comment).join("\n") : undefined;
  }
};

const convertTypeToStorybookType = (
  type: Type,
  required: boolean
): SBType | void => {
  const normalized = type.getBaseTypeOfLiteralType();
  if (normalized.isBoolean()) {
    return { name: "boolean", required };
  } else if (normalized.isNumber()) {
    return { name: "number", required };
  } else if (normalized.isString()) {
    return { name: "string", required };
  } else if (normalized.getCallSignatures().length > 0) {
    return { name: "function", required };
  } else if (normalized.isArray()) {
    // TODO: recursively determine inner types
    return {
      name: "array",
      value: {} as any,
      required,
    } satisfies SBArrayType;
  } else if (normalized.isObject()) {
    // TODO: recursively determine inner types
    return {
      name: "object",
      value: {},
      required,
    } satisfies SBObjectType;
  }
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
