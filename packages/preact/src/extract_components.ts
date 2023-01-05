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
  return true; //node.getBaseClass()?.getSymbol()?.getEscapedName() != "Component";
};

const getParameterTypeFromFunction = (
  node: ArrowFunction | FunctionDeclaration | FunctionExpression
): Type | void => {
  return isFunctionalComponent(node)
    ? node.getParameters()[0].getType()
    : undefined;
};

const getParameterTypeFromClass = (
  node: ClassDeclaration | ClassExpression
): Type | undefined => {
  return doesClassExtendComponent(node)
    ? node.getExtends()?.getTypeArguments()[0].getType()
    : undefined;
};

const processFunctionDeclaration = (node: Node): Type | void => {
  if (
    node.isKind(SyntaxKind.ArrowFunction) ||
    node.isKind(SyntaxKind.FunctionDeclaration) ||
    node.isKind(SyntaxKind.FunctionExpression)
  ) {
    return getParameterTypeFromFunction(node);
  }
};

const processClassDeclaration = (node: Node): Type | void => {
  if (
    node?.isKind(SyntaxKind.ClassDeclaration) ||
    node?.isKind(SyntaxKind.ClassExpression)
  ) {
    return getParameterTypeFromClass(node);
  }
};

const processVariableDeclaration = (node: Node): Type | void => {
  if (node.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = node.getInitializer();
    if (
      initializer?.isKind(SyntaxKind.ArrowFunction) ||
      initializer?.isKind(SyntaxKind.FunctionExpression)
    ) {
      return processFunctionDeclaration(initializer);
    } else if (
      initializer?.isKind(SyntaxKind.ClassDeclaration) ||
      initializer?.isKind(SyntaxKind.ClassExpression)
    ) {
      return processClassDeclaration(initializer);
    }
  }
};

const processCallExpression = (
  node: Node,
  typeChecker: TypeChecker
): Type | void => {
  const initType = typeChecker.getTypeAtLocation(node);
  const [callResult] = initType.getSymbol()?.getDeclarations() ?? [];
  if (callResult?.isKind(SyntaxKind.ClassExpression)) {
    return getParameterTypeFromClass(callResult);
  }
  const [signature] = initType.getCallSignatures();
  if (signature) {
    return getParameterTypeFromFunction(
      signature.getDeclaration() as FunctionExpression
    );
  }
};

const processIdentifier = (node: Node): Type | void => {
  const [declaration] = node.getSymbol()?.getDeclarations() ?? [];
  if (!declaration) return;
  return (
    getParameterTypeFromFunction(declaration as ArrowFunction) ??
    getParameterTypeFromClass(declaration as ClassExpression)
  );
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
    } else if (initializer?.isKind(SyntaxKind.Identifier)) {
      const [declaration] = initializer.getSymbol()?.getDeclarations() ?? [];
      if (!declaration) return;
      if (declaration.isKind(SyntaxKind.ClassDeclaration)) {
        return getParameterTypeFromClass(declaration);
      }
      if (
        declaration.isKind(SyntaxKind.ArrowFunction) ||
        declaration.isKind(SyntaxKind.FunctionExpression)
      ) {
        return getParameterTypeFromFunction(declaration);
      }
      return getParamType(declaration, typeChecker);
    } else if (initializer) {
      return getParamType(initializer, typeChecker);
    }
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
