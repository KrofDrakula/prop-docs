import {
  Project,
  SyntaxKind,
  Type,
  Node,
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
  ObjectLiteralExpression,
  ClassDeclaration,
  ClassExpression,
  ObjectLiteralElementLike,
} from "ts-morph";

type ComponentExtractor = (node: Node) => Type | undefined;

const getArgsTypeFromFunction = (
  node: ArrowFunction | FunctionDeclaration | FunctionExpression,
  componentExtractor: ComponentExtractor | undefined
): Type | undefined => {
  let type: Type | undefined = componentExtractor
    ? componentExtractor(node)
    : node.getParameters()[0]?.getType();
  return type;
};

const getArgsTypeFromClassComponent = (
  node: ClassDeclaration | ClassExpression,
  componentExtractor: ComponentExtractor | undefined
): Type | undefined => {
  return componentExtractor?.(node);
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
  componentExtractor: ComponentExtractor | undefined
): Type | undefined => {
  // we first check the `render` property since that overrides the `component` property
  const renderFn = getPropertyValue(node.getProperty("render"));
  if (renderFn) return getArgsType(renderFn, componentExtractor);

  // we fall back on the `component` property
  const componentFn = getPropertyValue(node.getProperty("component"));
  if (componentFn) return getArgsType(componentFn, componentExtractor);

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
        return getArgsType(defaultComponentFn, componentExtractor);
    }
  }

  return undefined;
};

const FUNCTIONAL_PATTERN = /^(FunctionalComponent|FunctionComponent)</;
const STORY_OBJ_PATTERN = /^StoryObj</;
const COMPONENT_PROPS_PATTERN = /^ComponentProps</;

const extractPropsFromType = (type: Type | undefined): Type | undefined => {
  if (!type) return;
  const typeText = type.getText();
  if (FUNCTIONAL_PATTERN.test(typeText) || STORY_OBJ_PATTERN.test(typeText)) {
    const props = type.getAliasTypeArguments()[0];
    if (props) return extractPropsFromType(props);
  } else if (COMPONENT_PROPS_PATTERN.test(typeText)) {
    const component = type.getAliasTypeArguments()[0];
    if (component) return extractPropsFromType(component);
  }
  return type;
};

const getArgsType = (
  node: Node,
  componentExtractor: ComponentExtractor | undefined
): Type | undefined => {
  if (
    node.isKind(SyntaxKind.ArrowFunction) ||
    node.isKind(SyntaxKind.FunctionDeclaration) ||
    node.isKind(SyntaxKind.FunctionExpression)
  ) {
    return getArgsTypeFromFunction(node, componentExtractor);
  } else if (
    node.isKind(SyntaxKind.ClassDeclaration) ||
    node.isKind(SyntaxKind.ClassExpression)
  ) {
    return getArgsTypeFromClassComponent(node, componentExtractor);
  } else if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return getArgsFromStoryObject(node, componentExtractor);
  } else if (node.isKind(SyntaxKind.VariableDeclaration)) {
    const assignedType = node.getType();
    if (assignedType.isClass()) {
      const initializer = node.getInitializer() as ClassExpression;
      if (initializer)
        return getArgsTypeFromClassComponent(initializer, componentExtractor);
    } else if (assignedType.getCallSignatures()?.length > 0) {
      const initializer = node.getInitializer() as FunctionExpression;
      if (initializer)
        return getArgsTypeFromFunction(initializer, componentExtractor);
    }
    return extractPropsFromType(assignedType);
  } else if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return getArgsFromStoryObject(node, componentExtractor);
  } else if (node.isKind(SyntaxKind.Identifier)) {
    const declaration = node.getSymbol()?.getDeclarations()[0];
    if (declaration) return getArgsType(declaration, componentExtractor);
  } else if (node.isKind(SyntaxKind.ImportSpecifier)) {
    const exported = node
      .getImportDeclaration()
      .getModuleSpecifierSourceFile()
      ?.getExportedDeclarations()
      .get(node.getText())?.[0];
    if (exported) {
      return getArgsType(exported, componentExtractor);
    }
  }
  return undefined;
};

/**
 * Given a project and file name, extracts exported stories and returns their
 * `argTypes` as a `Record<string, SBType>`.
 * @param project The project to parse and interpret files from.
 * @param filePath The filename relative to the project root.
 * @param componentExtractor An optional function that extracts arg types for a particular frontend framework.
 */
const extractCSF = (
  project: Project,
  filePath: string,
  componentExtractor?: ComponentExtractor
): Record<string, Type> => {
  const stories: Record<string, Type> = {};
  const source = project.getSourceFileOrThrow(filePath);
  for (const [name, declarations] of source.getExportedDeclarations()) {
    if (name == "default") continue;
    for (const declaration of declarations) {
      const detectedArgs = getArgsType(declaration, componentExtractor);
      if (detectedArgs) stories[name] = detectedArgs;
    }
  }
  return stories;
};

export default extractCSF;
