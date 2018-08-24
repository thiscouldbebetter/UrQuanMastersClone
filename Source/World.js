// This class, as implemented, is only a demonstration.
// Its code is expected to be modified heavily in actual applications,
// including the constructor, the draw() and update() methods,
// and the World.new() method.

function World(name, dateCreated, defns, hyperspace)
{
	this.name = name;
	this.dateCreated = dateCreated;

	this.timerTicksSoFar = 0;

	this.defns = defns;

	this.hyperspace = hyperspace;

	var starsystem0 = hyperspace.starsystems[0];
	this.place = new PlaceStarsystem(starsystem0);
	this.place.entitiesSpawn();

}

{
	// static methods

	World.new = function(universe)
	{
		var now = DateTime.now();
		var nowAsString = now.toStringMMDD_HHMM_SS();

		var constraintDefns =
		[
			ConstraintDefn.Instances.Friction,
			ConstraintDefn.Instances.SpeedMax,
			ConstraintDefn.Instances.TrimToRange,
			ConstraintDefn.Instances.WrapToRange
		];

		var defns = new Defns(constraintDefns);

		var hyperspace = Hyperspace.random
		(
			new Coords(1024, 1024), // size 
			64, //numberOfStarsystems
			new Coords(400, 300), // starsystemSize 
		);

		var returnValue = new World
		(
			"World-" + nowAsString,
			now, // dateCreated
			defns,
			hyperspace
		);
		return returnValue;
	}

	// instance methods

	World.prototype.draw = function(universe)
	{
		this.place.draw(universe, this);
	}

	World.prototype.initialize = function(universe)
	{
		this.place.initialize(universe, this);
	}

	World.prototype.updateForTimerTick = function(universe)
	{
		if (this.placeNext != null)
		{
			this.place.finalize(universe, this);
			this.place = this.placeNext;
			this.place.initialize(universe, this);
			this.placeNext = null;
		}

		this.place.updateForTimerTick(universe, this);
		this.timerTicksSoFar++;
	}
}
