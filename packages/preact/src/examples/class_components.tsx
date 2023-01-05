import { Component, ComponentType } from "preact";
import { ExampleProps } from "../example_props";

export class Explicit extends Component<ExampleProps> {
  render() {
    return <div />;
  }
}

export class Untyped extends Component<unknown> {
  render() {
    return <div />;
  }
}

export const Implicit = (() =>
  class InnerImplicit extends Component<ExampleProps> {
    render() {
      return <div />;
    }
  })();

export const Assigned = class extends Component<ExampleProps> {
  render() {
    return <div />;
  }
};

class InnerPassed extends Component<ExampleProps> {
  render() {
    return <div />;
  }
}

export const OuterExported = InnerPassed;

export default class DefExport extends Component<ExampleProps> {
  render() {
    return <div />;
  }
}

const factory = (Wrapped: ComponentType<any>) => (props: ExampleProps) =>
  <Wrapped {...props} />;

export const Constructed = factory(OuterExported);
