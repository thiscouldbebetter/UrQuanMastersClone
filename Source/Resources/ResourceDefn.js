"use strict";
class ResourceDefn {
    constructor(name, nameFriendly, categoryName, color, valuePerUnit) {
        this.name = name;
        this.nameFriendly = nameFriendly;
        this.categoryName = categoryName;
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
            this._itemDefn = ItemDefn.fromNameEncumbranceValueAndVisual(this.name, 1, this.valuePerUnit, VisualCircle.fromRadiusAndColorFill(3, this.color)).categoryNameAdd(this.categoryName);
        }
        return this._itemDefn;
    }
}
ResourceDefn.CategoryBiodataName = "Biodata";
ResourceDefn.CategoryMineralName = "Mineral";
class ResourceDefn_Instances {
    constructor() {
        var colors = Color.Instances();
        var rd = ResourceDefn;
        var categoryMinerals = ResourceDefn.CategoryMineralName;
        var categoryBiodata = ResourceDefn.CategoryBiodataName;
        this.Commons = new rd("Commons", "Common Elements", categoryMinerals, colors.White, 1);
        this.Corrosives = new rd("Corrosives", "Corrosives", categoryMinerals, colors.Red, 2);
        this.BaseMetals = new rd("BaseMetals", "Base Metals", categoryMinerals, colors.Gray, 3);
        this.NobleGases = new rd("NobleGases", "Noble Gases", categoryMinerals, colors.Blue, 4);
        this.RareEarths = new rd("RareEarths", "Rare Earths", categoryMinerals, colors.Green, 5);
        this.PreciousMetals = new rd("PreciousMetals", "Precious Metals", categoryMinerals, colors.Yellow, 6);
        this.Radioactives = new rd("Radioactives", "Radioactives", categoryMinerals, colors.Orange, 8);
        this.Exotics = new rd("Exotics", "Exotics", categoryMinerals, colors.Violet, 25);
        this.Biodata = new rd("Biodata", "Biodata", categoryBiodata, colors.Green, 2);
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
                this.Biodata
            ];
        this._AllByName = ArrayHelper.addLookupsByName(this._All);
    }
}
