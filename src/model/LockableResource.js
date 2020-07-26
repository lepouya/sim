import BasicResource from "./BasicResource";

export default class LockableResource extends BasicResource {
  constructor(name, desc, count, limit, unlocked = true, visible = true) {
    super(name, desc, count, limit);
    this.assign({
      unlocked,
      visible,
      requirement: [],
    });
    this.requirement = undefined;
  }

  update(ticks, now) {
    if (!super.update(ticks, now)) {
      return false;
    }

    // Unlock and make visible if all requirements are met
    if ((!this.unlocked || !this.visible) && this.requirement) {
      let unlock = true;
      for (let cost of this.requirement) {
        if (cost.entity._count < cost.value) {
          unlock = false;
          break;
        }
      }
      this.unlocked = this.unlocked || unlock;
      this.visible = this.visible || unlock;
    }

    return this.unlocked;
  }
}
