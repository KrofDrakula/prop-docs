import {
  Project,
  SyntaxKind,
  Type,
  Node,
  TypeChecker,
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
  ObjectLiteralExpression,
} from "ts-morph";

const getArgsTypeFromFunction = (
  node: ArrowFunction | FunctionDeclaration | FunctionExpression
): Type | void => {
  // we assume it returns the correct return type for a story, we don't
  // check for component specifics because different renderers would return
  // different types of nodes, potentially
  return node.getParameters()[0]?.getType();
};

const getArgsFromStoryObject = (node: ObjectLiteralExpression): Type | void => {
  // we first check the `render` property since that overrides the `component` property
  const renderFn = node.getProperty("render");
  if (renderFn) {
    const assignment = renderFn.asKind(SyntaxKind.PropertyAssignment);
    if (!assignment) return;
    const init = assignment.getInitializer()!;
    if (
      init.isKind(SyntaxKind.ArrowFunction) ||
      init.isKind(SyntaxKind.FunctionExpression)
    ) {
      return getArgsTypeFromFunction(init);
    }
  }
  // we fall back on the `component` property
  // TODO: since the `component` property is "inherited" from the meta object,
  //       we need to also check the meta["component"] property if this fails
  const componentFn = node.getProperty("component");
  if (componentFn) {
    const assignment = componentFn.asKind(SyntaxKind.PropertyAssignment);
    if (!assignment) return;
    const init = assignment.getInitializer()!;
    if (
      init.isKind(SyntaxKind.ArrowFunction) ||
      init.isKind(SyntaxKind.FunctionExpression)
    ) {
      return getArgsTypeFromFunction(init);
    }
  }
};

const getArgsType = (node: Node, typeChecker: TypeChecker): Type | void => {
  if (
    node.isKind(SyntaxKind.ArrowFunction) ||
    node.isKind(SyntaxKind.FunctionDeclaration) ||
    node.isKind(SyntaxKind.FunctionExpression)
  ) {
    return getArgsTypeFromFunction(node);
  } else if (node.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = node.getInitializer();
    if (initializer?.isKind(SyntaxKind.CallExpression)) {
      const initType = typeChecker.getTypeAtLocation(initializer);
      const callResult = initType.getSymbol()?.getDeclarations()[0];
      if (callResult?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        return getArgsFromStoryObject(callResult);
      }
      const [signature] = initType.getCallSignatures();
      if (signature) {
        return getArgsTypeFromFunction(
          signature.getDeclaration() as FunctionExpression
        );
      }
    } else if (initializer?.isKind(SyntaxKind.Identifier)) {
      const [declaration] = initializer.getSymbol()?.getDeclarations() ?? [];
      if (!declaration) return;
      return getArgsType(declaration, typeChecker);
    } else if (initializer) {
      return getArgsType(initializer, typeChecker);
    }
  } else if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return getArgsFromStoryObject(node);
  }
};

const extractStoryArgs = (
  project: Project,
  filePath: string
): Record<string, Type> => {
  const stories: Record<string, Type> = {};
  const typeChecker = project.getTypeChecker();
  const source = project.getSourceFileOrThrow(filePath);
  for (const [name, declarations] of source.getExportedDeclarations()) {
    for (const declaration of declarations) {
      const detectedArgs = getArgsType(declaration, typeChecker);
      if (detectedArgs) {
        stories[name] = detectedArgs;
      }
    }
  }
  return stories;
};

export default extractStoryArgs;
