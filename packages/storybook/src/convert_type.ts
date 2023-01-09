import { Node, SyntaxKind, Type } from "ts-morph";
import { ArgTypes, InputType } from "@storybook/types";

const getDescription = (node: Node): string | void => {
  if (node.isKind(SyntaxKind.PropertyAssignment)) {
    return node.compilerNode.jsDoc?.length > 0
      ? node.compilerNode.jsDoc.map((c) => c.comment).join("\n")
      : undefined;
  }
};

const getStorybookType = (node: Node): InputType["type"] | void => {
  if (node.isKind(SyntaxKind.PropertyAssignment)) {
    const initializer = node.getInitializer();
    if (!initializer) return;
    const value = initializer.getType().getBaseTypeOfLiteralType();
    if (!value) return;
    if (value.isBoolean()) {
      return "boolean";
    } else if (value.isNumber()) {
      return "number";
    } else if (value.isString()) {
      return "string";
    } else if (value.getCallSignatures().length > 0) {
      return "function";
    }
  }
};

const convertType = (type: Type): ArgTypes => {
  const result: ArgTypes = {};
  if (type.isObject()) {
    for (const property of type.getProperties()) {
      const name = property.getName();
      const [decl] = property.getDeclarations() ?? [];
      const propAssignment = decl.asKind(SyntaxKind.PropertyAssignment);
      if (!propAssignment) continue;
      const valueType = getStorybookType(propAssignment);
      result[name] = valueType ? { type: valueType } : {};
      const description = getDescription(propAssignment);
      if (description) result[name].description = description;
    }
  }
  return result;
};

export default convertType;
