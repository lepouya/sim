import Entity from "./Entity";
import Rate from "./Rate";

export default class BasicResource extends Entity {
  constructor(name, description, count = 0, limit = undefined) {
    super({
      name,
      description,
      limit,
      _count: count,
      _rate: 0,
      _lastUpdate: 0,
      _lastRateCount: 0,
    });
  }

  get count() {
    return this._count;
  }

  set count(count) {
    this._count = count;
    if (this.limit && count > this.limit) {
      this._count = this.limit;
    }
  }

  withCount(count) {
    this.count = count;
    return this;
  }

  get rate() {
    return this._rate;
  }

  withRate(baseRate, bonuses, doNotSpend) {
    return new Rate(this, baseRate, bonuses, doNotSpend);
  }

  update(ticks, now) {
    if (ticks < 0 || now < this._lastUpdate) {
      return false;
    }

    // Limit the count
    if (this.limit && this._count > this.limit) {
      this._count = this.limit;
    }

    // Update the rate
    if (now >= this._lastUpdate + 1) {
      if (this._lastUpdate > 0) {
        this._rate =
          (this._count - this._lastRateCount) / (now - this._lastUpdate);
      }
      this._lastUpdate = now;
      this._lastRateCount = this._count;
    }

    return true;
  }
}
