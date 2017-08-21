import Resource from "../Resource";
import Rate from "../Rate";
import Growth from "../Growth";
import ResourceManager from "../ResourceManager";

describe("ResourceManager load and save", () => {
  var rm;

  beforeEach(() => {
    rm = new ResourceManager("test manager");
  });

  it("load after save produces same result", () => {
    const markUp = rm.addBonus("double", "exponential", 2);
    const markDown = rm.addBonus("-40%", "percentage", -40);
    const bonusL = rm.addBonus("L", "linear", -2, 1);
    const bonusP = rm.addBonus("P", "percentage", -10, 1);

    const rA = rm.addResource("A").withCount(100);
    const rB = rm.addResource("B", "B", 20, 25, false);
    const rC = rm.addResource("C", "C", 5)
      .withRequirement([rA.withRate(10, [bonusP]), rB.withRate(1, [bonusP, bonusL])]);

    const rD = rm.addResource("D")
      .withCount(0)
      .addPrice(rA.withRate(10, [bonusL]))
      .addPrice(rB.withRate(5))
      .addPrice(rC.withRate(1))
      .addPurchaseGrowth(markUp)
      .addSellModifier(markDown);

    const rE = rm.addResource("E")
      .withCount(0)
      .addInputRate(rA.withRate(1))
      .addOutputRate(rB.withRate(4))
      .addOutputRate(rC.withRate(2))
      .addInputRateGrowth(bonusL)
      .addOutputRateGrowth(bonusP);

    rC.addSetsLimitFor(rB.withRate(0, [new Growth("g2", "exponential", 2, 1),
                                       new Growth("g1", "multiplicative", 10, 1)]));
    rC.addSetsLimitFor(rE.withRate(0, [new Growth("g1", "multiplicative", 4, 1)]));
    rB.addSetsTierFor(markUp.withRate(0));

    rm.addTab('Empty Tab');
    rm.addTab('Stuff', rA)
      .withBundle('A', rA)
      .withBundle('B|C', rB, [rB, rC])
      .withBundle('D | E', undefined, [rD, rE]);

    const save = rm.saveToString();
    const load = new ResourceManager().loadFromString(save);
    expect(load.saveToString()).toEqual(rm.saveToString());
    expect(Object.assign({}, load)).toEqual(Object.assign({}, rm));
    expect(load).toEqual(rm);

    load.update();
    expect(load.saveToString()).not.toEqual(rm.saveToString());
    expect(Object.assign({}, load)).not.toEqual(Object.assign({}, rm));
    expect(load).not.toEqual(rm);

    rm.update();
    expect(load.saveToString()).toEqual(rm.saveToString());
    expect(Object.assign({}, load)).toEqual(Object.assign({}, rm));
    expect(load).toEqual(rm);
  });
});

