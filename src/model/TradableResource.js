import UsableResource from "./UsableResource";

export default class TradableResource extends UsableResource {
  constructor(name, desc, count, limit, unlocked, visible) {
    super(name, desc, count, limit, unlocked, visible);
    this.assign({
      price: [],
      purchaseGrowth: [],
      sellModifier: [],
    });
    this.price = undefined;
    this.sellModifier = undefined;
  }

  _getPrice(n, selling) {
    let res = [];
    for (let rate of this.price) {
      let p = rate.value;

      for (let mod of this.purchaseGrowth) {
        p = mod.withTier(n).getValue(p);
      }

      if (selling) {
        p = this.sellModifier.reduce((accum, mod) => mod.getValue(accum), p);
      }

      if (p > 0) {
        res.push({entity: rate.entity, value: p, doNotSpend: rate.doNotSpend});
      }
    }

    return res;
  }

  getBuyPrice() {
    if (!this.unlocked || !this.price || (this.limit && (this._count >= this.limit))) {
      return;
    }

    return this._getPrice(Math.floor(this._count), false);
  }

  getSellPrice() {
    if (!this.unlocked || !this.price || !this.sellModifier || (this._count < 1)) {
      return;
    }

    return this._getPrice(Math.floor(this._count) - 1, true);
  }

  buy() {
    // Check if it's buyable
    let price = this.getBuyPrice();
    if (!price) {
      return false;
    }

    // Check if we have the right resources
    for (let cost of price) {
      if (cost.entity._count < cost.value) {
        return false;
      }
    }

    // Subtract the cost
    for (let cost of price) {
      if (!cost.doNotSpend) {
        cost.entity.count -= cost.value;
      }
    }

    this.count++;
    return true;
  }

  sell() {
    // Check if it's sellable
    let price = this.getSellPrice();
    if (!price) {
      return false;
    }

    // Reimburse the resources
    for (let cost of price) {
      if (!cost.doNotSpend) {
        cost.entity.count += cost.value;
      }
    }

    this.count--;
    return true;
  }
}