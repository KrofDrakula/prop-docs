# prop-docs

A tool to extract property type information from JSX components using
TypeScript.

This library directly depends on [`ts-morph`](https://ts-morph.com/) and expects
to be passed a [`Project`](https://ts-morph.com/setup/) in order to leverage TS
type resolution.

This ecosystem uses the [`Type`](https://ts-morph.com/details/types) object as
the intermediate representation to provide type extraction and translation for
multiple different libraries.

You'll probably want to pair a specific front-end library (like Preact) with a
consumer application (like Storybook) that consumes types in its own format.

## Supported front-end libraries

### Preact

Install the `preact` package:

```
yarn add @krofdrakula/prop-docs-preact
```

Here's an example component file (`components.tsx`):

```ts
interface BadgeProps {
  /** Name of person */
  name: string;
  /** Notification count */
  count: number;
}

export const Badge: FunctionalComponent<BadgeProps> = ({ name, count }) => {
  return (
    <div>
      {name} ({count})
    </div>
  );
};

interface ProfileProps {
  /** Person's image URL */
  image: string;
  /** Person's name */
  name: string;
}

export class Profile extends Component<ProfileProps> {
  render() {
    const { image, name } = this.props;
    return <img src={image} title={name} />;
  }
}
```

To use the package, you'll need to instantiate the `Project` class and configure
it for your code base:

```ts
import { Project } from "ts-morph";
import { extractComponentParams } from '@krofdrakula/prop-docs-preact`;

const project = new Project({
  // Configure your tsconfig.json path and other options.
  // You can opt to explicitly add your own source files instead and configure
  // `compilerOptions` here if needed.
});

const { Badge, Profile } = extractComponentParams(project, 'components.tsx');
//             ^? { image: string; name: string; }
//      ^? { name: string; count: number; }
```

The return types are instances of [`Type`](https://ts-morph.com/details/types)
which provides the description of the props object.

## Supported framework adapters

### Storybook

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
import { extractComponentParams } from "@krofdrakula/prop-docs-preact";
import { convertType } from "@krofdrakula/prop-docs-storybook";

const project = new Project();
// this project assumes that `components.tsx` exists as in the Preact example
const { Profile } = extractComponentParams(project, "components.tsx");
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
