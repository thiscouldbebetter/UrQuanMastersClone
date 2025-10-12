
class PlaceCombat extends PlaceBase
{
	combat: Combat;

	actions: Action[];
	venueControls: VenueControls;

	_actionToInputsMappings: ActionToInputsMapping[];
	_camera: Camera;

	constructor(worldAsWorld: World, combat: Combat)
	{
		super
		(
			PlaceCombat.name,
			PlaceCombat.name,
			null, // parentName
			combat.size,
			null // entities
		);

		this.combat = combat;

		this.entityToSpawnAdd(new GameClock(1).toEntity());

		this.size = () => this.combat.size;

		var actionExit = new Action
		(
			"Exit",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var place = uwpe.place as PlaceCombat;
				var encounter = place.combat.encounter;
				encounter.goToPlaceNext(uwpe.universe);
			}
		);

		this.actions =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),
			Ship.actionFire(),
			Ship.actionSpecial(),
			actionExit,
		];//.addLookupsByName();

		this._actionToInputsMappings = Ship.actionToInputsMappings();
		this._actionToInputsMappings = this._actionToInputsMappings.concat
		(
			[
				new ActionToInputsMapping("Fire", ["Enter", "Gamepad0Button0"], true),
				new ActionToInputsMapping("Special", ["_", "Gamepad0Button1"], true),
				new ActionToInputsMapping("Exit", ["Escape", "Gamepad0Button2"], true),
			]
		);
		//this._actionToInputsMappings.addLookups(function (x) { return x.inputNames; } );

		// camera

		this._camera = new Camera
		(
			Coords.fromXY(300, 300), // hack
			null, // focalLength
			Disposition.fromOrientation
			(
				Orientation.Instances().ForwardZDownY.clone()
			),
			null // entitiesInViewSort
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		this.entityToSpawnAdd
		(
			cameraAsEntity
		);

		// entities

		// Planet.

		var planet = this.combat.encounter.planet;

		var planetEntity = this.constructor_PlanetEntityBuild(planet);

		this.entityToSpawnAdd(planetEntity);
	}

	constructor_PlanetEntityBuild(planet: Planet): Entity
	{
		var planetDefn = planet.defn();
		var visual: Visual = planetDefn.visualVicinityPrimary;
		var radius = (visual as VisualCircleGradient).radius;

		var activity =
			Activity.fromDefnName(Planet.activityDefnGravitate().name);
		var actor = new Actor(activity);

		var collider = Sphere.fromRadius(radius);
		var collidable = Collidable.fromColliderPropertyNamesAndCollide
		(
			collider,
			[ Ship.name ], // entityPropertyNamesToCollideWith
			this.planetCollide
		);

		visual = new VisualWrapped2(this.size(), visual);

		var drawable = Drawable.fromVisual(visual);

		var sizeHalf = this.size().clone().half();
		var pos = sizeHalf.clone();
		var locatable = Locatable.fromPos(pos);

		var planetEntity = Entity.fromNameAndProperties
		(
			Planet.name,
			[
				actor,
				collidable,
				drawable,
				locatable,
				planet
			]
		);

		return planetEntity;
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	roundOver(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var place = uwpe.place as PlaceCombat;

		var combat = place.combat;
		var shipGroups = combat.shipGroups;

		if (shipGroups[0].shipsCount() == 0)
		{
			throw new Error("Not yet implemented!"); // Game over.
		}
		else if (shipGroups[1].shipsCount() > 0)
		{
			var controlShipSelect =
				combat.toControlShipSelect(uwpe, universe.display.sizeInPixels);
			var venueNext = VenueControls.fromControl(controlShipSelect);
			universe.venueNextSet(venueNext);
		}
		else
		{
			var controlCombatDebriefing =
				combat.toControlDebriefing(universe, universe.display.sizeInPixels);
			var venueNext = VenueControls.fromControl(controlCombatDebriefing);
			universe.venueNextSet(venueNext);
		}
	}

	entitiesShips(): Entity[]
	{
		return this.entitiesByPropertyName(Ship.name);
	}

	planetCollide(uwpe: UniverseWorldPlaceEntities): void
	{
		var entityPlanet = uwpe.entity;
		var entityOther = uwpe.entity2;
		var entityOtherIsShip = Ship.of(entityOther) != null;
		if (entityOtherIsShip) // hack
		{
			var planetPos = Locatable.of(entityPlanet).loc.pos;

			var otherLoc = Locatable.of(entityOther).loc;
			var otherPos = otherLoc.pos;
			var displacement = otherPos.clone().subtract(planetPos);
			var distance = displacement.magnitude();
			var direction = displacement.divideScalar(distance);
			var planetCollider =
				Collidable.of(entityPlanet).collider as Sphere;
			var planetRadius = planetCollider.radius();
			var otherCollider =
				Collidable.of(entityOther).collider as Sphere;
			var sumOfRadii = planetRadius + otherCollider.radius();
			if (distance < sumOfRadii)
			{
				var impulse = direction.multiplyScalar(sumOfRadii - distance);
				otherLoc.vel.add(impulse.double());
			}
		}
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		var ships = this.entitiesShips();

		if (ships.length == 0)
		{
			// Do nothing.
		}
		else
		{
			var colorBlack = Color.Instances().Black;
			display.drawBackgroundWithColorsBackAndBorder(colorBlack, colorBlack);

			var midpointBetweenCombatants;

			var camera = this._camera;
			var cameraPos = camera.loc.pos;

			if (ships.length == 1)
			{
				midpointBetweenCombatants = Locatable.of(ships[0]).loc.pos;
			}
			else // if ships.length == 2
			{

				midpointBetweenCombatants =
					this.combat.midpointOfPointsWrappedToRange
					(
						cameraPos, // midpointToOverwrite
						Locatable.of(ships[0]).loc.pos,
						Locatable.of(ships[1]).loc.pos,
						this.size()
					);
			}

			cameraPos.overwriteWith(midpointBetweenCombatants);
		}

		super.draw(universe, world, display);

		this.venueControls.draw(universe);
	}

	entitySpawn(uwpe: UniverseWorldPlaceEntities): void
	{
		super.entitySpawn(uwpe);

		var entityToSpawn = uwpe.entity;

		var ship = Ship.fromEntity(entityToSpawn);

		if (ship != null)
		{
			var shipEntity = entityToSpawn;

			var shipEntitiesExisting = this.entitiesByPropertyName(Ship.name);
			var shipEntityOther = shipEntitiesExisting.find(x => x.id != entityToSpawn.id);
			var shipOtherPos =
			(
				shipEntityOther == null ? Coords.create() : Locatable.of(shipEntityOther).loc.pos
			);

			var planet = this.entitiesByPropertyName(Planet.name)[0];
			var planetPos = Locatable.of(planet).loc.pos;

			var shipPos = Locatable.of(entityToSpawn).loc.pos;
			var distanceMin = 100;
			while
			(
				shipPos.clone().subtract(planetPos).magnitude() < distanceMin
				|| shipPos.clone().subtract(shipOtherPos).magnitude() < distanceMin
			)
			{
				shipPos
					.randomize(uwpe.universe.randomizer)
					.multiply(this.size() );
			}

			var shipsFighting = this.combat.shipsFighting;
			if (ship == shipsFighting[0])
			{
				Actor.of(shipEntity).activity.defnNameSet(Player.activityDefn().name);
			}
			else if (ship == shipsFighting[1])
			{
				Actor.of(shipEntity).activity.defnNameSet
				(
					//Combat.activityDefnEnemy().name
					ActivityDefn.Instances().DoNothing.name
				);
			}
		}
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		super.initialize(uwpe);

		var universe = uwpe.universe;
		var world = uwpe.world;
		var place = uwpe.place;

		this.combat.initialize(universe, world, place);

		var controlShipSelect = this.combat.toControlShipSelect(uwpe, universe.display.sizeInPixels);

		if (this.venueControls == null)
		{
			this.venueControls = VenueControls.fromControl(controlShipSelect);
		}
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		super.updateForTimerTick(uwpe);
		this.combat.updateForTimerTick(uwpe);
		this.venueControls.updateForTimerTick(uwpe.universe);
	}
}
