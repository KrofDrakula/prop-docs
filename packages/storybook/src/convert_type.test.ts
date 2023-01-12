import { expect, test } from "vitest";
import { Project, SourceFile, Type } from "ts-morph";
import dedent from "dedent";
import convertType from "./convert_type";

const getExportedType = (
  sourceFile: SourceFile,
  exportedName: string
): Type | void => {
  return sourceFile
    .getExportedDeclarations()
    ?.get(exportedName)?.[0]
    ?.getType();
};

test("should return empty ArgTypes when given non-iterable, non-object values", () => {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const sourceFile = project.createSourceFile(
    "a.ts",
    dedent`
      export const myProps = false;
    `
  );
  const argTypes = convertType(getExportedType(sourceFile, "myProps")!);
  expect(argTypes).toEqual({});
});

test("should return an object description when props are iterable objects", () => {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const sourceFile = project.createSourceFile(
    "a.ts",
    dedent`
      export const myProps = {
        truthy: true,
        name: 'hello',
        age: 3,
        array: ['three'],
        object: { one: 'two' },
        slap: () => 4
      };
    `
  );
  const argTypes = convertType(getExportedType(sourceFile, "myProps")!);
  expect(argTypes).toEqual({
    truthy: { type: { name: "boolean", required: true } },
    name: { type: { name: "string", required: true } },
    age: { type: { name: "number", required: true } },
    array: { type: { name: "array", required: true, value: {} } },
    object: { type: { name: "object", required: true, value: {} } },
    slap: { type: { name: "function", required: true } },
  });
});

test("it should provide parameter descriptions from JSDoc", () => {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const sourceFile = project.createSourceFile(
    "a.ts",
    dedent`
      export const myProps = {
        /**
         * Provides the name of the person. It should work
         * with multiline descriptions.
         */
        name: 'hello'
      };
    `
  );
  const argTypes = convertType(getExportedType(sourceFile, "myProps")!);
  expect(argTypes).toEqual({
    name: {
      type: { name: "string", required: true },
      description:
        "Provides the name of the person. It should work\nwith multiline descriptions.",
    },
  });
});

test("it should provide required flags for optional props", () => {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const sourceFile = project.createSourceFile(
    "a.ts",
    dedent`
      export const myProps = {
        name?: 'hello'
      };
    `
  );
  const argTypes = convertType(getExportedType(sourceFile, "myProps")!);
  expect(argTypes).toEqual({
    name: { type: { name: "string", required: false } },
  });
});

test("is should handle exported interfaces", () => {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const sourceFile = project.createSourceFile(
    "a.ts",
    dedent`
      export interface ExportedInterface {
        name?: string;
        age: number;
      };
    `
  );
  const argTypes = convertType(
    getExportedType(sourceFile, "ExportedInterface")!
  );
  expect(argTypes).toEqual({
    name: { type: { name: "string", required: false } },
    age: { type: { name: "number", required: true } },
  });
});
