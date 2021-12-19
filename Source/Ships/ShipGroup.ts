
class ShipGroup implements EntityPropertyBase
{
	name: string;
	factionName: string;
	pos: Coords;
	ships: Ship[];

	_posInverted: Coords;

	constructor(name: string, factionName: string, pos: Coords, ships: Ship[])
	{
		this.name = name;
		this.factionName = factionName;
		this.pos = pos;
		this.ships = ships;

		this._posInverted = Coords.create();
	}

	static activityDefnApproachPlayer(): ActivityDefn
	{
		return new ActivityDefn
		(
			"ApproachPlayer", ShipGroup.activityDefnApproachPlayer_Perform
		);
	}

	static activityDefnApproachPlayer_Perform
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var entityActor = uwpe.entity;

		var actor = entityActor.actor();

		var target = actor.activity.target();
		if (target == null)
		{
			var entityToTargetName = Player.name;
			target = place.entitiesByName.get(entityToTargetName);
			actor.activity.targetEntitySet(target);
		}

		var targetPos = target.locatable().loc.pos;

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

	static activityDefnDie(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Die",
			(u: Universe, w: World, p: Place, e: Entity) =>
				e.killable().integrityAdd(-10000)
		);
	}

	static activityDefnLeave(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Leave", ShipGroup.activityDefnLeave_Perform
		);
	}

	static activityDefnLeave_Perform
	(
		universe: Universe, world: World, place: Place, entityActor: Entity
	): void
	{
		var actor = entityActor.actor();

		var targetPos = new Coords(100000, 0, 0);
		actor.activity.targetSet(targetPos);

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

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	toStringPosition(world: World): string
	{
		var hyperspaceSize = (world as WorldExtended).hyperspace.size;
		return this._posInverted.overwriteWithDimensions
		(
			this.pos.x, hyperspaceSize.y - this.pos.y, 0
		).round().toStringXY();
	}

	toStringDescription(): string
	{
		var shipCountsByDefnName = new Map<string, number>();
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			var shipDefnName = ship.defnName;
			var shipCountForDefnName = shipCountsByDefnName.get(shipDefnName);
			if (shipCountForDefnName == null)
			{
				shipCountForDefnName = 0;
				shipCountsByDefnName.set(shipDefnName, shipCountForDefnName);
			}
			shipCountForDefnName++;
			shipCountsByDefnName.set(shipDefnName, shipCountForDefnName);
		}

		var shipCountsAsStrings = [];

		for (var shipDefnName in shipCountsByDefnName)
		{
			var shipCount = shipCountsByDefnName.get(shipDefnName);
			var shipCountAsString = shipCount + " " + shipDefnName;
			shipCountsAsStrings.push(shipCountAsString);
		}

		return shipCountsAsStrings.join("\n");
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			ship.initialize(universe, world, place, entity);
		}
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

}
