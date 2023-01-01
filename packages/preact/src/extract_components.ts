import {
  ts,
  Project,
  SyntaxKind,
  Type,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
  ClassExpression,
} from "ts-morph";
import { FuncExpr } from "./examples/function_components";

const getParamType = (
  t: FunctionDeclaration | FunctionExpression | ArrowFunction
): Type<ts.Type> => t.getParameters()[0].getType();

const extractComponents = (
  project: Project,
  filePath: string
): Record<string, Type<ts.Type>> => {
  const extracted: Record<string, Type<ts.Type>> = {};
  const source = project.getSourceFileOrThrow(filePath);

  for (const [name, declarations] of source.getExportedDeclarations()) {
    for (const declaration of declarations) {
      if (
        declaration.isKind(SyntaxKind.ArrowFunction) ||
        declaration.isKind(SyntaxKind.FunctionDeclaration) ||
        declaration.isKind(SyntaxKind.FunctionExpression)
      ) {
        console.log(name, "named declaration or default");
        extracted[name] = getParamType(declaration);
      } else if (declaration.isKind(SyntaxKind.VariableDeclaration)) {
        const initializer = declaration.getInitializer();
        if (
          initializer?.isKind(SyntaxKind.ArrowFunction) ||
          initializer?.isKind(SyntaxKind.FunctionExpression)
        ) {
          console.log(name, "named export, function");
          extracted[name] = getParamType(initializer);
        } else if (
          initializer?.isKind(SyntaxKind.ClassDeclaration) ||
          initializer?.isKind(SyntaxKind.ClassExpression)
        ) {
          console.log(name, "named export, class");
          extracted[name] = initializer.getType();
        } else if (initializer?.isKind(SyntaxKind.CallExpression)) {
          const callResult = initializer.getReturnType();
          if (callResult.isClass()) {
            console.log(name, "call expression, class");
            extracted[name] = callResult;
          } else if (callResult.getCallSignatures().length > 0) {
            console.log(name, "call expression, callable");
            extracted[name] = callResult;
          } else {
            console.log(name, "call expression unknown", callResult);
          }
        } else {
          console.log(name, "unknown?", initializer?.getKindName());
        }
      } else if (
        declaration.isKind(SyntaxKind.ClassDeclaration) ||
        declaration.isKind(SyntaxKind.ClassExpression)
      ) {
        console.log(name, "Klass detected!");
        extracted[name] = declaration.getType();
      } else {
        console.log(name, "unknown?", declaration.getFullText());
      }
    }
  }

  return extracted;
};

export default extractComponents;
