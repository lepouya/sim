import Entity from "./Entity";
import Resource from "./Resource";
import Rate from "./Rate";
import Growth from "./Growth";
import Bundle from "./Bundle";

const _storageAvailable = function (type) {
  const storage = window[type];
  const x = "__storage_test__";

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0 &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED")
    );
  }
};

let _skipEncoding = false;
const _code = (s) => {
  if (_skipEncoding) {
    return s;
  }

  let h = s.startsWith("..");
  let c = (h ? s : Math.random().toString(36)).substr(2, 8);
  s = (h ? s.slice(10) : s).split("").map((s) => s.charCodeAt());
  s = s.map((s, i) => String.fromCharCode(s ^ c.charCodeAt(i % 8)));
  return (h ? "" : ".." + c) + s.join("");
};

export default class ResourceManager extends Entity {
  constructor(
    name,
    version = "1",
    timeStamp = Date.now() / 1000,
    updateGranularity = 0.25,
    maxUpdateCycles = 3600,
  ) {
    super({
      name,
      version,
      timeStamp,
      updateGranularity,
      maxUpdateCycles,
      tabs: [],
    });
    this.growths = {};
    this.resources = {};
  }

  _skipEncoding() {
    _skipEncoding = true;
  }

  update(now = Date.now() / 1000) {
    let delta = now - this.timeStamp;

    // Junk detection
    if (delta < 0) {
      return;
    }
    if (delta > 1000000) {
      this.timeStamp = now;
      return;
    }

    // Too soon, do a quick refresh
    if (delta < this.updateGranularity) {
      for (let rName in this.resources) {
        this.resources[rName].update(0, this.timeStamp);
      }
      return;
    }

    // Cap
    if (delta > this.maxUpdateCycles) {
      this.timeStamp = now - this.maxUpdateCycles;
      delta = this.maxUpdateCycles;
    }

    // Find the number of ticks and the exact time to set the timestamp to
    let timeToSend = this.timeStamp;
    let ticks = Math.floor(delta / this.updateGranularity);
    this.timeStamp += this.updateGranularity * ticks;

    // Update all resources
    while (ticks-- > 0) {
      timeToSend += this.updateGranularity;
      for (let rName in this.resources) {
        this.resources[rName].update(this.updateGranularity, timeToSend);
      }
    }
  }

  withBonus(growth) {
    this.growths[growth.name] = growth;
    return this;
  }

  withResource(resource) {
    this.resources[resource.name] = resource;
    return this;
  }

  addBonus(name, growthFunction, coefficient, tier) {
    const growth = new Growth(name, growthFunction, coefficient, tier);
    this.withBonus(growth);
    return growth;
  }

  addResource(name, description, count, limit, unlocked, visible) {
    const resource = new Resource(
      name,
      description,
      count,
      limit,
      unlocked,
      visible,
    );
    this.withResource(resource);
    return resource;
  }

  addTab(title, primary, items) {
    const tab = new Bundle(title, primary, items);
    this.withTab(tab);
    return tab;
  }

  getBonus(name) {
    return this.growths[name];
  }

  getResource(name) {
    return this.resources[name];
  }

  saveToLocalStorage(incremental = true) {
    if (_storageAvailable("localStorage")) {
      const saveVal = this.saveToString(incremental);
      if (saveVal) {
        localStorage.setItem(this.name, saveVal);
      }
    }
  }

  loadFromLocalStorage(incremental = true) {
    if (_storageAvailable("localStorage")) {
      const saveVal = localStorage.getItem(this.name);
      if (saveVal) {
        try {
          this.loadFromString(saveVal, incremental);
        } catch (_) {}
        this.update();
      }
    }
    return this;
  }

  resetLocalStorage() {
    if (_storageAvailable("localStorage")) {
      localStorage.removeItem(this.name);
    }
  }

  saveToString(incremental = true) {
    return btoa(_code(JSON.stringify(this.save(this, false, incremental))));
  }

