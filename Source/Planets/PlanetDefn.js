"use strict";
class PlanetDefn {
    constructor(name, visualsStarsystemVicinityOrbit, visualsSurface, canLand, lifeChance, resourceDistributions) {
        this.name = name;
        this.visualStarsystem = visualsStarsystemVicinityOrbit[0];
        this.visualVicinity = visualsStarsystemVicinityOrbit[1];
        this.visualOrbit = visualsStarsystemVicinityOrbit[2];
        this.visualsSurface = visualsSurface;
        this.canLand = canLand;
        this.lifeChance = lifeChance;
        this.resourceDistributions = resourceDistributions;
    }
    static Instances() {
        if (PlanetDefn._instances == null) {
            PlanetDefn._instances = new PlanetDefn_Instances();
        }
        return PlanetDefn._instances;
    }
    // methods
    static byName(planetDefnName) {
        return PlanetDefn.Instances()._AllByName.get(planetDefnName);
    }
}
class PlanetDefn_Instances {
    constructor() {
        var colors = Color.Instances();
        var colorBlack = colors.Black;
        var colorRed = colors.Red;
        var colorOrange = colors.Orange;
        var colorYellow = colors.Yellow;
        var colorGreen = colors.Green;
        var colorCyan = colors.Cyan;
        var colorBlue = colors.Blue;
        var colorViolet = colors.Violet;
        var colorGray = colors.Gray;
        var colorWhite = colors.White;
        var colorToGlobe = (radius, color, colorBorder) => {
            var colorOuter = color.clone().add(colorBlack).add(colorBlack);
            var returnVisual = new VisualCircleGradient(radius, new ValueBreakGroup([
                new ValueBreak(0, color),
                new ValueBreak(1, colorOuter)
            ], null // interpolationMode
            ), colorBorder);
            return returnVisual;
        };
        var radiusStarsystem = 5;
        var visualStarsystemRed = colorToGlobe(radiusStarsystem, colorRed, null);
        var visualStarsystemOrange = colorToGlobe(radiusStarsystem, colorOrange, null);
        var visualStarsystemYellow = colorToGlobe(radiusStarsystem, colorYellow, null);
        var visualStarsystemGreen = colorToGlobe(radiusStarsystem, colorGreen, null);
        var visualStarsystemCyan = colorToGlobe(radiusStarsystem, colorCyan, null);
        var visualStarsystemBlue = colorToGlobe(radiusStarsystem, colorBlue, null);
        var visualStarsystemViolet = colorToGlobe(radiusStarsystem, colorViolet, null);
        var visualStarsystemGray = colorToGlobe(radiusStarsystem, colorGray, null);
        var visualStarsystemWhite = colorToGlobe(radiusStarsystem, colorWhite, null);
        var radiusVicinity = 10;
        var visualVicinityRed = colorToGlobe(radiusVicinity, colorRed, null);
        var visualVicinityOrange = colorToGlobe(radiusVicinity, colorOrange, null);
        var visualVicinityYellow = colorToGlobe(radiusVicinity, colorYellow, null);
        var visualVicinityGreen = colorToGlobe(radiusVicinity, colorGreen, null);
        var visualVicinityCyan = colorToGlobe(radiusVicinity, colorCyan, null);
        var visualVicinityBlue = colorToGlobe(radiusVicinity, colorBlue, null);
        var visualVicinityViolet = colorToGlobe(radiusVicinity, colorViolet, null);
        var visualVicinityGray = colorToGlobe(radiusVicinity, colorGray, null);
        var visualVicinityWhite = colorToGlobe(radiusVicinity, colorWhite, null);
        var radiusOrbit = 50;
        var visualOrbitRed = colorToGlobe(radiusOrbit, colorRed, null);
        var visualOrbitOrange = colorToGlobe(radiusOrbit, colorOrange, null);
        var visualOrbitYellow = colorToGlobe(radiusOrbit, colorYellow, null);
        var visualOrbitGreen = colorToGlobe(radiusOrbit, colorGreen, null);
        var visualOrbitCyan = colorToGlobe(radiusOrbit, colorCyan, null);
        var visualOrbitBlue = colorToGlobe(radiusOrbit, colorBlue, null);
        var visualOrbitViolet = colorToGlobe(radiusOrbit, colorViolet, null);
        var visualOrbitGray = colorToGlobe(radiusOrbit, colorGray, null);
        var visualOrbitWhite = colorToGlobe(radiusOrbit, colorWhite, null);
        var visualsRed = [visualStarsystemRed, visualVicinityRed, visualOrbitRed];
        var visualsOrange = [visualStarsystemOrange, visualVicinityOrange, visualOrbitOrange];
        var visualsYellow = [visualStarsystemYellow, visualVicinityYellow, visualOrbitYellow];
        var visualsGreen = [visualStarsystemGreen, visualVicinityGreen, visualOrbitGreen];
        var visualsCyan = [visualStarsystemCyan, visualVicinityCyan, visualOrbitCyan];
        var visualsBlue = [visualStarsystemBlue, visualVicinityBlue, visualOrbitBlue];
        var visualsViolet = [visualStarsystemViolet, visualVicinityViolet, visualOrbitViolet];
        var visualsGray = [visualStarsystemGray, visualVicinityGray, visualOrbitGray];
        var visualsWhite = [visualStarsystemWhite, visualVicinityWhite, visualOrbitWhite];
        var visualsRainbow = visualsYellow; // todo
        var visualVicinityShielded = new VisualGroup([
            new VisualCircleGradient(radiusVicinity, new ValueBreakGroup([
                new ValueBreak(0, colorRed),
                new ValueBreak(1, colorBlack)
            ], null // interpolationMode
            ), colorRed),
            new VisualCircle(radiusVicinity * 1.1, null, colorRed, null)
        ]);
        var visualOrbitShielded = visualOrbitRed;
        var visualsShielded = [visualStarsystemRed, visualVicinityShielded, visualOrbitShielded];
        var visualsSurface = [new VisualNone()]; // todo
        var canLand = true;
        var cannotLand = false;
        var resourceDefns = ResourceDefn.Instances();
        var ce = resourceDefns.Commons.name;
        var co = resourceDefns.Corrosives.name;
        var bm = resourceDefns.BaseMetals.name;
        var ng = resourceDefns.NobleGases.name;
        var pm = resourceDefns.PreciousMetals.name;
        var re = resourceDefns.RareEarths.name;
        var ra = resourceDefns.Radioactives.name;
        var ex = resourceDefns.Exotics.name;
        var todo = ce;
        // todo - Resource densities
        var light = 1;
        var medium = 2;
        var heavy = 3;
        var huge = 4;
        var rd = (resourceDefnName, numberOfDeposits, quantityPerDeposit) => {
            return new ResourceDistribution(resourceDefnName, numberOfDeposits, quantityPerDeposit);
        };
        var pd = PlanetDefn;
        // Special worlds.
        this.Rainbow = new pd("Rainbow", visualsRainbow, visualsSurface, canLand, 0, [rd(ex, 6, huge),]);
        this.Shielded = new pd("Shielded", visualsShielded, visualsSurface, cannotLand, 0, []);
        // Ordinary worlds.
        this.Acid = new pd("Acid", visualsGreen, visualsSurface, canLand, .108, [rd(ce, 6, heavy)]);
        this.Alkali = new pd("Alkali", visualsGreen, visualsSurface, canLand, .234, [rd(bm, 3, medium)]);
        this.Auric = new pd("Auric", visualsYellow, visualsSurface, canLand, .358, [rd(pm, 3, huge)]);
        this.Azure = new pd("Azure", visualsBlue, visualsSurface, canLand, .270, [rd(bm, 3, light)]);
        this.Carbide = new pd("Carbide", visualsRed, visualsSurface, canLand, .063, [rd(ce, 3, heavy)]);
        this.Chlorine = new pd("Chlorine", visualsGreen, visualsSurface, canLand, .03, [rd(bm, 2, light), rd(co, 2, heavy), rd(ce, 2, heavy)]);
        this.Chondrite = new pd("Chondrite", visualsViolet, visualsSurface, canLand, .02, [rd(ce, 2, heavy)]);
        this.Cimmerian = new pd("Cimmerian", visualsRed, visualsSurface, canLand, .01, [rd(ce, 4, medium)]);
        this.Copper = new pd("Copper", visualsGreen, visualsSurface, canLand, .22, [rd(bm, 2, huge)]);
        this.Crimson = new pd("Crimson", visualsRed, visualsSurface, canLand, .20, [rd(bm, 5, light)]);
        this.Cyanic = new pd("Cyanic", visualsBlue, visualsSurface, canLand, 0, [rd(ce, 1, medium)]);
        this.Dust = new pd("Dust", visualsOrange, visualsSurface, canLand, 0, [rd(ce, 1, medium)]);
        this.Emerald = new pd("Emerald", visualsGreen, visualsSurface, canLand, 0, [rd(ex, 1, medium)]);
        this.Fluorescent = new pd("Fluorescent", visualsViolet, visualsSurface, canLand, 0, [rd(ng, 1, medium)]);
        this.GasGiant = new pd("GasGiant", visualsGreen, visualsSurface, canLand, 0, []);
        this.Green = new pd("Green", visualsGreen, visualsSurface, canLand, 0, [rd(re, 1, medium)]);
        this.Halide = new pd("Halide", visualsGreen, visualsSurface, canLand, 0, [rd(co, 1, medium)]);
        this.Hydrocarbon = new pd("Hydrocarbon", visualsWhite, visualsSurface, canLand, 0, [rd(ce, 1, medium), rd(bm, 1, medium)]);
        this.Infrared = new pd("Infrared", visualsRed, visualsSurface, canLand, 0, [rd(bm, 1, medium)]);
        this.Iodine = new pd("Iodine", visualsGreen, visualsSurface, canLand, 0, [rd(co, 1, medium)]);
        this.Lanthanide = new pd("Lanthanide", visualsYellow, visualsSurface, canLand, 0, [rd(re, 1, medium)]);
        this.Magma = new pd("Magma", visualsRed, visualsSurface, canLand, 0, [rd(bm, 1, medium)]);
        this.Magnetic = new pd("Magnetic", visualsGreen, visualsSurface, canLand, 0, [rd(bm, 1, medium), rd(ex, 1, medium)]);
        this.Maroon = new pd("Maroon", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium),]);
        this.Metal = new pd("Metal", visualsOrange, visualsSurface, canLand, 0, [rd(pm, 3, medium), rd(ra, 3, medium)]);
        this.Noble = new pd("Noble", visualsBlue, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Oolite = new pd("Oolite", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Opalescent = new pd("Opalescent", visualsCyan, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Organic = new pd("Organic", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Pellucid = new pd("Pellucid", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Plutonic = new pd("Plutonic", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Primordial = new pd("Primordial", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Purple = new pd("Purple", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.QuasiDegenerate = new pd("Quasi-Degenerate", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Radioactive = new pd("Radioactive", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Redux = new pd("Redux", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Ruby = new pd("Ruby", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Sapphire = new pd("Sapphire", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Selenic = new pd("Selenic", visualsGray, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Shattered = new pd("Shattered", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.SuperDense = new pd("Super-Dense", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Telluric = new pd("Telluric", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Treasure = new pd("Treasure", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Ultramarine = new pd("Ultramarine", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Ultraviolet = new pd("Ultraviolet", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Urea = new pd("Urea", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Vinylogous = new pd("Vinylogous", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Water = new pd("Water", visualsCyan, visualsSurface, canLand, .9, [rd(todo, 1, medium)]);
        this.Xenolithic = new pd("Xenolithic", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this.Yttric = new pd("Yttric", visualsViolet, visualsSurface, canLand, 0, [rd(todo, 1, medium)]);
        this._All =
            [
                //this.Shielded,
                //this.Rainbow,
                this.Acid,
                this.Alkali,
                this.Auric,
                this.Azure,
                this.Carbide,
                this.Chlorine,
                this.Chondrite,
                this.Cimmerian,
                this.Copper,
                this.Crimson,
                this.Cyanic,
                this.Dust,
                this.Emerald,
                this.Fluorescent,
                this.GasGiant,
                this.Green,
                this.Halide,
                this.Hydrocarbon,
                this.Infrared,
                this.Iodine,
                this.Lanthanide,
                this.Magma,
                this.Magnetic,
                this.Maroon,
                this.Metal,
                this.Noble,
                this.Oolite,
                this.Opalescent,
                this.Organic,
                this.Pellucid,
                this.Plutonic,
                this.Primordial,
                this.Purple,
                this.QuasiDegenerate,
                this.Radioactive,
                this.Rainbow,
                this.Redux,
                this.Ruby,
                this.Sapphire,
                this.Selenic,
                this.Shattered,
                this.Shielded,
                this.SuperDense,
                this.Telluric,
                this.Treasure,
                this.Ultramarine,
                this.Ultraviolet,
                this.Urea,
                this.Vinylogous,
                this.Water,
                this.Xenolithic,
                this.Yttric,
            ];
        this._AllByName = ArrayHelper.addLookupsByName(this._All);
    }
}
