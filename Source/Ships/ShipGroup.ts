
interface ShipGroup extends EntityPropertyBase
{
	factionName: string;
	name: string;
	pos: Coords;
	posSet(value: Coords): ShipGroup;
	shipFirst(): Ship;
	shipLostAdd(ship: Ship): ShipGroup;
	shipSelectOptimum(): Ship;
	shipSelected: Ship;
	shipsCount(): number;
	shipsGetAll(): Ship[];
	shipsLost(): Ship[];
	toEncounter(uwpe: UniverseWorldPlaceEntities): Encounter;
	toEntity(world: WorldExtended, place: Place): Entity;
	toEntitySpace(world: WorldExtended, place: Place): Entity;
	toStringDescription(world: WorldExtended): string;
}

class ShipGroupBase implements ShipGroup
{
	static fromEntity(entity: Entity): ShipGroup
	{
		return entity.propertyByName(ShipGroupBase.name) as ShipGroup;
	}

	static fromFactionNameAndShipsAsString(factionName: string, shipGroupAsString: string): ShipGroup
	{
		if (shipGroupAsString == "-")
		{
			return null;
		}

		var shipDefnNameAndCount = shipGroupAsString.split(":");
		var shipDefnName = shipDefnNameAndCount[0];
		var shipCount = parseInt(shipDefnNameAndCount[1]);
		var shipGroupName = shipDefnName + " " + ShipGroupBase.name;
		var shipGroup =
			shipCount == 0
			? new ShipGroupInfinite(shipGroupName, factionName, shipDefnName)
			: new ShipGroupFinite(shipGroupName, factionName, Coords.create(), Ship.manyFromDefnNameAndCount(shipDefnName, shipCount) );
		return shipGroup;
	}

