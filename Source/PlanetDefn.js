
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

		var ce = "CommonElements";
		var co = "Corrosives";
		var bm = "BaseMetals";
		var ng = "NobleGases";
		var pm = "PreciousMetals";
		var re = "RareEarths";
		var ra = "Radioactives";
		var ex = "Exotics";
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

		// Special worlds.
		this.Rainbow 	= new PlanetDefn("Rainbow", colorViolet, 0, [ rd(ex, 6, huge), ] );
		this.Shielded 	= new PlanetDefn("Shielded", colorRed, 1, cannotLand, [ ] );

		// Ordinary worlds.
		this.Acid 		= new PlanetDefn("Acid", 		colorGreen, 	canLand, .108, [ rd(ce, 6, heavy) ] );
		this.Alkali 	= new PlanetDefn("Alkali", 		colorGreen, 	canLand, .234, [ rd(bm, 3, medium) ] );
		this.Auric 		= new PlanetDefn("Auric", 		colorYellow, 	canLand, .358, [ rd(pm, 3, huge) ] );
		this.Azure 		= new PlanetDefn("Azure", 		colorBlue, 		canLand, .270, [ rd(bm, 3, light) ] );
		this.Carbide 	= new PlanetDefn("Carbide", 	colorRed, 		canLand, .063, [ rd(ce, 3, heavy) ] );
		this.Chlorine 	= new PlanetDefn("Chlorine", 	colorGreen, 	canLand, .03, [ rd(bm, 2, light), rd(co, 2, heavy), rd(ce, 2, heavy) ] );
		this.Chondrite 	= new PlanetDefn("Chondrite", 	colorViolet, 	canLand, .02, [ rd(ce, 2, heavy) ] );
		this.Cimmerian 	= new PlanetDefn("Cimmerian", 	colorRed, 		canLand, .01, [ rd(ce, 4, medium) ] );
		this.Copper 	= new PlanetDefn("Copper", 		colorGreen, 	canLand, .22, [ rd(bm, 2, huge) ] );
		this.Crimson 	= new PlanetDefn("Crimson", 	colorRed, 		canLand, .20, [ rd(bm, 5, light) ] );

		this.Cyanic 	= new PlanetDefn("Cyanic", 		colorBlue, 		canLand, 0, [ rd(ce, 1, medium) ] );
		this.Dust 		= new PlanetDefn("Dust", 		colorOrange, 	canLand, 0, [ rd(ce, 1, medium) ] );
		this.Emerald 	= new PlanetDefn("Emerald", 	colorGreen, 	canLand, 0, [ rd(ex, 1, medium) ] );
		this.Fluorescent = new PlanetDefn("Fluorescent", colorViolet, 	canLand, 0, [ rd(ng, 1, medium) ] );
		this.GasGiant 	= new PlanetDefn("GasGiant", 	colorGreen, 	canLand, 0, [] );
		this.Green 		= new PlanetDefn("Green", 		colorGreen, 	canLand, 0, [ rd(re, 1, medium) ] );
		this.Halide 	= new PlanetDefn("Halide", 		colorGreen, 	canLand, 0, [ rd(co, 1, medium) ] );
		this.Hydrocarbon = new PlanetDefn("Hydrocarbon", colorWhite, 	canLand, 0, [ rd(ce, 1, medium), rd(bm, 1, medium) ] );
		this.Infrared 	= new PlanetDefn("Infrared", 	colorRed, 		canLand, 0, [ rd(bm, 1, medium) ] );
		this.Iodine 	= new PlanetDefn("Iodine", 		colorGreen, 	canLand, 0, [ rd(co, 1, medium) ] );
		this.Lanthanide = new PlanetDefn("Lanthanide", 	colorYellow, 	canLand, 0, [ rd(re, 1, medium) ] );
		this.Magma 		= new PlanetDefn("Magma", 		colorRed, 		canLand, 0, [ rd(bm, 1, medium) ] );
		this.Magnetic 	= new PlanetDefn("Magnetic", 	colorGreen, 	canLand, 0, [ rd(bm, 1, medium), rd(ex, 1, medium) ] );
		this.Maroon 	= new PlanetDefn("Maroon", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Metallic 	= new PlanetDefn("Metallic", 	colorOrange, 	canLand, 0, [ rd(pm, 3, medium), rd(ra, 3, medium)] );
		this.Noble 		= new PlanetDefn("Noble", 		colorBlue, 		canLand, 0, [ rd(todo, 1, medium), ] );
		this.Oolite 	= new PlanetDefn("Oolite", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Opalescent = new PlanetDefn("Opalescent", 	colorCyan, 		canLand, 0, [ rd(todo, 1, medium), ] );

		this.Organic 	= new PlanetDefn("Organic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Pellucid 	= new PlanetDefn("Pellucid", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Plutonic 	= new PlanetDefn("Plutonic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Primordial = new PlanetDefn("Primordial", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Purple  	= new PlanetDefn("Purple", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.QuasiDegenerate = new PlanetDefn("QuasiDegenerate", colorViolet, canLand, 0, [ rd(todo, 1, medium), ] );
		this.Radioactive = new PlanetDefn("Radioactive", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );

		this.Redux 		= new PlanetDefn("Redux", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ruby 		= new PlanetDefn("Ruby", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Sapphire 	= new PlanetDefn("Sapphire", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Selenic 	= new PlanetDefn("Selenic", 	colorGray, 		canLand, 0, [ rd(todo, 1, medium), ] );
		this.Shattered 	= new PlanetDefn("Shattered", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.SuperDense = new PlanetDefn("SuperDense", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Telluric 	= new PlanetDefn("Telluric", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Treasure 	= new PlanetDefn("Treasure", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ultramarine = new PlanetDefn("Ultramarine", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ultraviolet = new PlanetDefn("Ultraviolet", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Urea 		= new PlanetDefn("Urea", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Vinylogous = new PlanetDefn("Vinylogous", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Water 		= new PlanetDefn("Water", 		colorCyan, 		canLand, .9, [ rd(todo, 1, medium), ] );
		this.Xenolithic = new PlanetDefn("Xenolithic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Yttric 	= new PlanetDefn("Yttric", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );

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
