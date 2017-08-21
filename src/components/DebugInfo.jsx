import '../styles/debugInfo';
import React from 'react';

export default class DebugInfo extends React.Component {
  render() {
    return <div id='debugInfo'>
      <hr />
      Debug info:<br/>
      Last update: {new Date(this.props.resourceManager.timeStamp * 1000).toLocaleTimeString()}<br/>
      Current state:<br/>
      {JSON.stringify(this.props.resourceManager.save(), null, 2)}
    </div>;
  }
}