import '../styles/debugInfo';
import React from 'react';

export default class DebugInfo extends React.Component {
  constructor(props) {
    super(props);
    
    const savedGame = this.props.resourceManager.save();
    savedGame.timeStamp = undefined;
    savedGame.updateGranularity = undefined;
    savedGame.maxUpdateCycles = undefined;
    
    this.load = this.load.bind(this);
    this.state = {
      savedGame: JSON.stringify(savedGame, null, 2),
      reset: false,
    }
  }
  
  load(e) {
    e.preventDefault();
    if (this.state.reset) {
      this.props.resourceManager.growths = {};
      this.props.resourceManager.resources = {};
      this.props.resourceManager.groups = {};
      this.setState({reset: false});
    }
    this.props.resourceManager.load(JSON.parse(this.state.savedGame));
    document.title = this.props.resourceManager.name;
  }

  render() {
    return <div id='debugInfo'>
        <hr />
        <div>
          Debug info:<br/>
          Last update: {new Date(this.props.resourceManager.timeStamp * 1000).toLocaleTimeString()}<br/>
          Current state:<br/>
          {JSON.stringify(this.props.resourceManager.save(), null, 2)}
        </div>
        <form onSubmit={this.load}>
          Load from JSON:<br/>
          <textarea value={this.state.savedGame} onChange={e => this.setState({savedGame: e.target.value})} />
          <br/>
          <input type='submit' value='Load Progressive' onClick={e => this.setState({reset: false})} />
          <input type='submit' value='Reset & Load New' onClick={e => this.setState({reset: true})} />
        </form>
      </div>;
  }
}