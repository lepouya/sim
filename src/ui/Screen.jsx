import React from "react";
import Bundle from "./Bundle";
import Group from "./Group";

export default class Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { group: 0 };
  }

  render() {
    const tab = this.props.tab;
    if (!tab || !tab.visible) {
      return null;
    }

    const group = tab.items[this.state.group];

    return <div id='screen'>
      {tab.description &&
        <div className='description' dangerouslySetInnerHTML={{__html: tab.description}} />}

      <div id='groups'>
        {tab.items.map((group, i) =>
          <Group
            key={"group_" + i}
            group={group}
            selected={i == this.state.group}
            onClick={() => this.setState({group: i})} />
        )}
      </div>
      
      <div id='main'>
        {group && group.description &&
          <div className='description' dangerouslySetInnerHTML={{__html: group.description}} />}
        {group && group.items.map((bundle, i) =>
          <Bundle
            key={"bundle_" + i}
            bundle={bundle}
            onUpdate={this.props.onUpdate} />
        )}
      </div>
    </div>;
  }
}