	static activityDefnApproachPlayer(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Ship_ApproachPlayer",
			ShipGroupBase.activityDefnApproachPlayer_Perform
		);
	}

	static activityDefnApproachPlayer_Perform
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var entityActor = uwpe.entity;

		var actor = entityActor.actor();

		var targetEntity = actor.activity.targetEntity();
		if (targetEntity == null)
		{
			var place = uwpe.place;
			var entityToTargetName = Player.name;
			targetEntity = place.entityByName(entityToTargetName);
			actor.activity.targetEntitySet(targetEntity);
		}

		ShipGroupBase.activityDefnApproachTarget_Perform(uwpe);
	}

	static activityDefnApproachTarget(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Ship_ApproachTarget",
			ShipGroupBase.activityDefnApproachTarget_Perform
		);
	}

	static activityDefnApproachTarget_Perform
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var entityActor = uwpe.entity;

		var actor = entityActor.actor();

		var targetEntity = actor.activity.targetEntity();

		var targetPos = targetEntity.locatable().loc.pos;

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
			(uwpe: UniverseWorldPlaceEntities) =>
				uwpe.entity.killable().kill()
		);
	}

	static activityDefnLeave(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Leave", ShipGroupBase.activityDefnLeave_Perform
		);
	}

	static activityDefnLeave_Perform
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var entityActor = uwpe.entity;
		var actor = entityActor.actor();
		var actorLoc = entityActor.locatable().loc;
		var actorPlace = actorLoc.place(uwpe.world);
		var actorPos = actorLoc.pos;
		var activity = actor.activity;
		var entityTarget = activity.targetEntity();

		var targetPos: Coords;
		if (entityTarget == null)
		{
			var actorForward = actorLoc.orientation.forward;
			var placeSize = actorPlace.size();
			targetPos = actorPos.clone().add
			(
				actorForward.clone().multiply(placeSize)
			);
			entityTarget = Locatable.fromPos(targetPos).toEntity();
			activity.targetEntitySet(entityTarget);
		}
		else
		{
			targetPos = entityTarget.locatable().loc.pos;
		}

		var displacementToTarget = targetPos.clone().subtract(actorPos);
		var distanceToTarget = displacementToTarget.magnitude();
		var distanceMin = 4;
		if (distanceToTarget < distanceMin)
		{
			actorPos.overwriteWith(targetPos);
			actorPlace.entityToRemoveAdd(entityActor);

			var placeTypeName = actorPlace.constructor.name;
			if (placeTypeName == PlacePlanetVicinity.name)
			{
				var placePlanetVicinity = actorPlace as PlacePlanetVicinity;
				var planet = placePlanetVicinity.planet;
				var shipGroup = ShipGroupFinite.fromEntity(entityActor);
				planet.shipGroupRemove(shipGroup);
			}
		}
		else
		{
			actorLoc.vel.add(displacementToTarget.normalize()); // todo - * acceleration.
		}
	}

	static kill(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place;
		var entity = uwpe.entity;

		place.entityRemove(entity);

		var shipGroup = ShipGroupFinite.fromEntity(entity);
		var shipGroupsInPlace: ShipGroup[] = null;

		var placeTypeName = place.constructor.name;
		if (placeTypeName == PlacePlanetVicinity.name)
		{
			shipGroupsInPlace = (place as PlacePlanetVicinity).planet.shipGroupsInVicinity();
		}
		else if (placeTypeName == PlaceStarsystem.name)
		{
			shipGroupsInPlace = (place as PlaceStarsystem).starsystem.shipGroups(world);
		}
		else
		{
			throw new Error("Unexpected placeTypeName: " + placeTypeName);
		}

		ArrayHelper.remove(shipGroupsInPlace, shipGroup);
	}

	static mustBeImplementedInSubclassError(): Error
	{
		return new Error("Must be implemented in subclass.");
	}

	// Entity implementation.
	equals(other: ShipGroup): boolean { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	finalize(uwpe: UniverseWorldPlaceEntities): void { /* Do nothing. */ }
	initialize(uwpe: UniverseWorldPlaceEntities): void { /* Do nothing. */ }
	propertyName(): string { return ShipGroupBase.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void { /* Do nothing. */ }

	// ShipGroup implementation.

	factionName: string;
	name: string;
	pos: Coords;
	posSet(value: Coords): ShipGroup { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	shipFirst(): Ship { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	shipLostAdd(ship: Ship): ShipGroup { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	shipSelectOptimum(): Ship { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	shipSelected: Ship;
	shipsCount(): number { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	shipsGetAll(): Ship[] { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	shipsLost(): Ship[] { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	toEncounter(uwpe: UniverseWorldPlaceEntities): Encounter { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	toEntity(world: WorldExtended, place: Place): Entity { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	toEntitySpace(world: WorldExtended, place: Place): Entity { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
	toStringDescription(world: WorldExtended): string { throw ShipGroupBase.mustBeImplementedInSubclassError(); }

}

class ShipGroupInfinite extends ShipGroupBase
{
	name: string;
	factionName: string;
	shipDefnName: string;

	constructor(name: string, factionName: string, shipDefnName: string)
	{
		super();
		this.name = name;
		this.factionName = factionName;
		this.shipDefnName = shipDefnName;
	}

	shipsCount(): number
	{
		return Number.POSITIVE_INFINITY;
	}

	toStringDescription(world: WorldExtended): string
	{
		var shipDefn = world.shipDefnByName(this.shipDefnName);
		return "Infinite " + shipDefn.namePlural;
	}
}

class ShipGroupFinite extends ShipGroupBase
{
	name: string;
	factionName: string;
	pos: Coords;
	ships: Ship[];

	shipSelected: Ship;
	_shipsLost: Ship[];

	_posInverted: Coords;

	constructor(name: string, factionName: string, pos: Coords, ships: Ship[])
	{
		super();

		this.name = name || factionName + " Ship Group"
		this.factionName = factionName;
		this.pos = pos;
		this.ships = ships;

		this.shipSelected = this.shipFirst();
		this._shipsLost = [];

		this._posInverted = Coords.create();
	}

	static fromFactionNameAndShips(factionName: string, ships: Ship[]): ShipGroup
	{
		return new ShipGroupFinite
		(
			null, // name
			factionName,
			Coords.zeroes(), // pos
			ships
		);
	}

	static fromFactionNameAndShipsAsString(factionName: string, shipsAsString: string): ShipGroup
	{
		var shipCountAndDefnNamePairs =
			shipsAsString
				.split("+")
				.map
				(
					x => [ x.substr(0, 1), x.substr(1) ]
				);

		var ships = new Array<Ship>();
		for (var p = 0; p < shipCountAndDefnNamePairs.length; p++)
		{
			var shipCountAndDefnNamePair = shipCountAndDefnNamePairs[p];
			var shipCount = parseInt(shipCountAndDefnNamePair[0]);
			if (shipCount == 0)
			{
				// Infinity.
				throw new Error("Not yet implemented!");
			}
			else
			{
				for (var i = 0; i < shipCount; i++)
				{
					var shipDefnName = shipCountAndDefnNamePair[1];
					var ship = Ship.fromDefnName(shipDefnName);
					ships.push(ship);
				}
			}
		}

		var shipGroup = ShipGroupFinite.fromFactionNameAndShips(factionName, ships);

		return shipGroup;
	}


	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	posInHyperspace(world: World): Coords
	{
		var pos: Coords = null;

		var place = world.placeCurrent;

		if (place == null)
		{
			return Coords.create(); // hack
		}

		var placeTypeName = place.constructor.name;
		if (placeTypeName == PlaceHyperspace.name)
		{
			var shipGroupEntity = place.entitiesAll().find(x => ShipGroupFinite.fromEntity(x) == this);
			pos = shipGroupEntity.locatable().loc.pos;
		}
		else if (placeTypeName == PlaceHyperspaceMap.name)
		{
			var placeHyperspaceMap = place as PlaceHyperspaceMap;
			var placeHyperspace = placeHyperspaceMap.placeHyperspaceToReturnTo;
			var shipGroupEntity = placeHyperspace.entitiesAll().find(x => ShipGroupFinite.fromEntity(x) == this);
			pos = shipGroupEntity.locatable().loc.pos;
		}
		else if (placeTypeName == PlaceStarsystem.name)
		{
			var placeStarsystem = place as PlaceStarsystem;
			var starsystem = placeStarsystem.starsystem;
			pos = starsystem.posInHyperspace;
		}
		else if (placeTypeName == PlacePlanetVicinity.name)
		{
			var placePlanetVicinity = place as PlacePlanetVicinity;
			var starsystem = placePlanetVicinity.starsystem();
			pos = starsystem.posInHyperspace;
		}
		else if (placeTypeName == PlacePlanetOrbit.name)
		{
			var placePlanetOrbit = place as PlacePlanetOrbit;
			var starsystem = placePlanetOrbit.starsystem();
			pos = starsystem.posInHyperspace;
		}
		else if (placeTypeName == PlacePlanetSurface.name)
		{
			var placePlanetSurface = place as PlacePlanetSurface;
			var starsystem = placePlanetSurface.starsystem();
			pos = starsystem.posInHyperspace;
		}
		else
		{
			throw new Error("Unexpected placeTypeName: " + placeTypeName);
		}

		var hyperspaceSize = (world as WorldExtended).hyperspace.size;
		var posInverted = this._posInverted.overwriteWithDimensions
		(
			pos.x, hyperspaceSize.y - pos.y, 0
		).round();

		return posInverted;
	}

	posSet(value: Coords): ShipGroup
	{
		this.pos = value;
		return this;
	}

	shipFirst(): Ship
	{
		return this.ships[0];
	}

	shipLostAdd(ship: Ship): ShipGroupFinite
	{
		this._shipsLost.push(ship);
		return this;
	}

	shipSelectOptimum(): Ship
	{
		if (this.shipSelected == null)
		{
			var ship = this.shipFirst(); // todo
			this.shipSelected = ship;
		}

		return this.shipSelected;
	}

	shipsCount(): number
	{
		return this.ships.length;
	}

	shipsGetAll(): Ship[]
	{
		return this.ships;
	}

	shipsLost(): Ship[]
	{
		return this._shipsLost;
	}

	toEntity(world: WorldExtended, place: Place): Entity
	{
		var returnValue =
			this.toEntitySpace(world, place);

		return returnValue;
	}

	toEntitySpace(world: WorldExtended, place: Place): Entity
	{
		// See toEntitySpace2() for possible changes.

		var faction = this.faction(world);

		// hack
		// var actor = new Actor(faction.shipGroupActivity);
		var actor = Actor.fromActivityDefn
		(
			ShipGroupBase.activityDefnApproachPlayer()
		);

		var entityDimension = 10;

		var colliderAsFace = new Face
		([
			Coords.fromXY(0, -1).multiplyScalar(entityDimension).half(),
			Coords.fromXY(1, 1).multiplyScalar(entityDimension).half(),
			Coords.fromXY(-1, 1).multiplyScalar(entityDimension).half(),
		]);
		var collider = Mesh.fromFace
		(
			Coords.zeroes(), // center
			colliderAsFace,
			1 // thickness
		);
		var collidable = Collidable.fromCollider(collider);
		var boundable = Boundable.fromCollidable(collidable);

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1);

		var constrainable =
			new Constrainable([constraintSpeedMax]);

		var shipDefn = faction.shipDefn(world);
		var shipVisual = shipDefn.visual;

		var drawable = Drawable.fromVisual(shipVisual);

		// Note that ships may really only be killable in combat.
		var killable = new Killable(1, null, ShipGroupBase.kill);

		var	pos = this.pos;
		var loc = Disposition.fromPos(pos);
		var locatable = new Locatable(loc);

		var movable = Movable.default();

		var faction = this.faction(world);
		var talker = faction.toTalker();

		var returnEntity = new Entity
		(
			this.name,
			[
				actor,
				boundable,
				collidable,
				constrainable,
				drawable,
				killable,
				locatable,
				movable,
				this,
				talker
			]
		);

		return returnEntity;
	}

	toEncounter(uwpe: UniverseWorldPlaceEntities): Encounter
	{
		var entityPlayer = uwpe.entity;
		var entityShipGroup = uwpe.entity2;

		if (entityShipGroup == null)
		{
			var world = uwpe.world as WorldExtended;
			entityShipGroup = this.toEntity(world, world.place() );
			uwpe.entity2Set(entityShipGroup);
		}

		var playerPos = entityPlayer.locatable().loc.pos;

		var place = uwpe.place;
		var placeTypeName = place.constructor.name;
		var planet: Planet;
		var placeToReturnTo = place;

		if (placeTypeName == PlaceEncounter.name)
		{
			var encounter = (place as PlaceEncounter).encounter;
			planet = encounter.planet;
		}
		else if (placeTypeName == PlacePlanetOrbit.name)
		{
			planet = (place as PlacePlanetOrbit).planet;
		}
		else if (placeTypeName == PlacePlanetVicinity.name)
		{
			planet = (place as PlacePlanetVicinity).planet
		}
		else if (placeTypeName == PlaceStarsystem.name)
		{
			planet = (place as PlaceStarsystem).starsystem.planetClosestTo(playerPos);
		}
		else if (placeTypeName == PlaceHyperspace.name)
		{
			planet = (place as PlaceHyperspace).hyperspace.starsystemClosestTo(playerPos).planetRandom(uwpe.universe);
		}
		else
		{
			throw new Error("Unexpected placeTypeName '" + placeTypeName + "'.");
		}

		var encounter = new Encounter
		(
			planet,
			this.factionName,
			entityPlayer,
			entityShipGroup,
			placeToReturnTo,
			playerPos.clone()
		);

		return encounter
	}

	// Controls.

	toControl(cr: ConversationRun, size: Coords, universe: Universe): ControlBase
	{
		return cr.toControl_Layout_2(size, universe)
	}

	// Strings.

	toStringDescription(world: WorldExtended): string
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

		for (var shipDefnName of shipCountsByDefnName.keys())
		{
			var shipCount = shipCountsByDefnName.get(shipDefnName);
			var shipDefn = world.shipDefnByName(shipDefnName);
			var shipDefnNameSingularOrPlural =
				(shipCount == 1 ? shipDefn.name : shipDefn.namePlural);
			var shipCountAsString = shipCount + " " + shipDefnNameSingularOrPlural;
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
			ship.initialize(uwpe);
		}
	}

	propertyName(): string { return ShipGroupBase.name; }

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: ShipGroup): boolean { return false; }
}
