import { expect, test } from "vitest";
import { Project, SourceFile, Type } from "ts-morph";
import dedent from "dedent";
import convertType from "./convert_type";

const getExportedType = (
  sourceFile: SourceFile,
  exportedName: string
): Type | void => {
  for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
    if (name == exportedName) {
      return declarations[0].getType();
    }
  }
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
    truthy: { type: "boolean" },
    name: { type: "string" },
    age: { type: "number" },
    array: {},
    object: {},
    slap: { type: "function" },
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
      type: "string",
      description:
        "Provides the name of the person. It should work\nwith multiline descriptions.",
    },
  });
});
