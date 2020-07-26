import LockableResource from "./LockableResource";

export default class UsableResource extends LockableResource {
  constructor(name, desc, count, limit, unlocked, visible) {
    super(name, desc, count, limit, unlocked, visible);
    this.assign({
      setsCountFor: [],
      setsLimitFor: [],
      setsTierFor: [],
    });
  }

  update(ticks, now) {
    if (!super.update(ticks, now)) {
      return false;
    }

    // Set all the derivatives for count/limit/tier
    for (let rate of this.setsCountFor) {
      rate.entity.withCount(
        Math.floor(rate.withBaseRate(Math.floor(this._count)).value),
      );
    }

    for (let rate of this.setsLimitFor) {
      rate.entity
        .withLimit(Math.floor(rate.withBaseRate(Math.floor(this._count)).value))
        .withCount(rate.entity._count);
    }

    for (let rate of this.setsTierFor) {
      rate.entity.withTier(
        Math.floor(rate.withBaseRate(Math.floor(this._count)).value),
      );
    }

    return true;
  }
}
