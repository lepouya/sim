import Entity from "./Entity";

export default class Rate extends Entity {
  constructor(entity, baseRate = 0, bonuses = [], doNotSpend = false) {
    super({
      entity,
      baseRate,
      bonuses,
      doNotSpend
    });
  }

  get value() {
    return this.bonuses.reduce((accum, bonus) => bonus.getValue(accum), this.baseRate);
  }
}