
function PlanetDefn(name, color, canLand, lifeChance, resourceDistributions)
{
	this.name = name;
	this.color = color;
	this.canLand = canLand;
	this.lifeChance = lifeChance;
	this.resourceDistributions = resourceDistributions;
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
		var colorRed = "Red";
		var colorOrange = "Orange";
		var colorYellow = "Yellow";
		var colorGreen = "Green";
		var colorCyan = "Cyan";
		var colorBlue = "Blue"
		var colorViolet = "Violet";
		var colorGray = "Gray";
		var colorWhite = "White";

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
		var rd = function(resourceDefnName, numberOfDeposits, quantityPerDeposit)
		{
			return new ResourceDistribution
			(
				resourceDefnName, numberOfDeposits, quantityPerDeposit
			);
		}

		var pd = PlanetDefn;

		// Special worlds.
		this.Rainbow 	= new pd("Rainbow", colorViolet, 0, [ rd(ex, 6, huge), ] );
		this.Shielded 	= new pd("Shielded", colorRed, 1, cannotLand, [ ] );

		// Ordinary worlds.
		this.Acid 		= new pd("Acid", 		colorGreen, 	canLand, .108, [ rd(ce, 6, heavy) ] );
		this.Alkali 	= new pd("Alkali", 		colorGreen, 	canLand, .234, [ rd(bm, 3, medium) ] );
		this.Auric 		= new pd("Auric", 		colorYellow, 	canLand, .358, [ rd(pm, 3, huge) ] );
		this.Azure 		= new pd("Azure", 		colorBlue, 		canLand, .270, [ rd(bm, 3, light) ] );
		this.Carbide 	= new pd("Carbide", 	colorRed, 		canLand, .063, [ rd(ce, 3, heavy) ] );
		this.Chlorine 	= new pd("Chlorine", 	colorGreen, 	canLand, .03, [ rd(bm, 2, light), rd(co, 2, heavy), rd(ce, 2, heavy) ] );
		this.Chondrite 	= new pd("Chondrite", 	colorViolet, 	canLand, .02, [ rd(ce, 2, heavy) ] );
		this.Cimmerian 	= new pd("Cimmerian", 	colorRed, 		canLand, .01, [ rd(ce, 4, medium) ] );
		this.Copper 	= new pd("Copper", 		colorGreen, 	canLand, .22, [ rd(bm, 2, huge) ] );
		this.Crimson 	= new pd("Crimson", 	colorRed, 		canLand, .20, [ rd(bm, 5, light) ] );

		this.Cyanic 	= new pd("Cyanic", 		colorBlue, 		canLand, 0, [ rd(ce, 1, medium) ] );
		this.Dust 		= new pd("Dust", 		colorOrange, 	canLand, 0, [ rd(ce, 1, medium) ] );
		this.Emerald 	= new pd("Emerald", 	colorGreen, 	canLand, 0, [ rd(ex, 1, medium) ] );
		this.Fluorescent = new pd("Fluorescent", colorViolet, 	canLand, 0, [ rd(ng, 1, medium) ] );
		this.GasGiant 	= new pd("GasGiant", 	colorGreen, 	canLand, 0, [] );
		this.Green 		= new pd("Green", 		colorGreen, 	canLand, 0, [ rd(re, 1, medium) ] );
		this.Halide 	= new pd("Halide", 		colorGreen, 	canLand, 0, [ rd(co, 1, medium) ] );
		this.Hydrocarbon = new pd("Hydrocarbon", colorWhite, 	canLand, 0, [ rd(ce, 1, medium), rd(bm, 1, medium) ] );
		this.Infrared 	= new pd("Infrared", 	colorRed, 		canLand, 0, [ rd(bm, 1, medium) ] );
		this.Iodine 	= new pd("Iodine", 		colorGreen, 	canLand, 0, [ rd(co, 1, medium) ] );
		this.Lanthanide = new pd("Lanthanide", 	colorYellow, 	canLand, 0, [ rd(re, 1, medium) ] );
		this.Magma 		= new pd("Magma", 		colorRed, 		canLand, 0, [ rd(bm, 1, medium) ] );
		this.Magnetic 	= new pd("Magnetic", 	colorGreen, 	canLand, 0, [ rd(bm, 1, medium), rd(ex, 1, medium) ] );
		this.Maroon 	= new pd("Maroon", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Metallic 	= new pd("Metallic", 	colorOrange, 	canLand, 0, [ rd(pm, 3, medium), rd(ra, 3, medium)] );
		this.Noble 		= new pd("Noble", 		colorBlue, 		canLand, 0, [ rd(todo, 1, medium), ] );
		this.Oolite 	= new pd("Oolite", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Opalescent = new pd("Opalescent", 	colorCyan, 		canLand, 0, [ rd(todo, 1, medium), ] );

		this.Organic 	= new pd("Organic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Pellucid 	= new pd("Pellucid", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Plutonic 	= new pd("Plutonic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Primordial = new pd("Primordial", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Purple  	= new pd("Purple", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.QuasiDegenerate = new pd("QuasiDegenerate", colorViolet, canLand, 0, [ rd(todo, 1, medium), ] );
		this.Radioactive = new pd("Radioactive", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );

		this.Redux 		= new pd("Redux", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ruby 		= new pd("Ruby", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Sapphire 	= new pd("Sapphire", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Selenic 	= new pd("Selenic", 	colorGray, 		canLand, 0, [ rd(todo, 1, medium), ] );
		this.Shattered 	= new pd("Shattered", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.SuperDense = new pd("SuperDense", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Telluric 	= new pd("Telluric", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Treasure 	= new pd("Treasure", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ultramarine = new pd("Ultramarine", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ultraviolet = new pd("Ultraviolet", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Urea 		= new pd("Urea", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Vinylogous = new pd("Vinylogous", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Water 		= new pd("Water", 		colorCyan, 		canLand, .9, [ rd(todo, 1, medium), ] );
		this.Xenolithic = new pd("Xenolithic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Yttric 	= new pd("Yttric", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );

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
