import React from "react";
import ResourceBundle from "./ResourceBundle";
import ResourceSmall from "./ResourceSmall";
import DebugInfo from "./DebugInfo";

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    
    document.title = this.props.resourceManager.name;
    
    this.state = {
      lastUpdate: new Date(),
      tab: 0,
      debug: (window.location.href.indexOf("debug") > 0),
    };
  }

  componentDidMount() {
    const timerId = setInterval(
      () => this.tick(),
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

  setTab(tab) {
    this.setState({tab});
  }

  render() {
    const group = this.props.resourceManager.tabs[this.state.tab];
    
    return <div id='game'>
      <div id='title'>{this.props.resourceManager.name}</div>
      <div id='groups'>
        {this.props.resourceManager.tabs.map((tab, i) =>
          <ResourceSmall
            key={"tab_" + i}
            name={tab.title}
            resource={tab.primary}
            selected={i == this.state.tab}
            onClick={() => this.setTab(i)} />
        )}
      </div>
      <div id='main'>
        {group && group.items.map((bundle, i) =>
          <ResourceBundle
            key={"bundle_" + i}
            bundle={bundle}
            onUpdate={() => this.tick()} />
        )}
      </div>
      {this.state.debug &&
        <DebugInfo
          lastUpdate={this.state.lastUpdate}
          resourceManager={this.props.resourceManager} />
      }
    </div>;
  }
}