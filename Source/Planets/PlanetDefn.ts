
class PlanetDefn
{
	name: string;
	color: Color;
	canLand: boolean;
	lifeChance: number;
	resourceDistributions: ResourceDistribution[]

	constructor
	(
		name: string,
		color: Color,
		canLand: boolean,
		lifeChance: number,
		resourceDistributions: ResourceDistribution[]
	)
	{
		this.name = name;
		this.color = color;
		this.canLand = canLand;
		this.lifeChance = lifeChance;
		this.resourceDistributions = resourceDistributions;
	}

	// instances

	static _instances: PlanetDefn_Instances;
	static Instances(): PlanetDefn_Instances
	{
		if (PlanetDefn._instances == null)
		{
			PlanetDefn._instances = new PlanetDefn_Instances();
		}

		return PlanetDefn._instances;
	}

	// methods

	static byName(planetDefnName: string): PlanetDefn
	{
		return PlanetDefn.Instances()._AllByName.get(planetDefnName);
	}
}

class PlanetDefn_Instances
{
	Rainbow: PlanetDefn;
	Shielded: PlanetDefn;

	// Ordinary worlds.
	Acid: PlanetDefn;
	Alkali: PlanetDefn;
	Auric: PlanetDefn;
	Azure: PlanetDefn;
	Carbide: PlanetDefn;
	Chlorine: PlanetDefn;
	Chondrite: PlanetDefn;
	Cimmerian: PlanetDefn;
	Copper: PlanetDefn;
	Crimson: PlanetDefn;

	Cyanic: PlanetDefn;
	Dust: PlanetDefn;
	Emerald: PlanetDefn;
	Fluorescent: PlanetDefn;
	GasGiant: PlanetDefn;
	Green: PlanetDefn;
	Halide: PlanetDefn;
	Hydrocarbon: PlanetDefn;
	Infrared: PlanetDefn;
	Iodine: PlanetDefn;
	Lanthanide: PlanetDefn;
	Magma: PlanetDefn;
	Magnetic: PlanetDefn;
	Maroon: PlanetDefn;
	Metal: PlanetDefn;
	Noble: PlanetDefn;
	Oolite: PlanetDefn;
	Opalescent: PlanetDefn;

	Organic: PlanetDefn;
	Pellucid: PlanetDefn;
	Plutonic: PlanetDefn;
	Primordial: PlanetDefn;
	Purple: PlanetDefn;
	QuasiDegenerate: PlanetDefn;
	Radioactive: PlanetDefn;

	Redux: PlanetDefn;
	Ruby: PlanetDefn;
	Sapphire: PlanetDefn;
	Selenic: PlanetDefn;
	Shattered: PlanetDefn;
	SuperDense: PlanetDefn;
	Telluric: PlanetDefn;
	Treasure: PlanetDefn;
	Ultramarine: PlanetDefn;
	Ultraviolet: PlanetDefn;
	Urea: PlanetDefn;
	Vinylogous: PlanetDefn;
	Water: PlanetDefn;
	Xenolithic: PlanetDefn;
	Yttric: PlanetDefn;

	_All: PlanetDefn[];
	_AllByName: Map<string,PlanetDefn>;

	constructor()
	{
		var colorRed = Color.byName("Red");
		var colorOrange = Color.byName("Orange");
		var colorYellow = Color.byName("Yellow");
		var colorGreen = Color.byName("Green");
		var colorCyan = Color.byName("Cyan");
		var colorBlue = Color.byName("Blue");
		var colorViolet = Color.byName("Violet");
		var colorGray = Color.byName("Gray");
		var colorWhite = Color.byName("White");

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
		var rd = (resourceDefnName: string, numberOfDeposits: number, quantityPerDeposit: number) =>
		{
			return new ResourceDistribution
			(
				resourceDefnName, numberOfDeposits, quantityPerDeposit
			);
		}

		var pd = PlanetDefn;

		// Special worlds.
		this.Rainbow 	= new pd("Rainbow", 	colorViolet, 	canLand, 	0, [ rd(ex, 6, huge), ] );
		this.Shielded 	= new pd("Shielded", 	colorRed, 		cannotLand, 0, [ ] );

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
		this.Metal 		= new pd("Metal", 		colorOrange, 	canLand, 0, [ rd(pm, 3, medium), rd(ra, 3, medium)] );
		this.Noble 		= new pd("Noble", 		colorBlue, 		canLand, 0, [ rd(todo, 1, medium), ] );
		this.Oolite 	= new pd("Oolite", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Opalescent = new pd("Opalescent", 	colorCyan, 		canLand, 0, [ rd(todo, 1, medium), ] );

		this.Organic 	= new pd("Organic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Pellucid 	= new pd("Pellucid", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Plutonic 	= new pd("Plutonic", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Primordial = new pd("Primordial", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Purple  	= new pd("Purple", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.QuasiDegenerate = new pd("Quasi-Degenerate", colorViolet, canLand, 0, [ rd(todo, 1, medium), ] );
		this.Radioactive = new pd("Radioactive", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );

		this.Redux 		= new pd("Redux", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Ruby 		= new pd("Ruby", 		colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Sapphire 	= new pd("Sapphire", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.Selenic 	= new pd("Selenic", 	colorGray, 		canLand, 0, [ rd(todo, 1, medium), ] );
		this.Shattered 	= new pd("Shattered", 	colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
		this.SuperDense = new pd("Super-Dense", colorViolet, 	canLand, 0, [ rd(todo, 1, medium), ] );
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
