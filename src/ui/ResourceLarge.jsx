import React from "react";

export default class ResourceLarge extends React.Component {
  constructor(props) {
    super(props);
    
    this.buy = this.buy.bind(this);
    this.sell = this.sell.bind(this);
  }

  buy(n = 1) {
    while ((n-- > 0) && this.props.resource.buy());
    this.props.onUpdate();
  }

  sell(n = 1) {
    while ((n-- > 0) && this.props.resource.sell());
    this.props.onUpdate();
  }

  renderNumber(value, digits = 0, plus = false, origin = 0, reverse = false) {
    const num = value.toFixed(digits);
    const diff = (value - origin) * (reverse ? -1 : 1);
  
    if ((value < 0.1) && (value > -0.1)) {
      return <span className='zero'>{num}</span>;
    } else if (diff >= 0) {
      return <span className='positive'>{(plus ? "+" : "") + num}</span>;
    } else {
      return <span className='negative'>{num}</span>;
    }
  }

  renderRates(rates, digits = 0, plus = false, origin = false, reverse = false) {
    const res = [];
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      const prefix = (i > 0) ? ", " : "";
      const value = this.renderNumber(rate.value, digits, plus, origin ? rate.entity.count : 0, reverse);
      res.push(<span key={i}>{prefix}{value} {rate.entity.name}</span>);
    }
    return res;
  }

  renderLocked() {
    if (this.props.resource.unlocked) {
      return null;
    }
    if (this.props.resource.requirements) {
      return <div className='locked'>Currently unavaiable; it will be unlocked when all requirements are met</div>;
    } else {
      return <div className='locked'>Currently unavaiable</div>;
    }
  }

  renderCount() {
    let count = this.renderNumber(this.props.resource.count);
    let limit = null;
    let rate = null;
    
    if (this.props.resource.limit) {
      limit = <span>out of {this.renderNumber(this.props.resource.limit)}</span>;
    }
    if (this.props.resource.rate != 0) {
      rate = <span>({this.renderNumber(this.props.resource.rate, 1, true)} / s)</span>;
    }
    
    return <div className='count'>You currently own {count} {limit} {rate}</div>;
  }

  renderGenerator() {
    let generates = null;
    let consumes = null;
    let and = null;
    let currentRate = null;
    
    if (this.props.resource.inputRate.length > 0) {
      consumes = <span>consumes {this.renderRates(this.props.resource.inputRate)}</span>;
    }
    if (this.props.resource.outputRate.length > 0) {
      generates = <span>generates {this.renderRates(this.props.resource.outputRate)}</span>;
    }
    
    if (!consumes && !generates) {
      return null;
    } else {
      if (consumes && generates) {
        and = <span> and </span>;
      }
      if (this.props.resource.genRate.length == 0) {
        currentRate = <span>Currently offline</span>;
      } else {
        currentRate = <span>Current rate is {this.renderRates(this.props.resource.genRate, 1, true)} / s</span>;
      }
      return <div className='rate'>Each {this.props.resource.name} {consumes}{and}{generates}; {currentRate}</div>;
    }
  }

  renderBuyBox() {
    if (!this.props.resource.price) {
      return null;
    }
    
    const price = this.props.resource.getBuyPrice();
    let text = null;
    let button1 = <button onClick={_ => this.buy()}>Get 1</button>;
    let buttonMax = null;

    if (!price) {
      text = <span>The next {this.props.resource.name} is not available right now</span>;
      button1 = <button disabled={true}>Buy 1</button>;
      if (this.props.resource.limit) {
        buttonMax = <button disabled={true}>Buy Max</button>;
      }
    } else if (price.length > 0) {
      let enabled = true;
      for (let rate of price) {
        enabled = enabled && (rate.entity.count >= rate.value);
      }

      text = <span>The next {this.props.resource.name} will cost {this.renderRates(price, 0, false, true, true)}</span>;
      button1 = <button onClick={_ => this.buy(1)} disabled={!enabled}>Buy 1</button>;
      if (this.props.resource.limit) {
        buttonMax = <button onClick={_ => this.buy(this.props.resource.limit - this.props.resource.count)} disabled={!enabled}>Buy Max</button>;
      }
    }
    
    return <div className='buy'>{button1}{buttonMax} {text}</div>;
  }

  renderSellBox() {
    if (!this.props.resource.price || !this.props.resource.sellModifier) {
      return null;
    }
    
    const price = this.props.resource.getSellPrice();
    let text = null;
    let button1 = <button onClick={_ => this.sell()}>Destroy 1</button>;
    let buttonAll = null;
    
    if (!price || (this.props.resource.count == 0)) {
      text = <span>Cannot sell any {this.props.resource.name} right now</span>;
      button1 = <button disabled={true}>Sell 1</button>;
      buttonAll = <button disabled={true}>Sell All</button>;
    } else if (price.length > 0) {
      text = <span>Current {this.props.resource.name} sells for {this.renderRates(price)}</span>;
      button1 = <button onClick={_ => this.sell(1)}>Sell 1</button>;
      buttonAll = <button onClick={_ => this.sell(this.props.resource.count)}>Sell All</button>;
    }
    
    return <div className='sell'>{button1}{buttonAll} {text}</div>;
  }

  render() {
    if (!this.props.resource || !this.props.resource.visible) {
      return null;
    }
    const name = this.props.resource.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    return <div id={"resource_large_" + name} className='resource large'>
      <div className='name'>{this.props.resource.name}</div>
      {(this.props.resource.description != '') && <div className='description'>{this.props.resource.description}</div>}
      {!this.props.resource.unlocked && this.renderLocked()}
      {this.props.resource.unlocked && this.renderCount()}
      {this.props.resource.unlocked && this.renderBuyBox()}
      {this.props.resource.unlocked && this.renderSellBox()}
      {this.props.resource.unlocked && this.renderGenerator()}
    </div>;
  }
}