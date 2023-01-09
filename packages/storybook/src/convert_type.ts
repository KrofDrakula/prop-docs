import { SyntaxKind, Type, TypeChecker } from "ts-morph";
import { ArgTypes } from "@storybook/types";

const convertType = (type: Type, typeChecker: TypeChecker): ArgTypes => {
  const result: ArgTypes = {};
  if (type.isObject()) {
    for (const property of type.getProperties()) {
      const name = property.getName();
      const [decl] = property.getDeclarations();
      const assignment = decl.asKind(SyntaxKind.PropertyAssignment);
      if (!assignment?.getInitializer()) continue;
      const value = typeChecker
        .getTypeAtLocation(assignment.getInitializer()!)
        .getBaseTypeOfLiteralType();
      if (!value) continue;
      if (value.isBoolean()) {
        result[name] = { type: "boolean" };
      } else if (value.isNumber()) {
        result[name] = { type: "number" };
      } else if (value.isString()) {
        result[name] = { type: "string" };
      } else if (value.getCallSignatures().length > 0) {
        result[name] = { type: "function" };
      } else {
        result[name] = {};
      }
    }
  }
  return result;
};

export default convertType;
