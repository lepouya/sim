import '../styles/resource';
import React from 'react';

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
      return <span className='positive'>{(plus ? '+' : '') + num}</span>;
    } else {
      return <span className='negative'>{num}</span>;
    }
  }

  renderRates(rates, digits = 0, plus = false, origin = false, reverse = false) {
    const res = [];
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      const prefix = (i > 0) ? ', ' : '';
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
    const buyText = (resource.display && resource.display.buy) || 'Buy @';
    const buyMax = (resource.display && resource.display.buyMax) || buyText;
    const enabled = (price || []).reduce(((enabled, rate) => enabled && rate.entity.count >= rate.value), price !== undefined);
    const maxEnabled = (buyText != buyMax) || buyMax.includes('@');

    const text = price && (price.length > 0) &&
          <span>for {this.renderRates(price, 0, false, true, true)}</span>;
    const buttonOne =
          <button onClick={_ => this.buy(1)} disabled={!enabled}>
            {buyText.replace('@', 1)} {text}
          </button>;
    const buttonMax = resource.limit && maxEnabled &&
          <button onClick={_ => this.buy(resource.limit - resource.count)} disabled={!enabled}>
            {buyMax.replace('@', 'max')}
          </button>;

    return <div className='buy'>{buttonOne} {buttonMax}</div>;
  }

  renderSellBox(resource) {
    if (!resource.price || !resource.sellModifier) {
      return null;
    }
    
    const price = resource.getSellPrice();
    const sellText = (resource.display && resource.display.sell) || 'Sell @';
    const sellMax = (resource.display && resource.display.sellMax) || sellText;
    const enabled = price && (resource.count > 0);
    const maxEnabled = (sellText != sellMax) || sellMax.includes('@');

    const text = enabled && (price.length > 0) &&
          <span>for {this.renderRates(price)}</span>;
    const buttonOne = <button onClick={_ => this.sell(1)} disabled={!enabled}>
            {sellText.replace('@', 1)} {text}
          </button>;
    const buttonMax = (!enabled || price.length > 0) && maxEnabled &&
          <button onClick={_ => this.sell(resource.count)} disabled={!enabled}>
            {sellMax.replace('@', 'all')}
          </button>;

    return <div className='sell'>{buttonOne} {buttonMax}</div>;
  }

  render() {
    const resource = this.props.resource;
    if (!resource || !resource.visible) {
      return null;
    }

    const name = resource.name.charAt(0).toUpperCase() + resource.name.slice(1);
    return <div id={'resource_' + name.toLowerCase().replace(/[^a-z0-9_]/g, '_')} className='resource'>
      <div className='name'>{name}</div>
      {(resource.description !== '') &&
        <div className='description' dangerouslySetInnerHTML={{__html: resource.description}} />}
      {!resource.unlocked && this.renderLocked(resource)}
      {resource.unlocked && this.renderCount(resource)}
      {resource.unlocked && this.renderBuyBox(resource)}
      {resource.unlocked && this.renderSellBox(resource)}
      {resource.unlocked && this.renderGenerator(resource)}
    </div>;
  }
}