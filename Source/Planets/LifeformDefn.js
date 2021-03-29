
class LifeformDefn
{
	constructor
	(
		name,
		durability,
		speed,
		damagePerAttack,
		value,
		visual,
		activity
	)
	{
		this.name = name;
		this.durability = durability;
		this.speed = speed;
		this.damagePerAttack = damagePerAttack;
		this.value = value;
		this.visual = visual;
		this.activity = activity;
	}

	// static methods

	static _instances;
	static Instances()
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
	constructor()
	{
		var lifeformDimension = 10;

		var ld = LifeformDefn;
		var visual = (colorFill, colorBorder) =>
		{
			return new VisualRectangle
			(
				new Coords(1, 1).multiplyScalar(lifeformDimension),
				colorFill, colorBorder
			);
		}
		var r = Color.byName("Red");
		var o = Color.byName("Orange");
		var y = Color.byName("Yellow");
		var g = Color.byName("Green");
		var b = Color.byName("Blue");
		var v = Color.byName("Violet");
		var a = Color.byName("Gray");
		var w = Color.byName("White");
		var k = Color.byName("Black");
		var n = Color.byName("Brown");
		var c = Color.byName("Cyan");
		var p = Color.byName("Pink");

		var lifeformActivityTodo = (universe, world, place, actor) =>
		{
			var actorLoc = actor.locatable().loc;
			actorLoc.vel.randomize().double().subtract(Coords.Instances().Ones).clearZ();
		}

		var activityAvoid = lifeformActivityTodo;
		var activityNone = lifeformActivityTodo;
		var activityPursue = lifeformActivityTodo;
		var activityWander = lifeformActivityTodo;

		this._All =
		[
				   // name				hp,sp,dm,val
			new ld("RadarBlossom", 		1, 0, 0, 1, visual(r, g), activityNone),
			new ld("LavaPool", 			1, 0, 0, 6, visual(r, p), activityNone),
			new ld("SquirtPod", 		1, 0, 1, 3, visual(g, r), activityNone),
			new ld("ClapperBush", 		3, 0, 2, 5, visual(n, g), activityNone),
			new ld("CarouselTree", 		10, 0, 0, 1, visual(y, g), activityNone),
			new ld("BlueTube", 			2, 1, 0, 1, visual(b, c), activityWander),
			new ld("BrassNeedler", 		5, 1, 0, 8, visual(y, w), activityPursue),
			new ld("CreepingBean", 		2, 1, 1, 2, visual(w, v), activityPursue),
			new ld("LightningAnemone", 	8, 1, 2, 3, visual(b, w), activityWander),
			new ld("Radiooculopod", 	15, 1, 3, 10, visual(b, w), activityWander),
			new ld("SwarmsOfThings", 	3, 2, 1, 3, visual(k, y), activityPursue),
			new ld("ElasticSphere", 	1, 2, 0, 2, visual(g, g), activityAvoid),
			new ld("TriopticSquid",		2, 2, 1, 2, visual(r, w), activityWander),
			new ld("LeapingLizard",		6, 2, 2, 4, visual(r, w), activityWander),
			new ld("BloodyBathmat", 	12, 2, 3, 9, visual(r, w), activityWander),
			new ld("BiteyMouse", 		1, 3, 1, 3, visual(n, p), activityPursue),
			new ld("SmushedDuckling", 	1, 3, 0, 1, visual(r, g), activityAvoid),
			new ld("FungusAmungus", 	8, 3, 2, 7, visual(b, v), activityPursue),
			new ld("WaddleEye", 		2, 3, 1, 15, visual(g, w), activityAvoid),
			new ld("SpuriousEaglet",	1, 3, 1, 1, visual(w, r), activityAvoid),
			new ld("CottonyCandycane", 	2, 1, 1, 6, visual(r, w), activityWander),
			new ld("BulgingEyeworm", 	2, 1, 1, 4, visual(p, v), activityAvoid),
			new ld("PopperUpper", 		5, 0, 1, 8, visual(w, v), activityNone),

			new ld("BioDecoy", 			1, 0, 0, 0, visual(w, v), activityWander),
			new ld("MauluskaGourmand", 	1, 0, 3, 1, visual(n, w), activityNone),
			new ld("FreakyBeast", 		15, 3, 3, 15, visual(n, p), activityPursue),
		];

		return this._All;//.addLookupsByName();
	}
}
