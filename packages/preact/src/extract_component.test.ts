import { Project } from "ts-morph";
import { test, expect } from "vitest";
import extractComponentParams from "./extract_components";

test("extracts exported Preact functional components from a file", async () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const detected = new Set(
    Object.keys(
      extractComponentParams(project, "src/examples/function_components.tsx")
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
});

test("extracts exported Preact class components from a file", async () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const result = extractComponentParams(
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
});
