
function PlanetDefn(name, color, lifeChance, minerals)
{
	this.name = name;
	this.color = color;
	this.lifeChance = lifeChance;
	this.minerals = minerals;
}
{
	// instances

	PlanetDefn.Instances = function()
	{
		if (PlanetDefn._instances == null)
		{
			PlanetDefn._instances = new PlanetDefn_Instances();
		}

		return PlanetDefn._instances;
	}

	function PlanetDefn_Instances()
	{
		var ce = "CommonElements";
		var co = "Corrosives";
		var bm = "BaseMetals";
		var ng = "NobleGases";
		var pm = "PreciousMetals";
		var re = "RareEarths";
		var ex = "Exotics";
		var todo = ce;

		this.Acid = new PlanetDefn("Acid", "Green", .108, [ new Item(ce, 6) ] );
		this.Alkali = new PlanetDefn("Alkali", "Green", .234, [ new Item(bm, 3) ] );
		this.Auric = new PlanetDefn("Auric", "Yellow", .358, [ new Item(pm, 3) ] );
		this.Azure = new PlanetDefn("Azure", "Blue", .270, [ new Item(bm, 3) ] );
		this.Carbide = new PlanetDefn("Carbide", "Red", .063, [ new Item(ce, 3) ] );
		this.Chlorine = new PlanetDefn("Chlorine", "Green", .03, [ new Item(bm, 2), new Item(co, 2), new Item(ce, 2) ] );
		this.Chondrite = new PlanetDefn("Chondrite", "Violet", .02, [ new Item(ce, 2) ] );
		this.Cimmerian = new PlanetDefn("Cimmerian", "Red", .01, [ new Item(ce, 4) ] );
		this.Copper = new PlanetDefn("Copper", "Green", .22, [ new Item(bm, 2) ] );
		this.Crimson = new PlanetDefn("Crimson", "Red", .20, [ new Item(bm, 5) ] );

		this.Cyanic = new PlanetDefn("Cyanic", "Blue", 0, [ new Item(ce, 1) ] );
		this.Dust = new PlanetDefn("Dust", "Orange", 0, [ new Item(ce, 1) ] );
		this.Emerald = new PlanetDefn("Emerald", "Green", 0, [ new Item(ex, 1) ] );
		this.Fluorescent = new PlanetDefn("Fluorescent", "Violet", 0, [ new Item(ng, 1) ] );
		this.GasGiant = new PlanetDefn("GasGiant", "Green", 0, [] );
		this.Green = new PlanetDefn("Green", "Green", 0, [ new Item(re, 1) ] );
		this.Halide = new PlanetDefn("Halide", "Green", 0, [ new Item(co, 1) ] );
		this.Hydrocarbon = new PlanetDefn("Hydrocarbon", "White", 0, [ new Item(ce, 1), new Item(bm, 1) ] );
		this.Infrared = new PlanetDefn("Infrared", "Red", 0, [ new Item(bm, 1) ] );
		this.Iodine = new PlanetDefn("Iodine", "Green", 0, [ new Item(co, 1) ] );
		this.Lanthanide = new PlanetDefn("Lanthanide", "Yellow", 0, [ new Item(re, 1) ] );
		this.Magma = new PlanetDefn("Magma", "Red", 0, [ new Item(bm, 1) ] );
		this.Magnetic = new PlanetDefn("Magnetic", "Green", 0, [ new Item(bm, 1), new Item(ex, 1) ] );
		this.Maroon = new PlanetDefn("Maroon", "Violet", 0, [ new Item(todo, 1), ] );
		this.Metallic = new PlanetDefn("Metallic", "Orange", 0, [ new Item(todo, 1), ] );
		this.Noble = new PlanetDefn("Noble", "Blue", 0, [ new Item(todo, 1), ] );
		this.Oolite = new PlanetDefn("Oolite", "Violet", 0, [ new Item(todo, 1), ] );
		this.Opalescent = new PlanetDefn("Opalescent", "Cyan", 0, [ new Item(todo, 1), ] );

		this.Organic = new PlanetDefn("Organic", "Violet", 0, [ new Item(todo, 1), ] );
		this.Pellucid = new PlanetDefn("Pellucid", "Violet", 0, [ new Item(todo, 1), ] );
		this.Plutonic = new PlanetDefn("Plutonic", "Violet", 0, [ new Item(todo, 1), ] );
		this.Primordial = new PlanetDefn("Primordial", "Violet", 0, [ new Item(todo, 1), ] );
		this.Purple  = new PlanetDefn("Purple", "Violet", 0, [ new Item(todo, 1), ] );
		this.QuasiDegenerate = new PlanetDefn("QuasiDegenerate", "Violet", 0, [ new Item(todo, 1), ] );
		this.Radioactive = new PlanetDefn("Radioactive", "Violet", 0, [ new Item(todo, 1), ] );
		this.Rainbow = new PlanetDefn("Rainbow", "Violet", 0, [ new Item(todo, 1), ] );
		this.Redux = new PlanetDefn("Redux", "Violet", 0, [ new Item(todo, 1), ] );
		this.Ruby = new PlanetDefn("Ruby", "Violet", 0, [ new Item(todo, 1), ] );
		this.Sapphire = new PlanetDefn("Sapphire", "Violet", 0, [ new Item(todo, 1), ] );
		this.Selenic = new PlanetDefn("Selenic", "Gray", 0, [ new Item(todo, 1), ] );
		this.Shattered = new PlanetDefn("Shattered", "Violet", 0, [ new Item(todo, 1), ] );
		this.SuperDense = new PlanetDefn("SuperDense", "Violet", 0, [ new Item(todo, 1), ] );
		this.Telluric = new PlanetDefn("Telluric", "Violet", 0, [ new Item(todo, 1), ] );
		this.Treasure = new PlanetDefn("Treasure", "Violet", 0, [ new Item(todo, 1), ] );
		this.Ultramarine = new PlanetDefn("Ultramarine", "Violet", 0, [ new Item(todo, 1), ] );
		this.Ultraviolet = new PlanetDefn("Ultraviolet", "Violet", 0, [ new Item(todo, 1), ] );
		this.Urea = new PlanetDefn("Urea", "Violet", 0, [ new Item(todo, 1), ] );
		this.Vinylogous = new PlanetDefn("Vinylogous", "Violet", 0, [ new Item(todo, 1), ] );
		this.Water = new PlanetDefn("Water", "Cyan", 0, [ new Item(todo, 1), ] );
		this.Xenolithic = new PlanetDefn("Xenolithic", "Violet", 0, [ new Item(todo, 1), ] );
		this.Yttric = new PlanetDefn("Yttric", "Violet", 0, [ new Item(todo, 1), ] );

		this._All =
		[
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
			this.Metallic,
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

		].addLookups("name");
	}
}
