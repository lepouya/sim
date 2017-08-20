import '../styles/save';
import React from 'react';

export default class Screen extends React.Component {
  constructor(props) {
    super(props);

    const resourceManager = this.props.game.props.resourceManager;
    this.setTimer = this.setTimer.bind(this);
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);

    this.state = {
      resourceManager,
      savedGame: resourceManager.saveToString(),
      saveTime: new Date(resourceManager.timeStamp * 1000),
      updateGranularity: resourceManager.updateGranularity * 1000,
    }
  }

  setTimer(e) {
    e.preventDefault();
    this.state.resourceManager.updateGranularity = this.state.updateGranularity / 1000;
    this.props.game.componentWillUnmount();
    this.props.game.componentDidMount();
    this.props.game.save();
  }

  load(e) {
    e.preventDefault();
    this.state.resourceManager.loadFromString(this.state.savedGame);
    this.props.game.save();
    window.location.reload(false);
  }

  save(e) {
    e.preventDefault();
    this.props.game.save();
  }

  reset(e) {
    e.preventDefault();
    this.state.resourceManager.resetLocalStorage();
    window.location.reload(false);
  }

  render() {
    const game = this.props.game;

    return <div id='saveScreen'>
      <div className='bundle'>
        <div className='name'>Update Interval</div>
        <form onSubmit={this.setTimer}>
          <p>
            The update interval for the game is current every {game.props.resourceManager.updateGranularity * 1000} ms.
          </p>
          <p>
            If your game is lagging, try to set this interval to a higher value.
            Lower values are more accurate by also more CPU-intensive.
          </p>
          <p>
            <input type='range' min='50' max='1000' step='50'
              value={this.state.updateGranularity}
              onChange={e => this.setState({updateGranularity: e.target.value})} />
            {this.state.updateGranularity} ms
          </p>
          <input type='submit' value='Update' />
        </form>
      </div>

      <div className='bundle'>
        <div className='name'>Local Save</div>
        <form onSubmit={this.save}>
          <p>
            Last local save was at {new Date(game.state.lastSave).toLocaleTimeString()}
          </p>
          <input type='submit' value='Save now' />
        </form>
      </div>

      <div className='bundle'>
        <div className='name'>External Save</div>
        <form onSubmit={this.load}>
          <p>
            This is the game state as of {this.state.saveTime.toLocaleTimeString()}.
            Store this in a safe place as a backup if you want to return to the state that the game was at this point.
          </p>
          <textarea
            value={this.state.savedGame}
            onChange={e => this.setState({savedGame: e.target.value})} />
          <input type='submit' value='Load this state' />
        </form>
      </div>

      <div className='bundle'>
        <div className='name'>Game Reset</div>
        <form onSubmit={this.reset} className='warning'>
          <p>
            Warning: This will reset your entire game data to a clean state.
            This cannot be undone. Make sure you save the game state above if you want to restore the current game.
          </p>
          <input type='submit' value='Reset & Reload' />
        </form>
      </div>
    </div>;
  }
}