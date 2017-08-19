import React from "react";
import DebugInfo from "./DebugInfo";
import Screen from "./Screen";
import SaveScreen from "./SaveScreen";
import Tab from "./Tab";

export default class Game extends React.Component {
  constructor(props) {
    super(props);

    document.title = this.props.resourceManager.name;
    this.tick = this.tick.bind(this);
    this.state = {
      lastUpdate: new Date(),
      tab: 0,
      debug: (window.location.href.indexOf("debug") > 0),
    };
  }

  componentDidMount() {
    const timerId = setInterval(
      this.tick,
      this.props.resourceManager.updateGranularity * 1000
    );
    this.setState({timerId});
  }

  componentWillUnmount() {
    clearInterval(this.state.timerId);
  }

  tick() {
    this.props.resourceManager.update();
    this.setState({lastUpdate: new Date()});
  }

  render() {
    const tab = this.props.resourceManager.tabs[this.state.tab];
    
    return <div id='game'>
      <div id='title'>{this.props.resourceManager.name}</div>

      <div id='tabBar'>
        <Tab
          tab={{title: 'Save', visible: true, right: true}}
          selected={this.state.tab == 'save'}
          onClick={() => this.setState({tab: 'save'})} />

        {this.props.resourceManager.tabs.map((tab, i) =>
          <Tab
            key={"tab_" + i}
            tab={tab}
            selected={i == this.state.tab}
            onClick={() => this.setState({tab: i})} />
        )}
      </div>
 
      {(this.state.tab == 'save') &&
        <SaveScreen resourceManager={this.props.resourceManager} />
      }

      <Screen
        tab={tab}
        onUpdate={this.tick} />

      {this.state.debug &&
        <DebugInfo
          lastUpdate={this.state.lastUpdate}
          resourceManager={this.props.resourceManager} />
      }
    </div>;
  }
}