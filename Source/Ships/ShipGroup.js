
class ShipGroup
{
	constructor(name, factionName, pos, ships)
	{
		this.name = name;
		this.factionName = factionName;
		this.pos = pos;
		this.ships = ships;

		this._posInverted = new Coords();
	}

	static activityDefnApproachPlayer()
	{
		return new ActivityDefn
		(
			"ApproachPlayer", ShipGroup.activityDefnApproachPlayer_Perform
		);
	}

	static activityDefnApproachPlayer_Perform(universe, world, place, entityActor)
	{
		var actor = entityActor.actor();

		var targetPos = actor.targetPos;
		if (targetPos == null)
		{
			var entityToTargetName = Player.name;
			var target = place.entitiesByName.get(entityToTargetName);
			targetPos = target.locatable().loc.pos;
			actor.targetPos = targetPos;
		}

		var actorLoc = entityActor.locatable().loc;
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
		}
		else
		{
			actorVel.normalize();
		}
	}

	static activityDefnDie()
	{
		return new ActivityDefn
		(
			"Die", (u, w, p, e) => e.actor().killable().integrityAdd(-10000)
		);
	}

	static activityDefnLeave()
	{
		return new ActivityDefn
		(
			"Leave", ShipGroup.activityDefnLeave_Perform
		);
	}

	static activityDefnLeave_Perform(universe, world, place, entityActor)
	{
		var actor = entityActor.actor();

		actor.targetPos = new Coords(100000, 0, 0);
		var targetPos = actor.targetPos;

		var actorLoc = entityActor.locatable().loc;
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
		}
		else
		{
			actorVel.normalize();
		}
	}

	faction(world)
	{
		return world.defn.factionByName(this.factionName);
	}

	initialize(universe, world)
	{
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			ship.initialize(universe, world);
		}
	}

	toStringPosition(world)
	{
		var hyperspaceSize = world.hyperspace.size;
		return this._posInverted.overwriteWithDimensions
		(
			this.pos.x, hyperspaceSize.y - this.pos.y
		).round().toStringXY();
	}

	toStringDescription()
	{
		var shipCountsByDefnName = {};
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			var shipDefnName = ship.defnName;
			var shipCountForDefnName = shipCountsByDefnName[i];
			if (shipCountForDefnName == null)
			{
				shipCountForDefnName = 0;
				shipCountsByDefnName[shipDefnName] = shipCountForDefnName;
			}
			shipCountForDefnName++;
			shipCountsByDefnName[shipDefnName] = shipCountForDefnName;
		}

		var shipCountsAsStrings = [];

		for (var shipDefnName in shipCountsByDefnName)
		{
			var shipCount = shipCountsByDefnName[shipDefnName];
			var shipCountAsString = shipCount + " " + shipDefnName;
			shipCountsAsStrings.push(shipCountAsString);
		}

		return shipCountsAsStrings;
	}
}
