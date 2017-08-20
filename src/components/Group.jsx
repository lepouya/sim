import '../styles/group';
import React from 'react';

export default class Group extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
    this.props.onClick();
  }

  renderNumber(value, digits, plus) {
    const num = value.toFixed(digits);

    if ((value < 0.1) && (value > -0.1)) {
      return <span className='zero'>{num}</span>;
    } else if (value > 0) {
      return <span className='positive'>{(plus ? '+' : '') + num}</span>;
    } else {
      return <span className='negative'>{num}</span>;
    }
  }

  renderCount() {
    const resource = this.props.group.primary;
    let count = this.renderNumber(resource.count);
    let rate = null, per = null;

    if (resource.rate != 0) {
      rate = this.renderNumber(resource.rate, 1, true);
      per = <span className='spacer'>/s</span>;
    }
    
    return <div className='count'>{rate}{per}{count}</div>;
  }

  render() {
    const group = this.props.group;
    if (!group || !group.visible) {
      return null;
    }

    return <div
            id={'group_' + group.title.toLowerCase().replace(' ', '_')}
            className={'clickable group' + (this.props.selected ? ' active' : '')}>
      <div className='name'>{group.title}</div>
      {group.primary && this.renderCount()}
      <a onClick={this.onClick}><span></span></a>
    </div>;
  }
}