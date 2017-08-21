import Entity from './Entity';
import Resource from './Resource';
import Rate from './Rate';
import Growth from './Growth';
import Bundle from './Bundle';

const storageAvailable = function(type) {
  const storage = window[type];
  const x = '__storage_test__';

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;

  } catch (e) {
    return (e instanceof DOMException) &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage.length !== 0) && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
  }
};

export default class ResourceManager extends Entity {
  constructor(
    name,
    version = '1',
    timeStamp = Date.now() / 1000,
    updateGranularity = 0.25,
    maxUpdateCycles = 3600
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
    const resource = new Resource(name, description, count, limit, unlocked, visible);
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

  saveToLocalStorage() {
    if (storageAvailable('localStorage')) {
      const saveVal = this.saveToString();
      if (saveVal) {
        localStorage.setItem(this.name, saveVal);
      }
    }
  }

  loadFromLocalStorage() {
    if (storageAvailable('localStorage')) {
      const saveVal = localStorage.getItem(this.name);
      if (saveVal) {
        this.loadFromString(saveVal);
      }
    }
    return this;
  }

  resetLocalStorage() {
    if (storageAvailable('localStorage')) {
      localStorage.removeItem(this.name);
    }
  }

  saveToString() {
    return btoa(JSON.stringify(this.save()));
  }

  loadFromString(value) {
    return this.load(JSON.parse(atob(value)));
  }

  save(v = this, isRoot = false) {
    if ((v === undefined) || (v instanceof Function)) {
      return undefined;

    } else if (!isRoot && v.name &&
      (this.growths[v.name] || this.resources[v.name])) {
      return v.name;

    } else if (v instanceof Array) {
      const ret = [];
      for (let e of v) {
        ret.push(this.save(e));
      }
      return ret;

    } else if (v instanceof Object) {
      const ret = {};
      const nextRoot = (v === this.growths) || (v === this.resources);

      for (let n in v) {
        if (!n || !n.length || (v[n] === undefined) || (isRoot && n === 'name')) {
          continue;
        }

        let saved = this.save(v[n], nextRoot);
        if ((v instanceof Resource) && (n === '_count')) {
          n = 'count';
        }
        if ((saved !== undefined) && !n.startsWith('_')) {
          ret[n] = saved;
        }
      }
      return ret;

    } else {
      return v;
    }
  }

  load(obj, v = this, expand = false) {
    if (!(v instanceof Object) && !expand) {
      return obj;
    }

    if (expand) {
      if ((obj instanceof String) || (typeof obj === 'string')) {
        return this.growths[obj] || this.resources[obj] || obj;

      } else if (!(v instanceof Object)) {
        return obj;

      } else if (obj.entity !== undefined) {
        return this.load(obj, new Rate());

      } else if (obj.growthFunction !== undefined) {
        return this.load(obj, new Growth());

      } else if ((obj.items !== undefined) || (obj.primary !== undefined)) {
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