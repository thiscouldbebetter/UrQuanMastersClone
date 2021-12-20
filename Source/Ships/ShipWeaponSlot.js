"use strict";
class ShipWeaponSlot {
    constructor(name, componentInstalledIndex) {
        this.name = name;
        this.componentInstalledIndex = componentInstalledIndex;
    }
    static Instances() {
        if (ShipWeaponSlot._instances == null) {
            ShipWeaponSlot._instances = new ShipWeaponSlot_Instances();
        }
        return ShipWeaponSlot._instances;
    }
    // instance methods
    componentInstalled(ship) {
        return null; // todo
    }
    nameAndComponentInstalled() {
        var componentInstalled = this.componentInstalled;
        var componentInstalledName = (componentInstalled == null ? "[none]" : componentInstalled.name);
        var returnValue = this.name + ": " + componentInstalledName;
        return returnValue;
    }
}
class ShipWeaponSlot_Instances {
    constructor() {
        this.Forward = new ShipWeaponSlot("Forward", null);
        this.Oblique = new ShipWeaponSlot("Oblique", null);
        this.Lateral = new ShipWeaponSlot("Lateral", null);
        this.Rear = new ShipWeaponSlot("Rear", null);
        this._All =
            [
                this.Forward,
                this.Oblique,
                this.Lateral,
                this.Rear
            ];
        this._AllByName = ArrayHelper.addLookupsByName(this._All);
    }
}
