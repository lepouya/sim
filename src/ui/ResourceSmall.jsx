import React from "react";

export default class ResourceSmall extends React.Component {
  constructor(props) {
    super(props);

    this.updateGroup = this.updateGroup.bind(this);
  }

  updateGroup(e) {
    e.preventDefault();
    this.props.onClick();
  }

  renderNumber(value, digits, plus) {
    const num = value.toFixed(digits);
  
    if ((value < 0.1) && (value > -0.1)) {
      return <span className='zero'>{num}</span>;
    } else if (value > 0) {
      return <span className='positive'>{(plus ? "+" : "") + num}</span>;
    } else {
      return <span className='negative'>{num}</span>;
    }
  }

  renderCount() {
    let count = this.renderNumber(this.props.resource.count);
    let rate = null, per = null;
    
    if (this.props.resource.rate != 0) {
      rate = this.renderNumber(this.props.resource.rate, 1, true);
      per = <span className='spacer'>/s</span>;
    }
    
    return <div className='count'>{rate}{per}{count}</div>;
  }

  render() {
    return <div
             id={"resource_small_" + this.props.name.toLowerCase().replace(" ", "_")}
             className={"resource small" + (this.props.selected ? " active" : "")}>
      <div className='name'>{this.props.name}</div>
      {this.props.resource && this.renderCount()}
      <a onClick={this.updateGroup}><span></span></a>
    </div>;
  }
}