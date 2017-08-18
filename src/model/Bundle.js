import Entity from "./Entity";

export default class Bundle extends Entity {
  constructor(title, primary, items = []) {
    super({
      title,
      primary,
      items
    });
  }

  get unlocked() {
    if (this.primary) {
      return this.primary.unlocked;
    } else {
      return this.items.findIndex(i => i.unlocked) >= 0;
    }
  }

  get visible() {
    if (this.primary) {
      return this.primary.visible;
    } else {
      return this.items.findIndex(i => i.visible) >= 0;
    }
  }

  withBundle(title, primary, items) {
    return this.withItem(new Bundle(title, primary, items));
  }
}