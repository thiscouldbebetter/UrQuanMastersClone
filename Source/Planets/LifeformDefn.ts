
class LifeformDefn
{
	name: string;
	nameOriginal: string;
	code: string;
	durability: number;
	awareness: number;
	speed: number;
	damagePerAttack: number;
	value: number;
	visual: Visual;
	activityDefnName: string;

	constructor
	(
		name: string,
		nameOriginal: string,
		code: string,
		durability: number,
		awareness: number,
		speed: number,
		damagePerAttack: number,
		value: number,
		visual: Visual,
		activityDefnName: string
	)
	{
		this.name = name;
		this.nameOriginal = nameOriginal;
		this.code = code;
		this.durability = durability;
		this.awareness = awareness;
		this.speed = speed;
		this.damagePerAttack = damagePerAttack;
		this.value = value;
		this.visual = visual;
		this.activityDefnName = activityDefnName;
	}

	// static methods

	static _instances: LifeformDefn_Instances;
	static Instances(): LifeformDefn_Instances
	{
		if (LifeformDefn._instances == null)
		{
			LifeformDefn._instances = new LifeformDefn_Instances();
		}

		return LifeformDefn._instances;
	}

	static byCode(code: string): LifeformDefn
	{
		return LifeformDefn.Instances().byCode(code);
	}
}

class LifeformDefn_Instances
{
	_All: LifeformDefn[];
	_AllByCode: Map<string, LifeformDefn>;

	constructor()
	{
		var ld = LifeformDefn;

		var adAvoid = Lifeform.activityDefnAvoidPlayer().name;
		var adNone = Lifeform.activityDefnDoNothing().name;
		var adPursue = Lifeform.activityDefnApproachPlayer().name;
		var adWander = Lifeform.activityDefnMoveToRandomPosition().name;

		var v = (imageName: string) => new VisualImageFromLibrary(imageName);

		// Adapted from, among other sources,
		// https://wiki.starcontrol.com/index.php?title=Table_of_bio_types

		this._All =
		[

				 // name,				nameOriginal,			code, hp,aw,sp,dm,val
			new ld("[none]", 			"[none]", 				"__", 0, 0, 0, 0, 0, new VisualNone(), 	adNone),
			new ld("[error]", 			"[error]", 				"XX", 0, 0, 0, 0, 1, new VisualNone(), 	adNone),

			new ld("RadarBlossom", 		"Roto-Dendron", 		"RD", 1, 0, 0, 0, 1, v("RadarBlossom"), 	adNone),
			new ld("LavaPool", 			"Macrocilia", 			"MC", 1, 0, 0, 0, 6, v("LavaPool"), 		adNone),
			new ld("SquirtPod", 		"Splort Wort", 			"SW", 1, 0, 0, 1, 3, v("SquirtPod"), 		adNone),
			new ld("ClapperBush", 		"Whackin' Bush", 		"WB", 3, 0, 0, 2, 5, v("ClapperBush"), 		adNone),
			new ld("CarouselTree", 		"Slot Machine Tree", 	"SM", 10, 0, 0, 0, 2, v("CarouselTree"), 	adNone),
			new ld("BlueTube", 			"Neon Worm", 			"NW", 2, 0, 1, 0, 1, v("BlueTube"), 		adWander),
			new ld("BrassNeedler", 		"Stiletto Urchin", 		"SU", 5, 2, 1, 0, 8, v("BrassNeedler"), 	adPursue),
			new ld("CreepingBean", 		"Deluxe Blob", 			"DB", 2, 1, 1, 1, 2, v("CreepingBean"), 	adPursue),
			new ld("LightningAnemone", 	"Glowing Medusa", 		"GM", 8, 0, 1, 2, 3, v("LightningAnemone"), adWander),
			new ld("Radiooculopod", 	"Carousel Beast", 		"CB", 15, 2, 1, 3, 10, v("Radiooculopod"), 	adWander),
			new ld("SwarmsOfThings", 	"Mysterious Bees", 		"MB", 3, 2, 2, 1, 3, v("SwarmsOfThings"), 	adPursue),
			new ld("ElasticSphere", 	"Hopping Blobby", 		"HB", 1, 2, 2, 0, 2, v("ElasticSphere"), 	adAvoid),
			new ld("TriopticSquid",		"Blood Monkey", 		"BM", 2, 0, 2, 1, 2, v("TriopticSquid"), 	adWander),
			new ld("LeapingLizard",		"Yompin Yiminy", 		"YY", 6, 3, 2, 2, 4, v("LeapingLizard"), 	adWander),
			new ld("BloodyBathmat", 	"Amorphous Trandicula", "AT", 12, 0, 2, 3, 9, v("BloodyBathmat"), 	adWander),
			new ld("BiteyMouse", 		"Crazy Weasel", 		"CW", 1, 3, 3, 1, 3, v("BiteyMouse"), 		adPursue),
			new ld("SmushedDuckling", 	"Merry Whumpet", 		"MW", 1, 3, 3, 0, 1, v("SmushedDuckling"), 	adAvoid),
			new ld("FungusAmungus", 	"Fungal Squid", 		"FS", 8, 1, 3, 2, 7, v("FungusAmungus"), 	adPursue),
			new ld("WaddleEye", 		"Penguin Cyclops", 		"PC", 2, 3, 3, 1, 15, v("WaddleEye"), 		adAvoid),
			new ld("SpuriousEaglet",	"Chicken", 				"CH", 1, 1, 3, 1, 1, v("SpuriousEaglet"), 	adAvoid),
			new ld("CottonCandycane", 	"Bubble Vine", 			"BV", 2, 0, 1, 1, 6, v("CottonCandycane"), 	adWander),
			new ld("BulgingEyeworm", 	"Bug-Eyed Bait", 		"BB", 2, 3, 1, 1, 4, v("BulgingEyeworm"), 	adAvoid),
			new ld("PopperUpper", 		"Goo Burger", 			"GB", 5, 0, 0, 1, 8, v("PopperUpper"), 		adNone),

			new ld("BioDecoy", 			"Brainbox Bulldozer", 	"BD", 1, 0, 0, 0, 0, v("BioDecoy"), 		adWander),
			new ld("MauluskaGourmand", 	"Evil One", 			"EO", 1, 0, 0, 3, 1, v("MauluskaGourmand"), adNone),
			new ld("FreakyBeast", 		"ZEX's Beauty", 		"ZB", 15, 3, 3, 3, 15, v("FreakyBeast"), 	adPursue),
		];
		
		this._AllByCode = new Map(this._All.map(x => [ x.code, x ] ) )
	}

	byCode(code: string): LifeformDefn
	{
		return this._AllByCode.get(code);
	}
}
