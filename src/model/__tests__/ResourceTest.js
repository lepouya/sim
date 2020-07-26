import Resource from "../Resource";
import Rate from "../Rate";
import Growth from "../Growth";

describe("Resource Basics", () => {
  it("Basic constructor only sets name", () => {
    const res = new Resource("test");
    expect(res.name).toBe("test");
    expect(res.description).toBeUndefined();
    expect(res.unlocked).toBe(true);
    expect(res.count).toBe(0);
    expect(res.limit).toBeUndefined();
    expect(res.requirements).toBeUndefined();
  });

  it("Full constructor sets everything", () => {
    const res = new Resource("test", "Test Resource", 5, 10, false, true);
    expect(res.name).toBe("test");
    expect(res.description).toBe("Test Resource");
    expect(res.unlocked).toBe(false);
    expect(res.count).toBe(5);
    expect(res.limit).toBe(10);
  });

  it("Count works without a limit", () => {
    const res = new Resource("test");
    expect(res.count).toBe(0);

    res.count = 10;
    expect(res.count).toBe(10);
    res.count++;
    expect(res.count).toBe(11);
    res.count -= 7;
    expect(res.count).toBe(4);
  });

  it("Count is capped with a limit", () => {
    const res = new Resource("test", "", 13, 10);
    expect(res.count).toBe(10);

    expect(res.withCount(11).count).toBe(10);
    res.count = 9;
    expect(res.count).toBe(9);
    res.count++;
    expect(res.count).toBe(10);
    res.count++;
    expect(res.count).toBe(10);
  });

  it("Resource unlocks when requirements are met", () => {
    const A = new Resource("A", "", 2);
    const B = new Resource("B", "", 0);

    const res = new Resource("test").withUnlocked(false);
    res.addRequirement(A.withRate(5)).addRequirement(B.withRate(2));
    expect(res.unlocked).toBe(false);

    res.update();
    expect(res.unlocked).toBe(false);

    A.count = 7;
    res.update();
    expect(res.unlocked).toBe(false);

    A.count = 4;
    B.count = 5;
    res.update();
    expect(res.unlocked).toBe(false);

    A.count++;
    res.update();
    expect(res.unlocked).toBe(true);

    A.count = 3;
    B.count = 0;
    res.update();
    expect(res.unlocked).toBe(true);
  });
});

