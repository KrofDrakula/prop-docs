import {
  ts,
  Project,
  SyntaxKind,
  Type,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
} from "ts-morph";

const getParamType = (
  t: FunctionDeclaration | FunctionExpression | ArrowFunction
): Type<ts.Type> => t.getParameters()[0].getType();

const extractComponents = (
  project: Project,
  filePath: string
): Record<string, Type<ts.Type>> => {
  const extracted: Record<string, Type<ts.Type>> = {};
  const typeChecker = project.getTypeChecker();
  const source = project.getSourceFileOrThrow(filePath);

  for (const [name, declarations] of source.getExportedDeclarations()) {
    for (const declaration of declarations) {
      if (
        declaration.isKind(SyntaxKind.ArrowFunction) ||
        declaration.isKind(SyntaxKind.FunctionDeclaration) ||
        declaration.isKind(SyntaxKind.FunctionExpression)
      ) {
        extracted[name] = getParamType(declaration);
      } else if (declaration.isKind(SyntaxKind.VariableDeclaration)) {
        const initializer = declaration.getInitializer();
        if (
          initializer?.isKind(SyntaxKind.ArrowFunction) ||
          initializer?.isKind(SyntaxKind.FunctionExpression)
        ) {
          extracted[name] = getParamType(initializer);
        } else if (
          initializer?.isKind(SyntaxKind.ClassDeclaration) ||
          initializer?.isKind(SyntaxKind.ClassExpression)
        ) {
          extracted[name] = initializer.getType();
        } else if (initializer?.isKind(SyntaxKind.CallExpression)) {
          const callResult = initializer.getReturnType();

          if (callResult.isClass()) {
            // FIXME: extract props from class
            extracted[name] = callResult;
          } else if (callResult.getCallSignatures().length > 0) {
            // FIXME: extract props from function parameter
            extracted[name] = callResult;
          } else {
            console.log(name, "call expression", callResult.getText());
          }
        } else {
          console.log(name, "unknown?", initializer?.getType().getText());
        }
      } else if (
        declaration.isKind(SyntaxKind.ClassDeclaration) ||
        declaration.isKind(SyntaxKind.ClassExpression)
      ) {
        extracted[name] = declaration.getType();
      } else {
        console.log(name, "unknown?", declaration.getFullText());
      }
    }
  }

  return extracted;
};

export default extractComponents;