  loadFromString(value, incremental = true) {
    return this.load(JSON.parse(_code(atob(value))), this, false, incremental);
  }

  save(v = this, isRoot = false, incremental = false) {
    if (v === undefined || v instanceof Function) {
      return undefined;
    } else if (incremental && v instanceof ResourceManager) {
      const ret = {};
      ret.version = v.version;
      ret.tutorial = { step: (v.tutorial && v.tutorial.step) || 0 };
      ret.resources = {};

      for (let n in v.resources) {
        const res = v.resources[n];
        if (n !== undefined) {
          ret.resources[n] = {
            count: res.count,
            visible: res.visible,
            unlocked: res.unlocked,
          };
        }
      }

      return ret;
    } else if (
      !isRoot &&
      v.name &&
      (this.growths[v.name] || this.resources[v.name])
    ) {
      return v.name;
    } else if (v instanceof Array) {
      const ret = [];
      for (let e of v) {
        ret.push(this.save(e));
      }
      return ret;
    } else if (v instanceof Object) {
      const ret = {};
      const nextRoot = v === this.growths || v === this.resources;

      for (let n in v) {
        if (!n || !n.length || v[n] === undefined || (isRoot && n === "name")) {
          continue;
        }

        let saved = this.save(v[n], nextRoot);
        if (v instanceof Resource && n === "_count") {
          n = "count";
        }
        if (saved !== undefined && !n.startsWith("_")) {
          ret[n] = saved;
        }
      }
      return ret;
    } else {
      return v;
    }
  }

  load(obj, v = this, expand = false, incremental = false) {
    if (!(v instanceof Object) && !expand) {
      return obj;
    }

    if (incremental && v instanceof ResourceManager) {
      v.version = obj.version || v.version;

      if (v.tutorial && obj.tutorial) {
        v.tutorial.step = obj.tutorial.step || 0;
      }

      if (v.resources && obj.resources) {
        for (let n in v.resources) {
          if (v.resources[n] && obj.resources[n]) {
            v.resources[n].count =
              obj.resources[n].count || v.resources[n].count;
            v.resources[n].visible =
              obj.resources[n].visible || v.resources[n].visible;
            v.resources[n].unlocked =
              obj.resources[n].unlocked || v.resources[n].unlocked;
          }
        }
      }

      return v;
    }

    if (expand) {
      if (obj instanceof String || typeof obj === "string") {
        return this.growths[obj] || this.resources[obj] || obj;
      } else if (!(v instanceof Object)) {
        return obj;
      } else if (obj.entity !== undefined) {
        return this.load(obj, new Rate());
      } else if (obj.growthFunction !== undefined) {
        return this.load(obj, new Growth());
      } else if (obj.items !== undefined || obj.primary !== undefined) {
        return this.load(obj, new Bundle());
      }
    }

    Object.assign(v, obj);

    if (v instanceof ResourceManager) {
      for (let n in v.growths) {
        v.growths[n] = this.load(v.growths[n], new Growth(n));
      }

      const pass1 = {};
      for (let n in v.resources) {
        pass1[n] = v.resources[n];
        v.resources[n] = new Resource(n);
      }
      for (let n in v.resources) {
        v.resources[n] = this.load(pass1[n], v.resources[n]);
      }
    }

    if (v.entity) {
      if (this.resources[v.entity]) {
        v.entity = this.resources[v.entity];
      } else if (this.growths[v.entity]) {
        v.entity = this.growths[v.entity];
      }
    }

    if (v.primary) {
      v.primary = this.resources[v.primary];
    }

    if (v instanceof Entity) {
      for (let n in v) {
        if (v[n] instanceof Array) {
          let arr = [];
          for (let e of v[n]) {
            arr.push(this.load(e, e, true));
          }
          v[n] = arr;
        }
      }
    }

    return v;
  }
}
