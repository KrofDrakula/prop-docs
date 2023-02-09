This package is part of the `@krofdrakula/prop-docs-*` ecosystem. Please visit
the monorepository for a complete walkthrough:

https://github.com/krofdrakula/prop-docs

<!--#content-->

## Preact

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
import { extractComponents } from "@krofdrakula/prop-docs-preact";

const project = new Project({
  // Configure your tsconfig.json path and other options.
  // You can opt to explicitly add your own source files instead and configure
  // `compilerOptions` here if needed.
});

const { Badge, Profile } = extractComponents(project, "components.tsx");
//             ^? { image: string; name: string; }
//      ^? { name: string; count: number; }
```

The return types are instances of [`Type`](https://ts-morph.com/details/types)
which provides the description of the props object.

<!--#/content-->