describe("Resource Trading", () => {
  var res, rA, rB, rC;
  var markUp, markDown;

  beforeEach(() => {
    rA = new Resource("A", "A", 100); // 100 of A
    rB = new Resource("B", "B", 20, 25); // 20 of B. Resource is capped at 25
    rC = new Resource("C", "C", 5); // 5 of C

    markUp = new Growth("double", "multiplicative", 2); // Double price markup per tier for exp pricing
    markDown = new Growth("-40%", "percentage", -40); // 40% price markdown for sell

    res = new Resource("test", "test", 0, 10, true); // With max 10. Already unlocked
  });

  it("Can't buy or sell untradable resources", () => {
    res.count = 10;
    expect(res.getBuyPrice()).toBeUndefined();
    expect(res.getSellPrice()).toBeUndefined();

    expect(res.count).toBe(10);
    expect(res.buy()).toBe(false);
    expect(res.count).toBe(10);
    expect(res.sell()).toBe(false);
    expect(res.count).toBe(10);
  });

  it("Buy a resource", () => {
    res
      .addPrice(rA.withRate(10))
      .addPrice(rB.withRate(10))
      .addPrice(rC.withRate(2));

    expect(res.buy()).toBe(true);
    expect(res.count).toBe(1);
    expect(rA.count).toBe(100 - 10);
    expect(rB.count).toBe(20 - 10);
    expect(rC.count).toBe(5 - 2);
  });

  it("Can't buy more than current resources", () => {
    res
      .withCount(9)
      .withLimit(undefined)
      .addPrice(rA.withRate(10))
      .addPrice(rB.withRate(10))
      .addPrice(rC.withRate(2));

    expect(res.buy()).toBe(true);
    expect(res.count).toBe(10);
    expect(res.buy()).toBe(true);
    expect(res.count).toBe(11);
    expect(rA.count).toBe(100 - 10 - 10);
    expect(rB.count).toBe(20 - 10 - 10);
    expect(rC.count).toBe(5 - 2 - 2);

    expect(res.buy()).toBe(false);
    expect(res.count).toBe(11);
    expect(rA.count).toBe(100 - 10 - 10);
    expect(rB.count).toBe(20 - 10 - 10);
    expect(rC.count).toBe(5 - 2 - 2);
  });

  it("Can't buy past the cap", () => {
    res
      .withCount(8)
      .addPrice(rA.withRate(5))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1));

    expect(res.buy()).toBe(true);
    expect(res.count).toBe(9);
    expect(res.buy()).toBe(true);
    expect(res.count).toBe(10);
    expect(res.buy()).toBe(false);
    expect(res.count).toBe(10);
    expect(rA.count).toBe(100 - 5 - 5);
    expect(rB.count).toBe(20 - 5 - 5);
    expect(rC.count).toBe(5 - 1 - 1);
  });

  it("Purchase price grows", () => {
    res
      .addPurchaseGrowth(markUp)
      .addPrice(rA.withRate(5))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1));

    expect(res.buy()).toBe(true);
    expect(res.count).toBe(1);
    expect(rA.count).toBe(100 - 5);
    expect(rB.count).toBe(20 - 5);
    expect(rC.count).toBe(5 - 1);

    expect(res.buy()).toBe(true);
    expect(res.count).toBe(2);
    expect(rA.count).toBe(100 - 5 - 10);
    expect(rB.count).toBe(20 - 5 - 10);
    expect(rC.count).toBe(5 - 1 - 2);

    expect(res.buy()).toBe(false);
    expect(res.count).toBe(2);
  });

  it("Sell a resource", () => {
    res
      .withCount(2)
      .addPrice(rA.withRate(5))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1))
      .addSellModifier(new Growth());

    expect(res.sell()).toBe(true);
    expect(res.count).toBe(1);
    expect(rA.count).toBe(100 + 5);
    expect(rB.count).toBe(20 + 5);
    expect(rC.count).toBe(5 + 1);
  });

  it("Can't oversell a resource", () => {
    res
      .withCount(1)
      .addPrice(rA.withRate(5))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1))
      .addSellModifier(new Growth());

    expect(res.sell()).toBe(true);
    expect(res.sell()).toBe(false);
    expect(res.count).toBe(0);
    expect(rA.count).toBe(100 + 5);
    expect(rB.count).toBe(20 + 5);
    expect(rC.count).toBe(5 + 1);
  });

  it("Selling doesn't give more resources than cap", () => {
    res
      .withCount(2)
      .addPrice(rA.withRate(5))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1))
      .addSellModifier(new Growth());

    expect(res.sell()).toBe(true);
    expect(res.sell()).toBe(true);
    expect(res.count).toBe(0);
    expect(rA.count).toBe(100 + 5 + 5);
    expect(rB.count).toBe(20 + 5);
    expect(rC.count).toBe(5 + 1 + 1);
  });

  it("Sale price mark down works", () => {
    res
      .withCount(2)
      .addPrice(rA.withRate(5))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1))
      .addSellModifier(markDown);

    expect(res.sell()).toBe(true);
    expect(res.count).toBe(1);
    expect(rA.count).toBeCloseTo(100 + 5 * 0.6);
    expect(rB.count).toBeCloseTo(20 + 5 * 0.6);
    expect(rC.count).toBeCloseTo(5 + 0.6);
  });

  it("sell after buy with scaling", () => {
    res
      .addPrice(rA.withRate(10))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1))
      .addPurchaseGrowth(markUp)
      .addSellModifier(markDown);

    expect(res.sell()).toBe(false);
    expect(res.buy()).toBe(true);
    expect(res.count).toBe(1);
    expect(res.buy()).toBe(true);
    expect(res.count).toBe(2);

    expect(rA.count).toBe(100 - 10 * 3);
    expect(rB.count).toBe(20 - 5 * 3);
    expect(rC.count).toBe(5 - 3);

    expect(res.sell()).toBe(true);
    expect(res.count).toBe(1);

    expect(rA.count).toBeCloseTo(100 - 10 * 3 + 10 * 2 * 0.6);
    expect(rB.count).toBeCloseTo(20 - 5 * 3 + 5 * 2 * 0.6);
    expect(rC.count).toBeCloseTo(5 - 3 + 2 * 0.6);
  });

  it("buy and sell respect the doNotSpend flag", () => {
    res
      .addPrice(rA.withRate(10))
      .addPrice(rB.withRate(5).withDoNotSpend(true))
      .addPrice(rC.withRate(3))
      .addPurchaseGrowth(markUp)
      .addSellModifier(markDown);

    expect(res.buy()).toBe(true);
    expect(rA.count).toBe(100 - 10);
    expect(rB.count).toBe(20);
    expect(rC.count).toBe(5 - 3);

    expect(res.sell()).toBe(true);
    expect(rA.count).toBeCloseTo(100 - 10 + 10 * 0.6);
    expect(rB.count).toBeCloseTo(20);
    expect(rC.count).toBeCloseTo(5 - 3 + 3 * 0.6);
  });
});

