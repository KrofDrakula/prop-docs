import { Component } from "preact";
import { ExampleProps } from "../example_props";

export class Explicit extends Component<ExampleProps> {
  render() {
    const { name, count, attributes } = this.props;
    return (
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
  }
}
