import Entity from "./Entity";
import Rate from "./Rate";

const growthValues = {
  constant: (coef, tier, n) => coef * tier,
  linear: (coef, tier, n) => n + coef * tier,
  percentage: (coef, tier, n) => n * (1 + (coef / 100) * tier),
  multiplicative: (coef, tier, n) => n * Math.pow(coef, tier),
  exponential: (coef, tier, n) => Math.pow(coef, n * tier),
};

export default class Growth extends Entity {
  constructor(name, growthFunction = "linear", coefficient = 0, tier = 1) {
    super({
      name,
      growthFunction,
      coefficient,
      tier,
    });
  }

  getValue(n) {
    return growthValues[this.growthFunction](this.coefficient, this.tier, n);
  }

  withRate(baseRate, bonuses) {
    return new Rate(this, baseRate, bonuses);
  }
}
