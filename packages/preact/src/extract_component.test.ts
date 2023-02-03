import { Project } from "ts-morph";
import { test, expect } from "vitest";
import extractComponents from "./extract_components";

test("extracts exported Preact functional components from a file", async () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const detected = new Set(
    Object.keys(
      extractComponents(project, "src/examples/function_components.tsx")
    )
  );
  expect(detected).toEqual(
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
      expect(value.getText()).toEqual("unknown");
    } else {
      expect(value.getText()).toMatch(/\.ExampleProps$/);
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
      expect(value.getText()).toMatch(/\.ExampleProps$/);
    }
  }
});
