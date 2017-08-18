import React from "react";
import ResourceLarge from "./ResourceLarge";

export default class ResourceBundle extends React.Component {
  render() {
    if (!this.props.bundle || !this.props.bundle.visible) {
      return null;
    }
    return <div className='resource bundle'>
      {this.props.bundle.primary &&
        <ResourceLarge
          resource={this.props.bundle.primary}
          onUpdate={this.props.onUpdate} />
      }
      {this.props.bundle.items.map(resource =>
        <ResourceLarge
          key={"resource_ " + resource.name}
          resource={resource}
          onUpdate={this.props.onUpdate} />
      )}
    </div>;
  }
}