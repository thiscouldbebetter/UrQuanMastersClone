"use strict";
class ResourceDefn {
    constructor(name, nameFriendly, color, valuePerUnit) {
        this.name = name;
        this.nameFriendly = nameFriendly;
        this.color = color;
        this.valuePerUnit = valuePerUnit;
    }
    static Instances() {
        if (ResourceDefn._instances == null) {
            ResourceDefn._instances = new ResourceDefn_Instances();
        }
        return ResourceDefn._instances;
    }
    static byName(name) {
        return ResourceDefn.Instances()._AllByName.get(name);
    }
    toItemDefn() {
        if (this._itemDefn == null) {
            this._itemDefn = ItemDefn.fromNameEncumbranceValueAndVisual(this.name, 1, this.valuePerUnit, VisualCircle.fromRadiusAndColorFill(3, this.color)).categoryNameAdd(Resource.name);
        }
        return this._itemDefn;
    }
}
class ResourceDefn_Instances {
    constructor() {
        var colors = Color.Instances();
        this.Commons = new ResourceDefn("Commons", "Common Elements", colors.White, 1);
        this.Corrosives = new ResourceDefn("Corrosives", "Corrosives", colors.Red, 2);
        this.BaseMetals = new ResourceDefn("BaseMetals", "Base Metals", colors.Gray, 3);
        this.NobleGases = new ResourceDefn("NobleGases", "Noble Gases", colors.Blue, 4);
        this.RareEarths = new ResourceDefn("RareEarths", "Rare Earths", colors.Green, 5);
        this.PreciousMetals = new ResourceDefn("PreciousMetals", "Precious Metals", colors.Yellow, 6);
        this.Radioactives = new ResourceDefn("Radioactives", "Radioactives", colors.Orange, 8);
        this.Exotics = new ResourceDefn("Exotics", "Exotics", colors.Violet, 25);
        this.Biodata = new ResourceDefn("Biodata", "Biodata", colors.Green, null);
        this._All =
            [
                this.Commons,
                this.Corrosives,
                this.BaseMetals,
                this.NobleGases,
                this.RareEarths,
                this.PreciousMetals,
                this.Radioactives,
                this.Exotics,
                this.Biodata,
            ];
        this._AllByName = ArrayHelper.addLookupsByName(this._All);
    }
}
