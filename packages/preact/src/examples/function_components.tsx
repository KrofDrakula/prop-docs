import { FunctionalComponent, FunctionComponent } from "preact";
import { ExampleProps } from "../example_props";

export const Functional: FunctionalComponent<ExampleProps> = ({
  name,
  count,
  attributes,
}) => (
  <div>
    <div>name: {name}</div>
    <div>count: {count}</div>
    <div>
      attributes:
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(attributes).map(([key, value]) => (
            <tr>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const AlsoFunctional: FunctionComponent<ExampleProps> = ({
  name,
  count,
  attributes,
}) => (
  <div>
    <div>name: {name}</div>
    <div>count: {count}</div>
    <div>
      attributes:
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(attributes).map(([key, value]) => (
            <tr>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const Freeform = ({ name, count, attributes }: ExampleProps) => (
  <div>
    <div>name: {name}</div>
    <div>count: {count}</div>
    <div>
      attributes:
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(attributes).map(([key, value]) => (
            <tr>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const InlineProps = ({
  name,
  count,
  attributes,
}: {
  count: number;
  name: string;
  attributes: Record<string, string>;
}) => (
  <div>
    <div>name: {name}</div>
    <div>count: {count}</div>
    <div>
      attributes:
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(attributes).map(([key, value]) => (
            <tr>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// @ts-expect-error
export const Untyped = ({ name, count, attributes }) => (
  <div>
    <div>name: {name}</div>
    <div>count: {count}</div>
    <div>
      attributes:
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(attributes).map(([key, value]) => (
            <tr>
              <th>{key}</th>
              {/* @ts-expect-error */}
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
