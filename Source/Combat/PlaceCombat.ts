
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

		var planetActivity =
			new Activity(Planet.activityDefnGravitate().name, null);
		var planetActor = new Actor(planetActivity);

		var planetCollider = new Sphere(Coords.create(), planetRadius);
		var planetCollidable = new Collidable
		(
			false, // canCollideAgainWithoutSeparating
			null, // ticks
			planetCollider,
			[ Collidable.name ], // entityPropertyNamesToCollideWith
			this.planetCollide
		);

		// todo - Match appearance to the actual planet.

		var planetDefn = planet.defn();
		/*
		var entityDimension = 10;
		var planetRadius = entityDimension;
		var planetColor = Color.Instances().Cyan;
		var planetVisual = new VisualWrapped
		(
			this.size,
			VisualCircle.fromRadiusAndColorFill(planetRadius, planetColor)
		);
		*/
		var planetVisual: VisualBase = planetDefn.visualVicinity;
		var planetRadius = (planetVisual as VisualCircleGradient).radius;
		planetVisual = new VisualWrapped(this.size(), planetVisual);

		var planetDrawable = Drawable.fromVisual(planetVisual);

		var sizeHalf = this.size().clone().half();
		var planetPos = sizeHalf.clone();
		var planetLocatable = Locatable.fromPos(planetPos);

		var planetEntity = new Entity
		(
			"Planet",
			[
				planetActor,
				planetCollidable,
				planetDrawable,
				planetLocatable,
				planet
			]
		);

		this.entityToSpawnAdd(planetEntity);
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

		if (shipGroups[0].ships.length == 0)
		{
			throw "todo"; // Game over.
		}
		else if (shipGroups[1].ships.length > 0)
		{
			var controlShipSelect =
				combat.toControlShipSelect(universe, universe.display.sizeInPixels);
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

		var planetPos = entityPlanet.locatable().loc.pos;

		var otherLoc = entityOther.locatable().loc;
		var otherPos = otherLoc.pos;
		var displacement = otherPos.clone().subtract(planetPos);
		var distance = displacement.magnitude();
		var direction = displacement.divideScalar(distance);
		var planetCollider =
			entityPlanet.collidable().collider as Sphere;
		var planetRadius = planetCollider.radius;
		var otherCollider =
			entityOther.collidable().collider as Sphere;
		var sumOfRadii = planetRadius + otherCollider.radius;
		if (distance < sumOfRadii)
		{
			var impulse = direction.multiplyScalar(sumOfRadii - distance);
			otherLoc.vel.add(impulse.double());
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
			display.drawBackground(colorBlack, colorBlack);

			var midpointBetweenCombatants;

			var camera = this._camera;
			var cameraPos = camera.loc.pos;

			if (ships.length == 1)
			{
				midpointBetweenCombatants = ships[0].locatable().loc.pos;
			}
			else // if ships.length == 2
			{

				midpointBetweenCombatants =
					this.combat.midpointOfPointsWrappedToRange
					(
						cameraPos, // midpointToOverwrite
						ships[0].locatable().loc.pos,
						ships[1].locatable().loc.pos,
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
				shipEntityOther == null ? Coords.create() : shipEntityOther.locatable().loc.pos
			);

			var planet = this.entitiesByPropertyName(Planet.name)[0];
			var planetPos = planet.locatable().loc.pos;

			var shipPos = entityToSpawn.locatable().loc.pos;
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
				shipEntity.actor().activity.defnNameSet(Player.activityDefn().name);
			}
			else if (ship == shipsFighting[1])
			{
				shipEntity.actor().activity.defnNameSet
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

		var controlShipSelect = this.combat.toControlShipSelect(universe, universe.display.sizeInPixels);

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
