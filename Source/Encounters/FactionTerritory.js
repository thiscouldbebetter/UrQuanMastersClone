"use strict";
class FactionTerritory {
    constructor(shape) {
        this.shape = shape;
        this._disabled = false;
    }
    disable() {
        this._disabled = true;
        return this;
    }
    disabled() {
        return this._disabled;
    }
    enable() {
        this._disabled = false;
        return this;
    }
    enabled() {
        return (this._disabled == false);
    }
}
