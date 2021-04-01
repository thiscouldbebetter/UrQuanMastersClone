
class ShipGroup extends EntityProperty
{
	name: string;
	factionName: string;
	pos: Coords;
	ships: Ship[];

	_posInverted: Coords;

	constructor(name: string, factionName: string, pos: Coords, ships: Ship[])
	{
		super();

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
		universe: Universe, world: World, place: Place, entityActor: Entity
	): void
	{
		var actor = entityActor.actor();

		var targetPos = actor.activity.target as Coords;
		if (targetPos == null)
		{
			var entityToTargetName = Player.name;
			var target = place.entitiesByName.get(entityToTargetName);
			targetPos = target.locatable().loc.pos;
			actor.activity.target = targetPos;
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

		actor.activity.target = new Coords(100000, 0, 0);
		var targetPos = actor.activity.target;

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

	initialize(universe: Universe, world: World, place: Place, entity: Entity): void
	{
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			ship.initialize(universe, world, place, entity);
		}
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
}