describe("Resource Generation", () => {
  var gen, rA, rB, rC;
  var markUp;

  beforeEach(() => {
    rA = new Resource("A", "A", 100);
    rB = new Resource("B", "B", 20, 25);
    rC = new Resource("C", "C", 5, 10);
    markUp = new Growth("double", "multiplicative", 2);
    gen = new Resource("gen")
      .withRequirement([])
      .withPrice([])
      .withSellModifier([]);
  });

  it("no generation", () => {
    gen.update(1);
    expect(rA.count).toBe(100);
    expect(rB.count).toBe(20);
    expect(rC.count).toBe(5);
  });

  it("basic generation", () => {
    gen
      .withCount(1)
      .addInputRate(rA.withRate(10))
      .addOutputRate(rC.withRate(2));

    gen.update(0);
    expect(rA.count).toBe(100);
    expect(rB.count).toBe(20);
    expect(rC.count).toBe(5);

    gen.update(1);
    expect(rA.count).toBe(100 - 10);
    expect(rB.count).toBe(20);
    expect(rC.count).toBe(5 + 2);

    gen.update(1.5);
    expect(rA.count).toBeCloseTo(100 - 10 * 2.5);
    expect(rB.count).toBe(20);
    expect(rC.count).toBeCloseTo(5 + 2 * 2.5);
  });

  it("multi unit generation", () => {
    gen
      .withCount(3)
      .addInputRate(rB.withRate(1))
      .addOutputRate(rA.withRate(10));

    gen.update(1);
    expect(rA.count).toBe(100 + 10 * 3);
    expect(rB.count).toBe(20 - 3);
    expect(rC.count).toBe(5);

    gen.update(0.5);
    expect(rA.count).toBeCloseTo(100 + 10 * 3 * 1.5);
    expect(rB.count).toBeCloseTo(20 - 3 * 1.5);

    gen.withCount(1).update(5);
    expect(rA.count).toBeCloseTo(100 + 10 * 3 * 1.5 + 10 * 5);
    expect(rB.count).toBeCloseTo(20 - 3 * 1.5 - 5);
  });

  it("can't consume more than there is", () => {
    gen.withCount(4).addInputRate(rC.withRate(1)).addOutputRate(rA.withRate(1));

    gen.update(0.5);
    expect(rA.count).toBeCloseTo(100 + 2);
    expect(rC.count).toBeCloseTo(5 - 2);

    gen.update(3);
    expect(rA.count).toBeCloseTo(100 + 5);
    expect(rC.count).toBeCloseTo(5 - 5);

    gen.update(1);
    expect(rA.count).toBeCloseTo(100 + 5);
    expect(rC.count).toBeCloseTo(5 - 5);
  });

  it("can't generate past the cap", () => {
    gen
      .withCount(1)
      .addInputRate(rA.withRate(1))
      .addOutputRate(rB.withRate(4))
      .addOutputRate(rC.withRate(2));

    gen.update(1);
    expect(rA.count).toBeCloseTo(100 - 1);
    expect(rB.count).toBeCloseTo(20 + 4);
    expect(rC.count).toBeCloseTo(5 + 2);

    gen.update(1);
    expect(rA.count).toBeCloseTo(100 - 2);
    expect(rB.count).toBeCloseTo(20 + 5);
    expect(rC.count).toBeCloseTo(5 + 4);

    gen.update(1);
    expect(rA.count).toBeCloseTo(100 - 2.5);
    expect(rB.count).toBeCloseTo(20 + 5);
    expect(rC.count).toBeCloseTo(5 + 5);

    gen.update(1);
    expect(rA.count).toBeCloseTo(100 - 2.5);
    expect(rB.count).toBeCloseTo(20 + 5);
    expect(rC.count).toBeCloseTo(5 + 5);
  });
});

describe("Resource upgrading", () => {
  var rA, rB, rC;
  var markUp;

  beforeEach(() => {
    rA = new Resource("A", "A", 100);
    rB = new Resource("B", "B", 20, 50);
    rC = new Resource("C", "C", 0);

    markUp = new Growth("double", "multiplicative", 2);
  });

  it("Updates the count", () => {
    expect(rA.count).toBe(100);

    rB.addSetsCountFor(
      rA.withRate(0, [new Growth("g1", "multiplicative", 4, 1)]),
    );
    rB.update();
    expect(rA.count).toBe(80);

    rB.withCount(0).update();
    expect(rA.count).toBe(0);

    rB.withCount(50).update();
    expect(rA.count).toBe(200);
  });

  it("Updates the limit", () => {
    expect(rB.limit).toBe(50);

    rC.addSetsLimitFor(
      rB.withRate(0, [
        new Growth("g2", "exponential", 2, 1),
        new Growth("g1", "multiplicative", 10, 1),
      ]),
    );
    rC.update();
    expect(rB.limit).toBe(10);

    rC.withCount(1).update();
    expect(rB.limit).toBe(20);

    rC.withCount(5).update();
    expect(rB.limit).toBe(320);
  });

  it("Updates the bonus tier", () => {
    expect(markUp.tier).toBe(1);

    rC.addSetsTierFor(new Rate(markUp));
    rC.update();
    expect(markUp.tier).toBe(0);

    rC.withCount(1).update();
    expect(markUp.tier).toBe(1);

    rC.withCount(50).update();
    expect(markUp.tier).toBe(50);
  });
});
