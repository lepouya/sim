import React from "react";

export default class Resource extends React.Component {
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

  renderLocked(resource) {
    if (resource.unlocked) {
      return null;
    }
    if (resource.requirements) {
      return <div className='locked'>Currently unavaiable; it will be unlocked when all requirements are met</div>;
    } else {
      return <div className='locked'>Currently unavaiable</div>;
    }
  }

  renderCount(resource) {
    let count = this.renderNumber(resource.count);
    let limit = null;
    let rate = null;
    
    if (resource.limit) {
      limit = <span>out of {this.renderNumber(resource.limit)}</span>;
    }
    if (resource.rate != 0) {
      rate = <span>({this.renderNumber(resource.rate, 1, true)} / s)</span>;
    }
    
    return <div className='count'>You currently own {count} {limit} {rate}</div>;
  }

  renderGenerator(resource) {
    let generates = null;
    let consumes = null;
    let and = null;
    let currentRate = null;
    
    if (resource.inputRate.length > 0) {
      consumes = <span>consumes {this.renderRates(resource.inputRate)}</span>;
    }
    if (resource.outputRate.length > 0) {
      generates = <span>generates {this.renderRates(resource.outputRate)}</span>;
    }
    
    if (!consumes && !generates) {
      return null;
    } else {
      if (consumes && generates) {
        and = <span> and </span>;
      }
      if (resource.genRate.length == 0) {
        currentRate = <span>Currently offline</span>;
      } else {
        currentRate = <span>Current rate is {this.renderRates(resource.genRate, 1, true)} / s</span>;
      }
      return <div className='rate'>Each {resource.name} {consumes}{and}{generates}; {currentRate}</div>;
    }
  }

  renderBuyBox(resource) {
    if (!resource.price) {
      return null;
    }
    
    const price = resource.getBuyPrice();
    let text = null;
    let button1 = <button onClick={_ => this.buy()}>Get 1</button>;
    let buttonMax = null;

    if (!price) {
      text = <span>The next {resource.name} is not available right now</span>;
      button1 = <button disabled={true}>Buy 1</button>;
      if (resource.limit) {
        buttonMax = <button disabled={true}>Buy Max</button>;
      }
    } else if (price.length > 0) {
      let enabled = true;
      for (let rate of price) {
        enabled = enabled && (rate.entity.count >= rate.value);
      }

      text = <span>The next {resource.name} will cost {this.renderRates(price, 0, false, true, true)}</span>;
      button1 = <button onClick={_ => this.buy(1)} disabled={!enabled}>Buy 1</button>;
      if (resource.limit) {
        buttonMax = <button onClick={_ => this.buy(resource.limit - resource.count)} disabled={!enabled}>Buy Max</button>;
      }
    }
    
    return <div className='buy'>{button1}{buttonMax} {text}</div>;
  }

  renderSellBox(resource) {
    if (!resource.price || !resource.sellModifier) {
      return null;
    }
    
    const price = resource.getSellPrice();
    let text = null;
    let button1 = <button onClick={_ => this.sell()}>Destroy 1</button>;
    let buttonAll = null;
    
    if (!price || (resource.count == 0)) {
      text = <span>Cannot sell any {resource.name} right now</span>;
      button1 = <button disabled={true}>Sell 1</button>;
      buttonAll = <button disabled={true}>Sell All</button>;
    } else if (price.length > 0) {
      text = <span>Current {resource.name} sells for {this.renderRates(price)}</span>;
      button1 = <button onClick={_ => this.sell(1)}>Sell 1</button>;
      buttonAll = <button onClick={_ => this.sell(resource.count)}>Sell All</button>;
    }
    
    return <div className='sell'>{button1}{buttonAll} {text}</div>;
  }

  render() {
    const resource = this.props.resource;
    if (!resource || !resource.visible) {
      return null;
    }
    
    const name = resource.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    return <div id={"resource_" + name} className='resource'>
      <div className='name'>{resource.name}</div>
      {(resource.description != '') && <div className='description'>{resource.description}</div>}
      {!resource.unlocked && this.renderLocked(resource)}
      {resource.unlocked && this.renderCount(resource)}
      {resource.unlocked && this.renderBuyBox(resource)}
      {resource.unlocked && this.renderSellBox(resource)}
      {resource.unlocked && this.renderGenerator(resource)}
    </div>;
  }
}