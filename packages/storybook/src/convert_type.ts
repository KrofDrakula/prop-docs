import { Node, SyntaxKind, Type, ts } from "ts-morph";
import { ArgTypes, SBArrayType, SBObjectType, SBType } from "@storybook/types";

const getDescription = (node: Node): string | void => {
  if (node.isKind(SyntaxKind.PropertyAssignment)) {
    // @ts-expect-error https://github.com/dsherret/ts-morph/issues/1379
    const docs = node.compilerNode.jsDoc as ts.JSDoc[];
    return docs?.length > 0 ? docs.map((c) => c.comment).join("\n") : undefined;
  }
};

const getStorybookType = (node: Node | undefined): SBType | void => {
  if (!node) return;
  if (node.isKind(SyntaxKind.PropertyAssignment)) {
    const required = !node.hasQuestionToken();
    const initializer = node.getInitializer();
    if (!initializer) return;
    const value = initializer.getType().getBaseTypeOfLiteralType();
    if (!value) return;
    if (value.isBoolean()) {
      return { name: "boolean", required };
    } else if (value.isNumber()) {
      return { name: "number", required };
    } else if (value.isString()) {
      return { name: "string", required };
    } else if (value.getCallSignatures().length > 0) {
      return { name: "function", required };
    } else if (value.isArray()) {
      // TODO: recursively determine inner types
      return {
        name: "array",
        value: getStorybookType(
          value.getArrayElementType()?.getSymbol()?.getDeclarations()[0]
        )!,
        required,
      } satisfies SBArrayType;
    } else if (value.isObject()) {
      // TODO: recursively determine inner types
      return {
        name: "object",
        required,
        value: {},
      } satisfies SBObjectType;
    }
  }
};

const convertType = (type: Type): ArgTypes => {
  const result: ArgTypes = {};
  if (type.isObject()) {
    for (const property of type.getProperties()) {
      const name = property.getName();
      const [decl] = property.getDeclarations() ?? [];
      if (decl.isKind(SyntaxKind.PropertyAssignment)) {
        const valueType = getStorybookType(decl);
        result[name] = valueType ? { type: valueType } : {};
        const description = getDescription(decl);
        if (description) result[name].description = description;
      }
    }
  }
  return result;
};

export default convertType;
