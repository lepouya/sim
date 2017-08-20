import '../styles/tab';
import React from 'react';

export default class Tab extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
    this.props.onClick();
  }

  render() {
    const tab = this.props.tab;
    if (!tab || !tab.visible) {
      return null;
    }

    return <div
            id={'tab_' + tab.title.toLowerCase().replace(' ', '_')}
            className={'clickable tab' + (this.props.selected ? ' active' : '') + (tab.right ? ' right' : '')}>
      <div className='name'>{tab.title}</div>
      <a onClick={this.onClick}><span></span></a>
    </div>;
  }
}