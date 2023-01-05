import { FunctionalComponent, FunctionComponent } from "preact";
import { ExampleProps } from "../example_props";

export const Functional: FunctionalComponent<ExampleProps> = (_props) => (
  <div />
);

export const AlsoFunctional: FunctionComponent<ExampleProps> = (_props) => (
  <div />
);

export const Freeform = (_props: ExampleProps) => <div />;

export const InlineProps = (_props: {
  count: number;
  name: string;
  attributes: Record<string, string>;
}) => <div />;

// @ts-expect-error
export const Untyped = (props) => <div />;

export function FuncDeclaration(_props: ExampleProps) {
  return <div />;
}

export const FuncExpr = function FuncExprInner(_props: ExampleProps) {
  return <div />;
};

export const HigherOrder = (
  (name: string) => (_props: ExampleProps) =>
    <div>{name}</div>
)("HigherOrder");

const Unexported = (_props: ExampleProps) => <div />;

// @ts-expect-error
const AnotherUnexported = (_props: ExampleProps) => <div />;

export const lowercaseComponent = (_props: ExampleProps) => <div />;

export default (_props: ExampleProps) => <div />;

export const NumberComponent = (_props: ExampleProps) => 42;

export const StringComponent = (_props: ExampleProps) => "hello world";

export const NullComponent = (_props: ExampleProps) => null;

export const FragmentComponent = (_props: ExampleProps) => <></>;

export const Aliased = Unexported;
