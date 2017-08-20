import '../styles/bundle';
import React from 'react';
import Resource from './Resource';

export default class Bundle extends React.Component {
  render() {
    const bundle = this.props.bundle;
    if (!bundle || !bundle.visible) {
      return null;
    }

    return <div className='bundle'>
      {bundle.primary &&
        <Resource
          resource={bundle.primary}
          onUpdate={this.props.onUpdate} />
      }
      {bundle.items.map(resource =>
        <Resource
          key={'resource_ ' + resource.name}
          resource={resource}
          onUpdate={this.props.onUpdate} />
      )}
    </div>;
  }
}