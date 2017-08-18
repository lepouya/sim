import TradableResource from "./TradableResource";

export default class GeneratorResource extends TradableResource {
  constructor(name, desc, count, limit, unlocked, visible) {
    super(name, desc, count, limit, unlocked, visible);
    this.assign({
      inputRate: [],
      outputRate: [],
      inputRateGrowth: [],
      outputRateGrowth: [],
      _genRate: [],
    });
  }

  _getValues(items, init) {
    return items ? items.reduce((accum, item) => item.getValue(accum), init) : init;
  }

  get genRate() {
    return this._genRate || [];
  }

  update(ticks, now) {
    if (!super.update(ticks, now)) {
      return false;
    }

    this._genRate = [];
    if ((this._count <= 0) || (ticks <= 0) ||
      ((this.inputRate.length === 0) && (this.outputRate.length === 0))) {
      return false;
    }

    // Find out the max ticks you can spend
    let spending = ticks * this._count;
    for (let rate of this.inputRate) {
      let p = this._getValues(this.inputRateGrowth, rate.value);
      if (p * spending > rate.entity._count) {
        spending = rate.entity._count / p;
        if (spending <= 0) {
          spending = 0;
          return false;
        }
      }
    }

    // Find out the max you should produce
    let producing = (this.outputRate.length > 0) ? 0 : spending;
    for (let rate of this.outputRate) {
      if (!rate.entity.limit) {
        producing = spending;
        break;
      } else {
        let p = this._getValues(this.outputRateGrowth, rate.value);
        let pLimit = (rate.entity.limit - rate.entity._count) / p;
        if (pLimit > producing) {
          producing = pLimit;
          if (producing >= spending) {
            producing = spending;
            break;
          }
        }
      }
    }

    if (producing <= 0) {
      return false;
    }
    const sigTicks = producing;

    // Consume the input resources
    for (let rate of this.inputRate) {
      let p = this._getValues(this.inputRateGrowth, rate.value);
      if (!rate.doNotSpend && (p !== 0)) {
        rate.entity.count -= p * sigTicks;
        this._genRate.push({
          entity: rate.entity,
          value: -p * sigTicks / ticks
        });
      }
    }

    // Produce the output resources
    for (let rate of this.outputRate) {
      let p = this._getValues(this.outputRateGrowth, rate.value);
      if (p !== 0) {
        rate.entity.count += p * sigTicks;
        this._genRate.push({
          entity: rate.entity,
          value: p * sigTicks / ticks
        });
      }
    }

    return true;
  }
}