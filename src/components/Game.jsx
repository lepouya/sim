import '../styles/game';
import React from 'react';
import Screen from './Screen';
import SaveScreen from './SaveScreen';
import Tab from './Tab';
import DebugInfo from './DebugInfo';

export default class Game extends React.Component {
  constructor(props) {
    super(props);

    let upgraded = false;
    const resourceManager = this.props.resourceManager;
    const version = resourceManager.version;
    resourceManager.loadFromLocalStorage();
    if (resourceManager.version !== version) {
      resourceManager.version = version;
      upgraded = true;
    }
    if (!resourceManager.version) {
      resourceManager.version = '0';
      upgraded = true;
    }

    document.title = resourceManager.name;
    this.tick = this.tick.bind(this);
    this.save = this.save.bind(this);

    this.state = {
      upgraded,
      lastUpdate: Date.now(),
      lastSave: Date.now(),
      tab: 0,
      debug: (window.location.href.indexOf('debug') > 0),
    };
  }

  componentDidMount() {
    const timerId = setInterval(
      this.tick,
      this.props.resourceManager.updateGranularity * 1000 * 2
    );
    this.setState({timerId});
  }

  componentWillUnmount() {
    clearInterval(this.state.timerId);
    this.setState({timerId: undefined});
  }

  tick() {
    const now = Date.now();
    this.props.resourceManager.update();
    this.setState({lastUpdate: now});

    if ((now - this.state.lastSave) / 1000 >= 10) {
      this.save();
    }
  }
  
  save() {
    this.props.resourceManager.saveToLocalStorage();
    this.setState({lastSave: Date.now()});
  }

  render() {
    const tab = this.props.resourceManager.tabs[this.state.tab];

    return <div id='game'>
      <div id='title'>{this.props.resourceManager.name}</div>
      <div id='version' className={this.state.upgraded ? 'upgraded' : ''}>v{this.props.resourceManager.version}</div>

      <div id='tabBar'>
        <Tab
          tab={{title: 'Save', visible: true, right: true}}
          selected={this.state.tab == 'save'}
          onClick={() => this.setState({tab: 'save'})} />

        {this.props.resourceManager.tabs.map((tab, i) =>
          <Tab
            key={'tab_' + i}
            tab={tab}
            selected={i == this.state.tab}
            onClick={() => this.setState({tab: i})} />
        )}
      </div>

      {(this.state.tab == 'save') &&
        <SaveScreen game={this} />
      }
 
      {tab && tab.description &&
        <div className='bundle' dangerouslySetInnerHTML={{__html: tab.description}} />}

      <Screen
        tab={tab}
        onUpdate={this.tick} />

      {this.state.debug &&
        <DebugInfo resourceManager={this.props.resourceManager} />
      }
    </div>;
  }
}