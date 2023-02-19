import { Project, Symbol } from "ts-morph";
import { test, expect } from "vitest";
import extractComponents from "./extract_components";

test("extracts exported Preact functional components from a file", async () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const detected = extractComponents(
    project,
    "src/examples/function_components.tsx"
  );

  expect(new Set(Object.keys(detected))).toEqual(
    new Set([
      "Functional",
      "AlsoFunctional",
      "Freeform",
      "InlineProps",
      "Untyped",
      "FuncDeclaration",
      "FuncExpr",
      "HigherOrder",
      "lowercaseComponent",
      "default",
      "NumberComponent",
      "StringComponent",
      "NullComponent",
      "FragmentComponent",
      "Aliased",
    ])
  );

  for (const [key, value] of Object.entries(detected)) {
    if (key == "Untyped") {
      expect(value.getText()).toEqual("any");
    } else {
      expect(
        new Set(value.getProperties().map((prop) => prop.getName()))
      ).toEqual(new Set(["count", "name", "attributes"]));
    }
  }
});

test("extracts exported Preact class components from a file", async () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const result = extractComponents(
    project,
    "src/examples/class_components.tsx"
  );
  const detected = new Set(Object.keys(result));
  expect(detected).toEqual(
    new Set([
      "Explicit",
      "Untyped",
      "Implicit",
      "Assigned",
      "OuterExported",
      "default",
      "Constructed",
    ])
  );
  for (const [key, value] of Object.entries(result)) {
    if (key == "Untyped") {
      expect(value.getText()).toEqual("unknown");
    } else {
      expect(
        new Set(value.getProperties().map((prop) => prop.getName()))
      ).toEqual(new Set(["count", "name", "attributes"]));
    }
  }
});

const getTypeOfProperty = (node: Symbol) =>
  node?.getDeclarations()[0]?.getType().getText();

test("correctly determines the prop types from an imported component", () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const result = extractComponents(project, "src/examples/imported.tsx");
  expect(
    new Set(result.Reexported.getProperties().map((prop) => prop.getName()))
  ).toEqual(new Set(["count", "name", "attributes"]));

  expect(getTypeOfProperty(result.Reexported.getProperty("count")!)).toEqual(
    "number"
  );
  expect(getTypeOfProperty(result.Reexported.getProperty("name")!)).toEqual(
    "string"
  );
  expect(
    getTypeOfProperty(result.Reexported.getProperty("attributes")!)
  ).toEqual("Record<string, string>");
});
