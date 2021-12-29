
class LifeformDefn
{
	name: string;
	durability: number;
	speed: number;
	damagePerAttack: number;
	value: number;
	visual: VisualBase;
	activityDefnName: string;

	constructor
	(
		name: string,
		durability: number,
		speed: number,
		damagePerAttack: number,
		value: number,
		visual: VisualBase,
		activityDefnName: string
	)
	{
		this.name = name;
		this.durability = durability;
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
}

class LifeformDefn_Instances
{
	_All: LifeformDefn[];

	constructor()
	{
		var ld = LifeformDefn;

		var activityDefnAvoid = Lifeform.activityDefnAvoidPlayer().name;
		var activityDefnNone = Lifeform.activityDefnDoNothing().name;
		var activityDefnPursue = Lifeform.activityDefnApproachPlayer().name;
		var activityDefnWander = Lifeform.activityDefnMoveToRandomPosition().name;

		var visual = (imageName: string) => new VisualImageFromLibrary(imageName);

		this._All =
		[
				   // name				hp,sp,dm,val
			new ld("RadarBlossom", 		1, 0, 0, 1, visual("RadarBlossom"), activityDefnNone),
			new ld("LavaPool", 			1, 0, 0, 6, visual("LavaPool"), activityDefnNone),
			new ld("SquirtPod", 		1, 0, 1, 3, visual("SquirtPod"), activityDefnNone),
			new ld("ClapperBush", 		3, 0, 2, 5, visual("ClapperBush"), activityDefnNone),
			new ld("CarouselTree", 		10, 0, 0, 1, visual("CarouselTree"), activityDefnNone),
			new ld("BlueTube", 			2, 1, 0, 1, visual("BlueTube"), activityDefnWander),
			new ld("BrassNeedler", 		5, 1, 0, 8, visual("BrassNeedler"), activityDefnPursue),
			new ld("CreepingBean", 		2, 1, 1, 2, visual("CreepingBean"), activityDefnPursue),
			new ld("LightningAnemone", 	8, 1, 2, 3, visual("LightningAnemone"), activityDefnWander),
			new ld("Radiooculopod", 	15, 1, 3, 10, visual("Radiooculopod"), activityDefnWander),
			new ld("SwarmsOfThings", 	3, 2, 1, 3, visual("SwarmsOfThings"), activityDefnPursue),
			new ld("ElasticSphere", 	1, 2, 0, 2, visual("ElasticSphere"), activityDefnAvoid),
			new ld("TriopticSquid",		2, 2, 1, 2, visual("TriopticSquid"), activityDefnWander),
			new ld("LeapingLizard",		6, 2, 2, 4, visual("LeapingLizard"), activityDefnWander),
			new ld("BloodyBathmat", 	12, 2, 3, 9, visual("BloodyBathmat"), activityDefnWander),
			new ld("BiteyMouse", 		1, 3, 1, 3, visual("BiteyMouse"), activityDefnPursue),
			new ld("SmushedDuckling", 	1, 3, 0, 1, visual("SmushedDuckling"), activityDefnAvoid),
			new ld("FungusAmungus", 	8, 3, 2, 7, visual("FungusAmungus"), activityDefnPursue),
			new ld("WaddleEye", 		2, 3, 1, 15, visual("WaddleEye"), activityDefnAvoid),
			new ld("SpuriousEaglet",	1, 3, 1, 1, visual("SpuriousEaglet"), activityDefnAvoid),
			new ld("CottonCandycane", 	2, 1, 1, 6, visual("CottonCandycane"), activityDefnWander),
			new ld("BulgingEyeworm", 	2, 1, 1, 4, visual("BulgingEyeworm"), activityDefnAvoid),
			new ld("PopperUpper", 		5, 0, 1, 8, visual("PopperUpper"), activityDefnNone),

			new ld("BioDecoy", 			1, 0, 0, 0, visual("BioDecoy"), activityDefnWander),
			new ld("MauluskaGourmand", 	1, 0, 3, 1, visual("MauluskaGourmand"), activityDefnNone),
			new ld("FreakyBeast", 		15, 3, 3, 15, visual("FreakyBeast"), activityDefnPursue),
		];
	}
}
