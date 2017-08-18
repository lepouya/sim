const makeMethodName = function(obj, vName, method, bypassOwn) {
  if (!vName || !vName.length) {
    return undefined;
  }

  const wName = method + vName.charAt(0).toUpperCase() + vName.slice(1);
  if (!vName.toLowerCase().startsWith(method) &&
    !vName.startsWith('_') &&
    (bypassOwn || obj.hasOwnProperty(vName)) &&
    (obj[wName] === undefined)) {
    return wName;
  } else {
    return undefined;
  }
};

export default class Entity {
  constructor(args) {
    this.assign(args);

    if (this.hasOwnProperty('name') && !this.name) {
      this.name =
        this.constructor.name.toLowerCase() + '_' +
        Math.random().toString(36).substr(2, 9);
    }
  }

  assign(v) {
    Object.assign(this, v);
    this.addProtos();
    return this;
  }

  addProtos() {
    for (let vName in this) {
      const wName = makeMethodName(this, vName, 'with', false);
      if (!wName) {
        continue;
      }

      this.__proto__[wName] = function(p) {
        this[vName] = p;
        return this;
      };

      if (this[vName] && (this[vName] instanceof Array)) {
        const singular =
          vName.endsWith('es') ? vName.slice(0, vName.length - 2) :
          vName.endsWith('s') ? vName.slice(0, vName.length - 1) :
          vName;
        const method = (singular === vName) ? 'add' : 'with';
        const eName = makeMethodName(this, singular, method, true);
        if (!eName) {
          continue;
        }

        this.__proto__[eName] = function(p) {
          this[vName] = (this[vName] || [])
            .filter(e => e !== p)
            .filter(e => !e.name || !p || e.name !== p.name)
            .filter(e => !e.entity || !p || e.entity !== p.entity)
            .concat(p);
          return this;
        };
      }
    }
  }
}