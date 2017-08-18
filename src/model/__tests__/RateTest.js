import Growth from "../Growth";
import Rate from "../Rate";

describe("Rate", () => {
  var bonusL, bonusP;

  beforeEach(() => {
    bonusL = new Growth("L", "linear", -2, 1);
    bonusP = new Growth("P", "percentage", -10, 1);
  });

  it("Basic rate constructor", () => {
    const cost = new Rate("E", 5);
    expect(cost.entity).toBe("E");
    expect(cost.baseRate).toBe(5);
    expect(cost.bonuses).toEqual([]);
    expect(cost.doNotSpend).toBe(false);
    expect(cost.value).toBe(5);
  });

  it("Bonuses apply to the rate", () => {
    const costL = new Rate(1, 5, [bonusL]);
    const costP = new Rate("A", 2, [bonusP]);
    const costLP = new Rate(true, 3, [bonusL, bonusP]);
    const costPL = new Rate(["test", 1], 10, [bonusP, bonusL]);

    expect(costL.value).toBeCloseTo(3);
    expect(costP.value).toBeCloseTo(1.8);
    expect(costLP.value).toBeCloseTo(0.9);
    expect(costPL.value).toBeCloseTo(7);
  });

  it("Bonuses tier changes are reflected", () => {
    const rate = new Rate("Test", 10).withBonus(bonusP).withBonus(bonusL);
    expect(rate.value).toBeCloseTo(7);

    bonusP.tier++;
    expect(rate.value).toBeCloseTo(6);
  });

  it("Loading and saving works correctly", () => {
    const rate = new Rate("Test", 10);
    expect(rate.value).toBeCloseTo(10);
    let save = JSON.stringify(rate);
    let rate2 = new Rate().assign(JSON.parse(save));
    expect(rate2.value).toBeCloseTo(10);
  });
});
