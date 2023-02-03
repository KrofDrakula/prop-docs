import { expect, test } from "vitest";
import { Project } from "ts-morph";
import dedent from "dedent";
import extractCSF from "./extract_csf";
import convertType from "./convert_type";

test("should work for function type stories", () => {
  const project = new Project();
  project.createSourceFile(
    "a.ts",
    dedent`
      interface Args {
        name: string;
        age?: number;
      }

      export const CSFStory = (args: Args) => <div>Hello!</div>;
    `
  );

  const extractedTypes = extractCSF(project, "a.ts");
  expect(extractedTypes).toHaveProperty("CSFStory");
  const argTypes = convertType(extractedTypes.CSFStory);
  expect(argTypes).toEqual({
    name: { type: { name: "string", required: true } },
    age: { type: { name: "number", required: false } },
  });
});

test("should work for CSF-style objects", () => {
  const project = new Project();
  project.createSourceFile(
    "a.ts",
    dedent`
      interface Args {
        name: string;
        age?: number;
      }

      export const RenderStory = {
        render: (args: Args) => <div>Hello!</div>
      };

      export const ComponentStory = {
        component: (args: Args) => <div>Hello!</div>
      };
    `
  );

  const extractedTypes = extractCSF(project, "a.ts");

  ["RenderStory", "ComponentStory"].forEach((storyName) => {
    expect(extractedTypes).toHaveProperty(storyName);
    const convertedType = convertType(extractedTypes[storyName]);
    expect(convertedType).toEqual({
      name: { type: { name: "string", required: true } },
      age: { type: { name: "number", required: false } },
    });
  });
});

test('should inherit "component" property from meta', () => {
  const project = new Project();
  project.createSourceFile(
    "a.ts",
    dedent`
      interface Args {
        name: string;
        age?: number;
      }

      const MyButton = (args: Args) => <div>Hello!</div>;

      export default {
        component: MyButton
      };

      export const AStory = {};
    `
  );

  const extractedTypes = extractCSF(project, "a.ts");

  expect(extractedTypes).toHaveProperty("AStory");
  const convertedType = convertType(extractedTypes.AStory);
  expect(convertedType).toEqual({
    name: { type: { name: "string", required: true } },
    age: { type: { name: "number", required: false } },
  });
});

test('should resolve "component" through indirection', () => {
  const project = new Project();
  project.createSourceFile(
    "a.ts",
    dedent`
      interface Args {
        name: string;
        age?: number;
      }

      const MyButton = (args: Args) => <div>Hello!</div>;

      const component = MyButton

      export default {
        component
      };

      export const AStory = {};
    `
  );

  const extractedTypes = extractCSF(project, "a.ts");

  expect(extractedTypes).toHaveProperty("AStory");
  const convertedType = convertType(extractedTypes.AStory);
  expect(convertedType).toEqual({
    name: { type: { name: "string", required: true } },
    age: { type: { name: "number", required: false } },
  });
});
