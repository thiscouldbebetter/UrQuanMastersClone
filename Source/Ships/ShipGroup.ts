
class ShipGroup implements EntityPropertyBase
{
	name: string;
	factionName: string;
	pos: Coords;
	ships: Ship[];

	shipSelected: Ship;
	shipsLost: Ship[];

	_posInverted: Coords;

	constructor(name: string, factionName: string, pos: Coords, ships: Ship[])
	{
		this.name = name || factionName + " Ship Group"
		this.factionName = factionName;
		this.pos = pos;
		this.ships = ships;

		this.shipSelected = this.ships[0];
		this.shipsLost = [];

		this._posInverted = Coords.create();
	}

	static fromFactionNameAndShips(factionName: string, ships: Ship[]): ShipGroup
	{
		return new ShipGroup
		(
			null, // name
			factionName,
			Coords.zeroes(), // pos
			ships
		);
	}

	static fromEntity(entity: Entity): ShipGroup
	{
		return entity.propertyByName(ShipGroup.name) as ShipGroup;
	}

	static activityDefnApproachPlayer(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Ship_ApproachPlayer",
			ShipGroup.activityDefnApproachPlayer_Perform
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

		ShipGroup.activityDefnApproachTarget_Perform(uwpe);
	}

	static activityDefnApproachTarget(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Ship_ApproachTarget",
			ShipGroup.activityDefnApproachTarget_Perform
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
			"Leave", ShipGroup.activityDefnLeave_Perform
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
				var shipGroup = ShipGroup.fromEntity(entityActor);
				ArrayHelper.remove(planet.shipGroups, shipGroup);
			}
		}
		else
		{
			actorLoc.vel.add(displacementToTarget.normalize()); // todo - * acceleration.
		}
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	posInHyperspace(world: World): Coords
	{
		var pos: Coords = null;

		var place = world.placeCurrent;
		var placeTypeName = place.constructor.name;
		if (placeTypeName == PlaceHyperspace.name)
		{
			var shipGroupEntity = place.entitiesAll().find(x => ShipGroup.fromEntity(x) == this);
			pos = shipGroupEntity.locatable().loc.pos;
		}
		else if (placeTypeName == PlaceHyperspaceMap.name)
		{
			var placeHyperspaceMap = place as PlaceHyperspaceMap;
			var placeHyperspace = placeHyperspaceMap.placeHyperspaceToReturnTo;
			var shipGroupEntity = placeHyperspace.entitiesAll().find(x => ShipGroup.fromEntity(x) == this);
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

	shipSelectOptimum(): Ship
	{
		if (this.shipSelected == null)
		{
			var ship = this.ships[0]; // todo
			this.shipSelected = ship;
		}

		return this.shipSelected;
	}

	toEntity(world: WorldExtended, place: Place): Entity
	{
		var placeSize = place.size();

		var returnValue =
			placeSize == null
			? this.toEntityEncounter(world, place)
			: this.toEntitySpace(world, place);

		return returnValue;
	}

	toEntityEncounter(world: WorldExtended, place: Place): Entity
	{
		var talker = new Talker
		(
			"Conversation-" + this.factionName,
			null, // quit
			this.toControl
		);

		return new Entity
		(
			this.name,
			[
				this,
				talker
			]
		);
	}

	toEntitySpace(world: WorldExtended, place: Place): Entity
	{
		var shipGroup = this;

		var faction = shipGroup.faction(world);

		var shipActor = new Actor(faction.shipGroupActivity);

		var entityDimension = 10;

		var shipColliderAsFace = new Face
		([
			Coords.fromXY(0, -1).multiplyScalar(entityDimension).half(),
			Coords.fromXY(1, 1).multiplyScalar(entityDimension).half(),
			Coords.fromXY(-1, 1).multiplyScalar(entityDimension).half(),
		]);
		var shipCollider = Mesh.fromFace
		(
			Coords.zeroes(), // center
			shipColliderAsFace,
			1 // thickness
		);
		var shipCollidable =
			Collidable.fromCollider(shipCollider);

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1);

		var shipConstrainable =
			new Constrainable([constraintSpeedMax]);

		var shipDefn = faction.shipDefn(world);
		var shipVisual = shipDefn.visual;

		var shipDrawable = Drawable.fromVisual(shipVisual);

		var shipKill = (uwpe: UniverseWorldPlaceEntities) =>
		{
			var place = uwpe.place;
			var entity = uwpe.entity;

			place.entityRemove(entity);

			var shipGroup = ShipGroup.fromEntity(entity);
			var shipGroupsInPlace: ShipGroup[] = null;

			var placeTypeName = place.constructor.name;
			if (placeTypeName == PlacePlanetVicinity.name)
			{
				shipGroupsInPlace = (place as PlacePlanetVicinity).planet.shipGroups;
			}
			else if (placeTypeName == PlaceStarsystem.name)
			{
				shipGroupsInPlace = (place as PlaceStarsystem).starsystem.shipGroups;
			}
			else
			{
				throw new Error("Unexpected placeTypeName: " + placeTypeName);
			}

			ArrayHelper.remove(shipGroupsInPlace, shipGroup);
		}
		var shipKillable = new Killable(1, null, shipKill);

		var placeSize = place.size();
		var shipPos = Coords.random(null).multiply(placeSize);
		var shipLoc = Disposition.fromPos(shipPos);
		var shipLocatable = new Locatable(shipLoc);

		var shipMovable = Movable.default();

		var shipTalker = new Talker
		(
			"todo", null, this.toControl
		);

		var returnEntity = new Entity
		(
			shipGroup.name,
			[
				shipActor,
				shipCollidable,
				shipConstrainable,
				shipDrawable,
				shipKillable,
				shipLocatable,
				shipMovable,
				shipGroup,
				shipTalker
			]
		);

		return returnEntity;
	}

	toEncounter(uwpe: UniverseWorldPlaceEntities): Encounter
	{
		var entityPlayer = uwpe.entity;
		var playerPos = entityPlayer.locatable().loc.pos;

		var place = uwpe.place;
		var placeTypeName = place.constructor.name;
		var planet =
			placeTypeName == PlaceEncounter.name
			? (place as PlaceEncounter).encounter.planet
			: placeTypeName == PlacePlanetOrbit.name
			? (place as PlacePlanetOrbit).planet
			: placeTypeName == PlacePlanetVicinity.name
			? (place as PlacePlanetVicinity).planet
			: placeTypeName == PlaceStarsystem.name
			? (place as PlaceStarsystem).starsystem.planetClosestTo(playerPos)
			: placeTypeName == PlaceHyperspace.name
			? (place as PlaceHyperspace).hyperspace.starsystemClosestTo(playerPos).planetRandom(uwpe.universe)
			: null

		var world = uwpe.world as WorldExtended;
		var entityShipGroup = this.toEntity(world, place);

		var encounter = new Encounter
		(
			planet,
			this.factionName,
			entityPlayer,
			entityShipGroup,
			place,
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

		for (var shipDefnName of shipCountsByDefnName.keys())
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
			ship.initialize(uwpe);
		}
	}

	propertyName(): string { return ShipGroup.name; }

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: ShipGroup): boolean { return false; }
}
