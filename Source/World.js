function World(name, dateCreated, defns, player, hyperspace)
{
	this.name = name;
	this.dateCreated = dateCreated;

	this.timerTicksSoFar = 0;

	this.defns = defns;

	this.player = player;
	this.hyperspace = hyperspace;

	var starsystems = hyperspace.starsystems;
	var starsystemStart = starsystems["Sol"];
	this.place = new PlaceStarsystem
	(
		this,
		starsystemStart,
		new Location
		(
			new Coords(.5, .95).multiply(starsystemStart.sizeInner),
			new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1))
		)
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

		var factionSlaverGuardDrone = new Faction
		(
			"SlaverGuardDrone",
			Faction.RelationsHostile,
			true, // talksImmediately
			"SlaverGuardDrone", // conversationDefnName
			function shipGroupActivity(universe, world, place, entityActor)
			{
				var actor = entityActor.actor;

				var targetPos = actor.targetPos;
				if (targetPos == null)
				{
					var entityToTargetName = "Player";
					var target = place.entities[entityToTargetName];
					targetPos = target.locatable.loc.pos;
					actor.targetPos = targetPos;
				}

				var actorLoc = entityActor.locatable.loc;
				var actorPos = actorLoc.pos;
				var actorVel = actorLoc.vel;

				actorVel.overwriteWith
				(
					targetPos
				).subtract
				(
					actorPos
				);

				if (actorVel.magnitude() < 1)
				{
					actorPos.overwriteWith(targetPos);
					//place.entitiesToRemove.push(entityActor);
					entityActor.killable.kill(universe, world, place, entityActor);
				}
				else
				{
					actorVel.normalize();
				}
			}
		);

		var factionEarth = new Faction
		(
			"EarthStation",
			Faction.RelationsNeutral,
			true, // talksImmediately
			"EarthStation", // conversationDefnName
			null // shipGroupActivity
		);

		var factions =
		[
			factionEarth,
			factionSlaverGuardDrone,
		];

		var shipDefns = ShipDefn.Instances();

		var defns = new Defns(constraintDefns, factions, shipDefns);

		var playerShipDefnName = "Flagship";
		var playerShip = new Ship(playerShipDefnName);
		var shipDefns = ShipDefn.Instances();
		var playerShips = Ship.manyFromDefns(shipDefns);
		var playerShipGroup = new ShipGroup
		(
			"Player",
			"Player", // factionName
			playerShips
		);
		var player = new Player("Player", playerShipGroup);

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
			new Coords(300, 300), // starsystemSizeInner
			hyperspaceMapAsTextString.value
		);

		var returnValue = new World
		(
			"World-" + nowAsString,
			now, // dateCreated
			defns,
			player,
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
