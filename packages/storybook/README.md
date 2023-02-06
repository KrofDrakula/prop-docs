This package is part of the `@krofdrakula/prop-docs-*` ecosystem. Please visit
the monorepository for a complete guide:

https://github.com/krofdrakula/prop-docs

<!--#content-->

## Storybook

```
yarn add @krofdrakula/prop-docs-storybook
```

When provided with an extracted [`Type`](https://ts-morph.com/details/types)
this package will enable you to create an `ArgTypes` description for a specific
component.

For example, extracting a Preact component requires parsing the components using
`@krofdrakula/prop-docs-preact` and then using `convertType` to return the
correct description:

```ts
import { Project } from "ts-morph";
import { extractComponents } from "@krofdrakula/prop-docs-preact";
import { convertType } from "@krofdrakula/prop-docs-storybook";

const project = new Project();
// this project assumes that `components.tsx` exists as in the Preact example
const { Profile } = extractComponents(project, "components.tsx");
const profileArgTypes = convertType(Profile);
//    ^? {
//         name: {
//           type: { name: "string", required: true },
//           description: "Person's name"
//         },
//         image: {
//           type: { name: "string", required: true },
//           description: "Person's image URL"
//         }
//       }
```

<!--#/content-->
