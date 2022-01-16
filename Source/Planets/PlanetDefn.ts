
class PlanetDefn
{
	name: string;
	visualStarsystem: VisualBase;
	visualVicinity: VisualBase;
	visualOrbit: VisualBase;
	visualsSurface: VisualBase[];
	canLand: boolean;
	lifeChance: number;
	resourceDistributions: ResourceDistribution[]

	constructor
	(
		name: string,
		visualsStarsystemVicinityOrbit: VisualBase[],
		visualsSurface: VisualBase[],
		canLand: boolean,
		lifeChance: number,
		resourceDistributions: ResourceDistribution[]
	)
	{
		this.name = name;
		this.visualStarsystem = visualsStarsystemVicinityOrbit[0];
		this.visualVicinity = visualsStarsystemVicinityOrbit[1];
		this.visualOrbit = visualsStarsystemVicinityOrbit[2];
		this.visualsSurface = visualsSurface;
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
		var colorBlack = Color.byName("Black");
		var colorRed = Color.byName("Red");
		var colorOrange = Color.byName("Orange");
		var colorYellow = Color.byName("Yellow");
		var colorGreen = Color.byName("Green");
		var colorCyan = Color.byName("Cyan");
		var colorBlue = Color.byName("Blue");
		var colorViolet = Color.byName("Violet");
		var colorGray = Color.byName("Gray");
		var colorWhite = Color.byName("White");

		var colorToGlobe = (radius: number, color: Color) =>
			new VisualGroup
			([
				VisualCircle.fromRadiusAndColorFill
				(
					radius, colorGray
				),
				new VisualCircleGradient
				(
					radius,
					new ValueBreakGroup
					(
						[
							new ValueBreak(0, color),
							new ValueBreak(1, colorBlack)
						],
						null // interpolationMode
					),
					null, // colorBorder
				)
			]);

		var radiusStarsystem = 5;
		var visualStarsystemRed = 		colorToGlobe(radiusStarsystem, colorRed);
		var visualStarsystemOrange = 	colorToGlobe(radiusStarsystem, colorOrange);
		var visualStarsystemYellow = 	colorToGlobe(radiusStarsystem, colorYellow);
		var visualStarsystemGreen = 	colorToGlobe(radiusStarsystem, colorGreen);
		var visualStarsystemCyan = 		colorToGlobe(radiusStarsystem, colorCyan);
		var visualStarsystemBlue = 		colorToGlobe(radiusStarsystem, colorBlue);
		var visualStarsystemViolet = 	colorToGlobe(radiusStarsystem, colorViolet);
		var visualStarsystemGray = 		colorToGlobe(radiusStarsystem, colorGray);
		var visualStarsystemWhite = 	colorToGlobe(radiusStarsystem, colorWhite);

		var radiusVicinity = 10;
		var visualVicinityRed = 	colorToGlobe(radiusVicinity, colorRed);
		var visualVicinityOrange = 	colorToGlobe(radiusVicinity, colorOrange);
		var visualVicinityYellow = 	colorToGlobe(radiusVicinity, colorYellow);
		var visualVicinityGreen = 	colorToGlobe(radiusVicinity, colorGreen);
		var visualVicinityCyan = 	colorToGlobe(radiusVicinity, colorCyan);
		var visualVicinityBlue = 	colorToGlobe(radiusVicinity, colorBlue);
		var visualVicinityViolet = 	colorToGlobe(radiusVicinity, colorViolet);
		var visualVicinityGray = 	colorToGlobe(radiusVicinity, colorGray);
		var visualVicinityWhite = 	colorToGlobe(radiusVicinity, colorWhite);

		var radiusOrbit = 50;
		var visualOrbitRed = 	colorToGlobe(radiusOrbit, colorRed);
		var visualOrbitOrange = colorToGlobe(radiusOrbit, colorOrange);
		var visualOrbitYellow = colorToGlobe(radiusOrbit, colorYellow);
		var visualOrbitGreen = 	colorToGlobe(radiusOrbit, colorGreen);
		var visualOrbitCyan = 	colorToGlobe(radiusOrbit, colorCyan);
		var visualOrbitBlue = 	colorToGlobe(radiusOrbit, colorBlue);
		var visualOrbitViolet = colorToGlobe(radiusOrbit, colorViolet);
		var visualOrbitGray = 	colorToGlobe(radiusOrbit, colorGray);
		var visualOrbitWhite = 	colorToGlobe(radiusOrbit, colorWhite);

		var visualsRed = [ visualStarsystemRed, visualVicinityRed, visualOrbitRed ];
		var visualsOrange = [ visualStarsystemOrange, visualVicinityOrange, visualOrbitOrange ];
		var visualsYellow = [ visualStarsystemYellow, visualVicinityYellow, visualOrbitYellow ];
		var visualsGreen = [ visualStarsystemGreen, visualVicinityGreen, visualOrbitGreen ];
		var visualsCyan = [ visualStarsystemCyan, visualVicinityCyan, visualOrbitCyan ];
		var visualsBlue = [ visualStarsystemBlue, visualVicinityBlue, visualOrbitBlue ];
		var visualsViolet = [ visualStarsystemViolet, visualVicinityViolet, visualOrbitViolet ];
		var visualsGray = [ visualStarsystemGray, visualVicinityGray, visualOrbitGray ];
		var visualsWhite = [ visualStarsystemWhite, visualVicinityWhite, visualOrbitWhite ];

		var visualsRainbow = visualsYellow; // todo

		var visualVicinityShielded = new VisualGroup
		([
			new VisualCircleGradient
			(
				radiusVicinity,
				new ValueBreakGroup
				(
					[
						new ValueBreak(0, colorRed),
						new ValueBreak(1, colorBlack)
					],
					null // interpolationMode
				),
				colorRed
			),
			new VisualCircle
			(
				radiusVicinity * 1.1, null, colorRed, null
			)
		]);

		var visualOrbitShielded = visualOrbitRed;
		var visualsShielded = [ visualStarsystemRed, visualVicinityShielded, visualOrbitShielded ];

		var visualsSurface = [ new VisualNone() ]; // todo

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
		this.Rainbow 	= new pd("Rainbow", 	visualsRainbow,		visualsSurface, canLand, 	0, [ rd(ex, 6, huge), ] );
		this.Shielded 	= new pd("Shielded", 	visualsShielded, 	visualsSurface, cannotLand, 0, [ ] );

		// Ordinary worlds.
		this.Acid 		= new pd("Acid", 		visualsGreen, 	visualsSurface, canLand, .108, [ rd(ce, 6, heavy) ] );
		this.Alkali 	= new pd("Alkali", 		visualsGreen, 	visualsSurface, canLand, .234, [ rd(bm, 3, medium) ] );
		this.Auric 		= new pd("Auric", 		visualsYellow, 	visualsSurface, canLand, .358, [ rd(pm, 3, huge) ] );
		this.Azure 		= new pd("Azure", 		visualsBlue, 	visualsSurface, canLand, .270, [ rd(bm, 3, light) ] );
		this.Carbide 	= new pd("Carbide", 	visualsRed, 	visualsSurface, canLand, .063, [ rd(ce, 3, heavy) ] );
		this.Chlorine 	= new pd("Chlorine", 	visualsGreen, 	visualsSurface, canLand, .03, [ rd(bm, 2, light), rd(co, 2, heavy), rd(ce, 2, heavy) ] );
		this.Chondrite 	= new pd("Chondrite", 	visualsViolet, 	visualsSurface, canLand, .02, [ rd(ce, 2, heavy) ] );
		this.Cimmerian 	= new pd("Cimmerian", 	visualsRed, 	visualsSurface, canLand, .01, [ rd(ce, 4, medium) ] );
		this.Copper 	= new pd("Copper", 		visualsGreen, 	visualsSurface, canLand, .22, [ rd(bm, 2, huge) ] );
		this.Crimson 	= new pd("Crimson", 	visualsRed, 	visualsSurface, canLand, .20, [ rd(bm, 5, light) ] );

		this.Cyanic 	= new pd("Cyanic", 		visualsBlue, 	visualsSurface, canLand, 0, [ rd(ce, 1, medium) ] );
		this.Dust 		= new pd("Dust", 		visualsOrange, 	visualsSurface, canLand, 0, [ rd(ce, 1, medium) ] );
		this.Emerald 	= new pd("Emerald", 	visualsGreen, 	visualsSurface, canLand, 0, [ rd(ex, 1, medium) ] );
		this.Fluorescent = new pd("Fluorescent", visualsViolet, visualsSurface, canLand, 0, [ rd(ng, 1, medium) ] );
		this.GasGiant 	= new pd("GasGiant", 	visualsGreen, 	visualsSurface, canLand, 0, [] );
		this.Green 		= new pd("Green", 		visualsGreen, 	visualsSurface, canLand, 0, [ rd(re, 1, medium) ] );
		this.Halide 	= new pd("Halide", 		visualsGreen, 	visualsSurface, canLand, 0, [ rd(co, 1, medium) ] );
		this.Hydrocarbon = new pd("Hydrocarbon", visualsWhite, 	visualsSurface, canLand, 0, [ rd(ce, 1, medium), rd(bm, 1, medium) ] );
		this.Infrared 	= new pd("Infrared", 	visualsRed, 	visualsSurface, canLand, 0, [ rd(bm, 1, medium) ] );
		this.Iodine 	= new pd("Iodine", 		visualsGreen, 	visualsSurface, canLand, 0, [ rd(co, 1, medium) ] );
		this.Lanthanide = new pd("Lanthanide", 	visualsYellow, 	visualsSurface, canLand, 0, [ rd(re, 1, medium) ] );
		this.Magma 		= new pd("Magma", 		visualsRed, 	visualsSurface, canLand, 0, [ rd(bm, 1, medium) ] );
		this.Magnetic 	= new pd("Magnetic", 	visualsGreen, 	visualsSurface, canLand, 0, [ rd(bm, 1, medium), rd(ex, 1, medium) ] );
		this.Maroon 	= new pd("Maroon", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium), ] );
		this.Metal 		= new pd("Metal", 		visualsOrange, 	visualsSurface, canLand, 0, [ rd(pm, 3, medium), rd(ra, 3, medium)] );
		this.Noble 		= new pd("Noble", 		visualsBlue, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Oolite 	= new pd("Oolite", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Opalescent = new pd("Opalescent", 	visualsCyan, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );

		this.Organic 	= new pd("Organic", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Pellucid 	= new pd("Pellucid", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Plutonic 	= new pd("Plutonic", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Primordial = new pd("Primordial", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Purple  	= new pd("Purple", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.QuasiDegenerate = new pd("Quasi-Degenerate", visualsViolet, visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Radioactive = new pd("Radioactive", visualsViolet, visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );

		this.Redux 		= new pd("Redux", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Ruby 		= new pd("Ruby", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Sapphire 	= new pd("Sapphire", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Selenic 	= new pd("Selenic", 	visualsGray, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Shattered 	= new pd("Shattered", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.SuperDense = new pd("Super-Dense", visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Telluric 	= new pd("Telluric", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Treasure 	= new pd("Treasure", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Ultramarine = new pd("Ultramarine", visualsViolet, visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Ultraviolet = new pd("Ultraviolet", visualsViolet, visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Urea 		= new pd("Urea", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Vinylogous = new pd("Vinylogous", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Water 		= new pd("Water", 		visualsCyan, 	visualsSurface, canLand, .9, [ rd(todo, 1, medium) ] );
		this.Xenolithic = new pd("Xenolithic", 	visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );
		this.Yttric 	= new pd("Yttric", 		visualsViolet, 	visualsSurface, canLand, 0, [ rd(todo, 1, medium) ] );

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
