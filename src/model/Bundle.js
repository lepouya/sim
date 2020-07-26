import Entity from "./Entity";

export default class Bundle extends Entity {
  constructor(title, primary, items = []) {
    super({
      title,
      primary,
      items,
      description: undefined,
    });
  }

  get unlocked() {
    if (this.primary) {
      return this.primary.unlocked;
    } else if (this.items.length > 0) {
      return this.items.findIndex((i) => i.unlocked) >= 0;
    } else {
      return true;
    }
  }

  get visible() {
    if (this.primary) {
      return this.primary.visible;
    } else if (this.items.length > 0) {
      return this.items.findIndex((i) => i.visible) >= 0;
    } else {
      return true;
    }
  }

  withBundle(title, primary, items) {
    return this.withItem(new Bundle(title, primary, items));
  }
}
