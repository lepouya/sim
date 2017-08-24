import '../styles/debugInfo';
import React from 'react';

export default class DebugInfo extends React.Component {
  reset() {
    this.props.resourceManager.resetLocalStorage();
    window.location.reload(false);
  }

  render() {
    return <div id='debugInfo'>
      <hr />
      <a onClick={_ => this.reset()} href='#'>Reset Game</a><br/>
      Debug info:<br/>
      Last update: {new Date(this.props.resourceManager.timeStamp * 1000).toLocaleTimeString()}<br/>
      Current state:<br/>
      {JSON.stringify(this.props.resourceManager.save(), null, 2)}
    </div>;
  }
}