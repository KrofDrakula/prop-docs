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
  ClassDeclaration,
  ClassExpression,
  ObjectLiteralElementLike,
} from "ts-morph";

type ComponentExtractor = (node: Node, typeChecker: TypeChecker) => Type | void;

const getArgsTypeFromFunction = (
  node: ArrowFunction | FunctionDeclaration | FunctionExpression,
  typeChecker: TypeChecker,
  componentExtractor?: ComponentExtractor
): Type | void => {
  // we first assume a standard story function; if we can resolve it, we use that
  let type: Type | void = node.getParameters()[0]?.getType();
  // if we cannot resolve args for the story function, we try the component extractor
  if (!type && componentExtractor) type = componentExtractor(node, typeChecker);
  return type;
};

const getArgsTypeFromClassComponent = (
  node: ClassDeclaration | ClassExpression,
  typeChecker: TypeChecker,
  componentExtractor?: ComponentExtractor
): Type | void => {
  return componentExtractor?.(node, typeChecker);
};

const getDefaultExport = (node: Node): Node | undefined => {
  return node.getSourceFile().getDefaultExportSymbol()?.getDeclarations()[0];
};

const getPropertyValue = (
  node: ObjectLiteralElementLike | undefined
): Node | void => {
  if (node?.isKind(SyntaxKind.PropertyAssignment)) {
    return node.getInitializer();
  } else if (node?.isKind(SyntaxKind.ShorthandPropertyAssignment)) {
    return node
      .getChildrenOfKind(SyntaxKind.Identifier)[0]
      .getDefinitionNodes()[0];
  }
};

const getArgsFromStoryObject = (
  node: ObjectLiteralExpression,
  typeChecker: TypeChecker,
  componentExtractor?: ComponentExtractor
): Type | void => {
  // we first check the `render` property since that overrides the `component` property
  const renderFn = getPropertyValue(node.getProperty("render"));
  if (renderFn) return getArgsType(renderFn, typeChecker, componentExtractor);

  // we fall back on the `component` property
  const componentFn = getPropertyValue(node.getProperty("component"));
  if (componentFn)
    return getArgsType(componentFn, typeChecker, componentExtractor);

  // at this point, the meta might define the component to render
  const meta = getDefaultExport(node);
  if (meta) {
    const defaultObj = meta
      .asKind(SyntaxKind.ExportAssignment)
      ?.getExpression()
      .asKind(SyntaxKind.ObjectLiteralExpression);
    if (defaultObj) {
      const defaultComponentFn = getPropertyValue(
        defaultObj.getProperty("component")
      );
      if (defaultComponentFn)
        return getArgsType(defaultComponentFn, typeChecker, componentExtractor);
    }
  }
};

const getArgsType = (
  node: Node,
  typeChecker: TypeChecker,
  componentExtractor?: ComponentExtractor
): Type | void => {
  if (
    node.isKind(SyntaxKind.ArrowFunction) ||
    node.isKind(SyntaxKind.FunctionDeclaration) ||
    node.isKind(SyntaxKind.FunctionExpression)
  ) {
    return getArgsTypeFromFunction(node, typeChecker, componentExtractor);
  } else if (
    node.isKind(SyntaxKind.ClassDeclaration) ||
    node.isKind(SyntaxKind.ClassExpression)
  ) {
    return getArgsTypeFromClassComponent(node, typeChecker, componentExtractor);
  } else if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return getArgsFromStoryObject(node, typeChecker);
  } else if (node.isKind(SyntaxKind.VariableDeclaration)) {
    const initializer = node.getInitializer();
    if (initializer?.isKind(SyntaxKind.CallExpression)) {
      const initType = typeChecker.getTypeAtLocation(initializer);
      const callResult = initType.getSymbol()?.getDeclarations()[0];
      if (callResult?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        return getArgsFromStoryObject(callResult, typeChecker);
      }
      const [signature] = initType.getCallSignatures();
      if (signature) {
        return getArgsTypeFromFunction(
          signature.getDeclaration() as FunctionExpression,
          typeChecker,
          componentExtractor
        );
      }
    } else if (initializer) {
      return getArgsType(initializer, typeChecker, componentExtractor);
    }
  } else if (node.isKind(SyntaxKind.Identifier)) {
    const declaration = node.getSymbol()?.getDeclarations()[0];
    if (declaration)
      return getArgsType(declaration, typeChecker, componentExtractor);
  }
};

/**
 * Given a project and file name, extracts exported stories and returns their
 * `argTypes` as a `Record<string, SBType>`.
 * @param project The project to parse and interpret files from.
 * @param filePath The filename relative to the project root.
 * @param componentExtractor An optional function that extracts arg types for a particular frontend framework.
 */
const extractStoryArgs = (
  project: Project,
  filePath: string,
  componentExtractor?: ComponentExtractor
): Record<string, Type> => {
  const stories: Record<string, Type> = {};
  const typeChecker = project.getTypeChecker();
  const source = project.getSourceFileOrThrow(filePath);
  for (const [name, declarations] of source.getExportedDeclarations()) {
    if (name == "default") continue;
    for (const declaration of declarations) {
      const detectedArgs = getArgsType(
        declaration,
        typeChecker,
        componentExtractor
      );
      if (detectedArgs) stories[name] = detectedArgs;
    }
  }
  return stories;
};

export default extractStoryArgs;
