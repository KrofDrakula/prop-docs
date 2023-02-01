import {
  Project,
  SyntaxKind,
  Type,
  Node,
  TypeChecker,
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
  ClassDeclaration,
  ClassExpression,
} from "ts-morph";

const JSX_SYMBOL_NAMES = new Set(["Element", "VNode"]);

const isFunctionalComponent = (node: Node): boolean => {
  if (
    !(
      node.isKind(SyntaxKind.ArrowFunction) ||
      node.isKind(SyntaxKind.FunctionDeclaration) ||
      node.isKind(SyntaxKind.FunctionExpression)
    )
  )
    return false;

  const returnType = node.getReturnType();

  // TODO: this should be compatible with `ReturnType<FunctionalComponent>`
  return (
    returnType.isNull() ||
    returnType.isUndefined() ||
    returnType.isString() ||
    returnType.isBoolean() ||
    returnType.isNumber() ||
    JSX_SYMBOL_NAMES.has(returnType.getSymbol()?.getEscapedName()!)
  );
};

const doesClassExtendComponent = (node: Node): boolean => {
  if (
    !(
      node.isKind(SyntaxKind.ClassDeclaration) ||
      node.isKind(SyntaxKind.ClassExpression)
    )
  )
    return false;
  return true;
};

const getParameterTypeFromFunction = (
  node: ArrowFunction | FunctionDeclaration | FunctionExpression
): Type | void => {
  return isFunctionalComponent(node)
    ? node.getParameters()[0]?.getType()
    : undefined;
};

const getParameterTypeFromClass = (
  node: ClassDeclaration | ClassExpression
): Type | undefined => {
  return doesClassExtendComponent(node)
    ? node.getExtends()?.getTypeArguments()[0]?.getType()
    : undefined;
};

const getParamType = (node: Node, typeChecker: TypeChecker): Type | void => {
  if (
    node.isKind(SyntaxKind.ArrowFunction) ||
    node.isKind(SyntaxKind.FunctionDeclaration) ||
    node.isKind(SyntaxKind.FunctionExpression)
  ) {
    return getParameterTypeFromFunction(node);
  } else if (
    node.isKind(SyntaxKind.ClassDeclaration) ||
    node.isKind(SyntaxKind.ClassExpression)
  ) {
    return getParameterTypeFromClass(node);
  } else if (node.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = node.getInitializer();
    if (initializer?.isKind(SyntaxKind.CallExpression)) {
      const initType = typeChecker.getTypeAtLocation(initializer);
      const callResult = initType.getSymbol()?.getDeclarations()[0];
      if (callResult?.isKind(SyntaxKind.ClassExpression)) {
        return getParameterTypeFromClass(callResult);
      }
      const [signature] = initType.getCallSignatures();
      if (signature) {
        return getParameterTypeFromFunction(
          signature.getDeclaration() as FunctionExpression
        );
      }
    } else if (initializer) {
      return getParamType(initializer, typeChecker);
    }
  } else if (node.isKind(SyntaxKind.Identifier)) {
    const declaration = node.getSymbol()?.getDeclarations()[0];
    if (declaration) return getParamType(declaration, typeChecker);
  }
};

const extractComponentParams = (
  project: Project,
  filePath: string
): Record<string, Type> => {
  const extracted: Record<string, Type> = {};
  const typeChecker = project.getTypeChecker();
  const source = project.getSourceFileOrThrow(filePath);

  for (const [name, declarations] of source.getExportedDeclarations()) {
    for (const declaration of declarations) {
      const detectedParams = getParamType(declaration, typeChecker);
      if (detectedParams) {
        extracted[name] = detectedParams;
      }
    }
  }

  return extracted;
};

export default extractComponentParams;
