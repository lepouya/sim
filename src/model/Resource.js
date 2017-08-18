import GeneratorResource from "./GeneratorResource";

export default class Resource extends GeneratorResource {
  constructor(name, desc, count, limit, unlocked, visible) {
    super(name, desc, count, limit, unlocked, visible);
    this.update();
  }

  update(ticks = 0, now = 0) {
    return super.update(ticks, now);
  }
}