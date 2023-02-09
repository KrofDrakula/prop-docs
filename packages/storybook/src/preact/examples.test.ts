import { expect, test } from "vitest";
import { getPropsType } from "@krofdrakula/prop-docs-preact";
import { Project } from "ts-morph";
import dedent from "dedent";
import convertType from "../convert_type";
import extractCSF from "../extract_csf";

test("should be able to use extracted functional component props from Preact components", () => {
  const project = new Project();
  project.createSourceFile(
    "a.ts",
    dedent`
    /* @jsxRuntime automatic @jsxImportSource preact */
    import { FunctionalComponent } from 'preact';

    interface Props {
      /** Provide the name of the product to display */
      name: string;
      /** Optionally specify the age of the product */
      age?: number;
    }

    export const Showcase: FunctionalComponent<Props> = ({ name, age }) => (
      <div>
        <span>{name}</span>
        {age ? <span>{age}</span> : null}
      </div>
    );
  `
  );
  const { Showcase } = extractCSF(project, "a.ts", getPropsType);
  expect(Showcase).toBeDefined();
  const argTypes = convertType(Showcase);
  expect(argTypes).toEqual({
    name: {
      type: {
        name: "string",
        required: true,
      },
      description: "Provide the name of the product to display",
    },
    age: {
      type: {
        name: "number",
        required: false,
      },
      description: "Optionally specify the age of the product",
    },
  });
});

test("should be able to use extracted props from Preact class components", () => {
  const project = new Project();
  project.createSourceFile(
    "a.ts",
    dedent`
      /* @jsxRuntime automatic @jsxImportSource preact */
      import { Component } from 'preact';

      interface Props {
        /** Provide the name of the product to display */
        name: string;
        /** Optionally specify the age of the product */
        age?: number;
      }

      export class Showcase extends Component<Props> {
        render() {
          const { name, age } = this.props;
          return (
            <div>
              <span>{name}</span>
              {age ? <span>{age}</span> : null}
            </div>
          );
        }
      };
    `
  );
  const { Showcase } = extractCSF(project, "a.ts", getPropsType);
  expect(Showcase).toBeDefined();
  const argTypes = convertType(Showcase);
  expect(argTypes).toEqual({
    name: {
      type: {
        name: "string",
        required: true,
      },
      description: "Provide the name of the product to display",
    },
    age: {
      type: {
        name: "number",
        required: false,
      },
      description: "Optionally specify the age of the product",
    },
  });
});

test("should be able to extract props from imported types", () => {
  const project = new Project();
  project.createSourceFile(
    "int.ts",
    dedent`
      export interface Props {
        /** Provide the name of the product to display */
        name: string;
        /** Optionally specify the age of the product */
        age?: number;
      }
    `
  );
  project.createSourceFile(
    "a.ts",
    dedent`
      /* @jsxRuntime automatic @jsxImportSource preact */
      import { Props } from './int';
      import { FunctionalComponent } from 'preact';

      export const Showcase: FunctionalComponent<Props> = ({name,age}) => (
        <div>
          <span>{name}</span>
          {age ? <span>{age}</span> : null}
        </div>
      );
    `
  );
  const { Showcase } = extractCSF(project, "a.ts", getPropsType);
  expect(Showcase).toBeDefined();
  const argTypes = convertType(Showcase);
  expect(argTypes).toEqual({
    name: {
      type: {
        name: "string",
        required: true,
      },
      description: "Provide the name of the product to display",
    },
    age: {
      type: {
        name: "number",
        required: false,
      },
      description: "Optionally specify the age of the product",
    },
  });
});

test("should be able to work with stories importing Preact components", () => {
  const project = new Project();
  project.createSourceFile(
    "comp.ts",
    dedent`
      /* @jsxRuntime automatic @jsxImportSource preact */
      import { FunctionalComponent } from 'preact';

      interface Props {
        name: string,
        age?: number
      }

      export const FComponent: FunctionalComponent<Props> = ({
        name, age = 10
      }) => (
        <div>Hello, {name}! ({age})</div>
      );
    `
  );
  project.createSourceFile(
    "comp.stories.ts",
    dedent`
      import { FComponent } from './comp';

      export default {
        component: FComponent
      }

      export const Basic = {
        args: { name: 'John Doe' }
      };
    `
  );

  const stories = extractCSF(project, "comp.stories.ts", getPropsType);
  expect(stories).toHaveProperty("Basic");
  const converted = convertType(stories.Basic);
  expect(converted).toEqual({
    name: { type: { name: "string", required: true } },
    age: { type: { name: "number", required: false } },
  });
});
