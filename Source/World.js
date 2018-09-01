function World(name, dateCreated, defns, playerShipGroup, hyperspace)
{
	this.name = name;
	this.dateCreated = dateCreated;

	this.timerTicksSoFar = 0;

	this.defns = defns;

	this.playerShipGroup = playerShipGroup;
	this.hyperspace = hyperspace;

	var starsystems = hyperspace.starsystems;
	var starsystemFinal = starsystems[starsystems.length - 1];
	this.place = new PlaceStarsystem
	(
		this, starsystemFinal, new Coords(.5, .9).multiply(starsystemFinal.sizeInner)
	);
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
			ConstraintDefn.Instances.FrictionDry,
			ConstraintDefn.Instances.SpeedMax,
			ConstraintDefn.Instances.StopBelowSpeedMin,
			ConstraintDefn.Instances.TrimToRange,
			ConstraintDefn.Instances.WrapToRange
		];

		var shipDefns = ShipDefn.Instances();

		var defns = new Defns(constraintDefns, shipDefns);

		var playerShipDefnName = "Default";
		var playerShip = new Ship(playerShipDefnName);
		var playerShipGroup = new ShipGroup
		(
			"Player",
			10, // fuel
			.1, // fuelPerTick
			[ playerShip ]
		);

		/*
		var hyperspace = Hyperspace.random
		(
			new Coords(1024, 1024), // size
			64, //numberOfStarsystems
			10, // starsystemRadiusOuter
			new Coords(400, 300), // starsystemSizeInner
		);
		*/

		var hyperspaceMapAsTextString = 
			universe.mediaLibrary.textStringGetByName("HyperspaceMap");

		var hyperspace = Hyperspace.fromFileContentsAsString
		(
			new Coords(10000, 10000), // size
			10, // starsystemRadiusOuter
			new Coords(400, 300), // starsystemSizeInner
			hyperspaceMapAsTextString.value
		);

		var returnValue = new World
		(
			"World-" + nowAsString,
			now, // dateCreated
			defns,
			playerShipGroup,
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
