import Growth from "../Growth";

describe("Growth", () => {
  it("Basic constructor makes entity correctly", () => {
    const bonus = new Growth();

    expect(bonus.growthFunction).toBe("linear");
    expect(bonus.coefficient).toBe(0);
    expect(bonus.tier).toBe(1);
    expect(bonus.getValue(0)).toBe(0);
    expect(bonus.getValue(3.14)).toBeCloseTo(3.14);
  });

  it("Full constructor sets all", () => {
    const bonus = new Growth("g", "linear", 2, 3);

    expect(bonus.name).toBe("g");
    expect(bonus.growthFunction).toBe("linear");
    expect(bonus.coefficient).toBe(2);
    expect(bonus.tier).toBe(3);
  });

  it("linear growth applies correctly", () => {
    const bonus = new Growth(undefined, "linear", 1.5, 0);

    expect(bonus.getValue(5)).toBeCloseTo(5);
    expect(bonus.withTier(1).getValue(2)).toBeCloseTo(3.5);
    expect(bonus.withTier(3).getValue(10)).toBeCloseTo(14.5);
    expect(bonus.withCoefficient(5).getValue(0)).toBeCloseTo(15);
    expect(bonus.withTier(2).withCoefficient(-0.1).getValue(10)).toBeCloseTo(
      9.8,
    );
  });

  it("percentage growth applies correctly", () => {
    const bonus = new Growth()
      .withGrowthFunction("percentage")
      .withCoefficient(10)
      .withTier(0);

    expect(bonus.getValue(5)).toBeCloseTo(5);
    expect(bonus.withTier(1).getValue(2)).toBeCloseTo(2.2);
    expect(bonus.withTier(3).getValue(10)).toBeCloseTo(13);
    expect(bonus.withCoefficient(100).getValue(1)).toBeCloseTo(4);
    expect(bonus.withTier(2).withCoefficient(-25).getValue(1)).toBeCloseTo(0.5);
  });

  it("multiplicative growth applies correctly", () => {
    const bonus = new Growth(undefined, "multiplicative", 1.1, 0);

    expect(bonus.getValue(5)).toBeCloseTo(5);
    expect(bonus.withTier(1).getValue(2)).toBeCloseTo(2.2);
    expect(bonus.withTier(3).getValue(10)).toBeCloseTo(13.31);
    expect(bonus.withCoefficient(2).getValue(1)).toBeCloseTo(8);
    expect(bonus.withTier(2).withCoefficient(0.5).getValue(1)).toBeCloseTo(
      0.25,
    );
  });

  it("exponential growth applies correctly", () => {
    const bonus = new Growth(undefined, "exponential", 2, 0);

    expect(bonus.getValue(5)).toBeCloseTo(1);
    expect(bonus.withTier(1).getValue(2)).toBeCloseTo(4);
    expect(bonus.withTier(3).getValue(10)).toBeCloseTo(Math.pow(2, 30));
    expect(bonus.withCoefficient(1.1).getValue(1)).toBeCloseTo(1.331);
    expect(bonus.withTier(2).withCoefficient(0.5).getValue(1)).toBeCloseTo(
      0.25,
    );
  });

  it("Loading and saving works correctly", () => {
    const bonus = new Growth("mult", "multiplicative", 1.1, 3);
    expect(bonus.getValue(10)).toBeCloseTo(13.31);
    let save = JSON.stringify(bonus);
    let bonus2 = Object.assign(new Growth(), JSON.parse(save));
    expect(bonus2.getValue(10)).toBeCloseTo(13.31);
  });
});