describe("ResourceManager update", () => {
  var rm;
  var rA, rB, rC;
  var genA, genB;
  var markUp;

  beforeEach(() => {
    rm = new ResourceManager("test manager", "0", 1000, 0.1, 10);

    rA = rm.addResource("A").withCount(100);
    rB = rm.addResource("B").withCount(20).withLimit(50);
    rC = rm.addResource("C").withCount(5).withLimit(25);
    markUp = rm.addBonus("double", "exponential", 2);
    genA = rm.addResource("genA");
    genB = rm.addResource("genB");

    genA
      .withCount(3)
      .addInputRate(rB.withRate(1))
      .addOutputRate(rA.withRate(2));
    genB
      .withCount(1)
      .addInputRate(rC.withRate(1))
      .addOutputRate(rB.withRate(5));
  });

  it("no tick leads to no result", () => {
    expect(rm.timeStamp).toBeCloseTo(1000);
    expect(rA.count).toBeCloseTo(100);
    expect(rB.count).toBeCloseTo(20);
    expect(rC.count).toBeCloseTo(5);
    expect(genA.count).toBeCloseTo(3);
    expect(genB.count).toBeCloseTo(1);

    rm.update(1000);
    expect(rm.timeStamp).toBeCloseTo(1000);
    expect(rA.count).toBeCloseTo(100);
    expect(rB.count).toBeCloseTo(20);
    expect(rC.count).toBeCloseTo(5);
  });

  it("bad ticks lead to no result", () => {
    rm.update(90);
    expect(rm.timeStamp).toBeCloseTo(1000);
    expect(rA.count).toBeCloseTo(100);
    expect(rB.count).toBeCloseTo(20);
    expect(rC.count).toBeCloseTo(5);

    rm.update(-3.14);
    expect(rm.timeStamp).toBeCloseTo(1000, 5);
    expect(rA.count).toBeCloseTo(100, 5);
    expect(rB.count).toBeCloseTo(20, 5);
    expect(rC.count).toBeCloseTo(5, 5);

    rm.update(1234567890);
    expect(rm.timeStamp).toBeCloseTo(1234567890);
    expect(rA.count).toBeCloseTo(100);
    expect(rB.count).toBeCloseTo(20);
    expect(rC.count).toBeCloseTo(5);
  });

  it("no tick smaller than granularity", () => {
    rm.update(1000.099);
    expect(rm.timeStamp).toBeCloseTo(1000, 5);
    expect(rA.count).toBeCloseTo(100, 5);
    expect(rB.count).toBeCloseTo(20, 5);
    expect(rC.count).toBeCloseTo(5, 5);
  });

  it("basic ticking", () => {
    rm.update(1001);
    expect(rm.timeStamp).toBeCloseTo(1001);
    expect(rA.count).toBeCloseTo(100 + 6);
    expect(rB.count).toBeCloseTo(20 + 5 - 3);
    expect(rC.count).toBeCloseTo(5 - 1);

    rm.update(1003);
    expect(rm.timeStamp).toBeCloseTo(1003);
    expect(rA.count).toBeCloseTo(100 + 3 * 6);
    expect(rB.count).toBeCloseTo(20 + 3 * 5 - 3 * 3);
    expect(rC.count).toBeCloseTo(5 - 3);

    rm.update(1005);
    expect(rm.timeStamp).toBeCloseTo(1005);
    expect(rA.count).toBeCloseTo(100 + 5 * 6);
    expect(rB.count).toBeCloseTo(20 + 5 * 5 - 5 * 3);
    expect(rC.count).toBeCloseTo(5 - 5);

    rm.update(1010);
    expect(rm.timeStamp).toBeCloseTo(1010);
    expect(rA.count).toBeCloseTo(100 + 10 * 6);
    expect(rB.count).toBeCloseTo(20 + 5 * 5 - 10 * 3);
    expect(rC.count).toBeCloseTo(5 - 5);
  });

  it("ticking in large increments curbs itself", () => {
    rm.update(1314);
    expect(rm.timeStamp).toBeCloseTo(1314);
    expect(rA.count).toBeCloseTo(100 + 10 * 6);
    expect(rB.count).toBeCloseTo(20 + 5 * 5 - 10 * 3);
    expect(rC.count).toBeCloseTo(5 - 5);
  });

  it("tick leftovers", () => {
    rm.update(1001.09);
    expect(rm.timeStamp).toBeCloseTo(1001, 5);
    expect(rA.count).toBeCloseTo(100 + 6);
    expect(rB.count).toBeCloseTo(20 + 5 - 3);
    expect(rC.count).toBeCloseTo(5 - 1);

    rm.update(1001.11);
    expect(rm.timeStamp).toBeCloseTo(1001.1, 5);
    expect(rA.count).toBeCloseTo(100 + 6.6, 5);
    expect(rB.count).toBeCloseTo(20 + 5.5 - 3.3, 5);
    expect(rC.count).toBeCloseTo(5 - 1.1, 5);
  });
});