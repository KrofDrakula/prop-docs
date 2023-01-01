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
      "ImplicitlyAComponent",
      "lowercaseComponent",
      "default",
    ])
  );
});

test("extracts exported Preact class components from a file", async () => {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });
  const detected = new Set(
    Object.keys(extractComponents(project, "src/examples/class_components.tsx"))
  );
  expect(detected).toEqual(
    new Set(["Explicit", "Untyped", "Implicit", "Assigned", "default"])
  );
});
