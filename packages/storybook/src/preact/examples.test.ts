import { expect, test } from "vitest";
import { extractComponentParams } from "@krofdrakula/prop-docs-preact";
import { Project } from "ts-morph";
import dedent from "dedent";
import convertType from "../convert_type";

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

    export const Showcase: FunctionalComponent<Props> = ({name,age}) => (
      <div>
        <span>{name}</span>
        {age ? <span>{age}</span> : null}
      </div>
    );
  `
  );
  const { Showcase } = extractComponentParams(project, "a.ts");
  const argTypes = convertType(Showcase);
  expect(argTypes).toEqual({ name: {}, age: {} });
});
