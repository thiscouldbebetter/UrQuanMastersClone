
class Lifeform implements EntityProperty<Lifeform>
{
	defnName: string;
	pos: Coords;

	constructor(defnName: string, pos: Coords)
	{
		this.defnName = defnName;
		this.pos = pos;
	}

	static fromEntity(entity: Entity): Lifeform
	{
		return entity.propertyByName(Lifeform.name) as Lifeform;
	}

	die(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlacePlanetOrbit;
		var entity = uwpe.entity;
		var resourceDefns = ResourceDefn.Instances();

		var lifeform = Lifeform.fromEntity(entity);
		var lifeformDefn = lifeform.defn(world);
		var lifeformValue = lifeformDefn.value;

		var entityPos = entity.locatable().loc.pos;

		var resource = new Resource
		(
			resourceDefns.Biodata.name,
			lifeformValue,
			entityPos
		);

		var radius = (entity.collidable().collider as Sphere).radius;
		var entityResource =
			resource.toEntity(world, place, radius);
		place.entityToSpawnAdd(entityResource);
	}

	defn(world: WorldExtended): LifeformDefn
	{
		return world.defnExtended().lifeformDefnByName(this.defnName);
	}

	toEntity
	(
		world: WorldExtended,
		planet: Planet
	): Entity
	{
		var lifeformDefn = this.defn(world);

		var lifeformActivity = new Activity(lifeformDefn.activityDefnName, null);
		var lifeformActor = new Actor(lifeformActivity);

		var lifeformRadius = 5;

		var lifeformCollider = new Sphere(Coords.create(), lifeformRadius);
		var lifeformCollidable = Collidable.fromCollider(lifeformCollider);
		lifeformCollidable.canCollideAgainWithoutSeparating = true;

		var lifeformDamager = Damager.default();

		var lifeformVisual: VisualBase = lifeformDefn.visual;
		lifeformVisual = new VisualWrapped(planet.sizeSurface(), lifeformVisual);
		var lifeformDrawable = Drawable.fromVisual(lifeformVisual);

		var lifeformKillable = new Killable
		(
			lifeformDefn.durability,
			null, // ?
			this.die
		);

		var lifeformLocatable = Locatable.fromPos(this.pos);

		var colorGreen = Color.Instances().Green;
		var visualScanContact: VisualBase = new VisualRectangle
		(
			Coords.ones().multiplyScalar(lifeformRadius), colorGreen, null, null
		);
		visualScanContact = new VisualHidable
		(
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var isVisible = false;

				var place = uwpe.place;
				var placeTypeName = place.constructor.name;
				if (placeTypeName == PlacePlanetOrbit.name)
				{
					var placePlanetOrbit = place as PlacePlanetOrbit;
					isVisible = placePlanetOrbit.hasLifeBeenScanned;
				}
				else if (placeTypeName == PlacePlanetSurface.name)
				{
					var placePlanetSurface = place as PlacePlanetSurface;
					var placePlanetOrbit = placePlanetSurface.placePlanetOrbit;
					isVisible = placePlanetOrbit.hasLifeBeenScanned;
				}
				else
				{
					throw new Error("Unexpected placeTypeName: " + placeTypeName);
				}

				return isVisible;
			},
			visualScanContact
		);
		var lifeformMappable = new Mappable(visualScanContact);

		var lifeformMovable = Movable.fromSpeedMax(lifeformDefn.speed / 4);

		var returnValue = new Entity
		(
			"Lifeform" + this.defnName + Math.random(),
			[
				this,
				lifeformActor,
				lifeformCollidable,
				lifeformDamager,
				lifeformDrawable,
				lifeformKillable,
				lifeformLocatable,
				lifeformMappable,
				lifeformMovable
			]
		);

		return returnValue;
	}

	static activityDefnApproachPlayer(): ActivityDefn
	{
		return new ActivityDefn
		(
			"Lifeform_ApproachPlayer",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var entityActor = uwpe.entity;
				var place = uwpe.place;
				var entityTarget = place.entityByName(Player.name);
				if (entityTarget == null)
				{
					Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
				}
				else
				{
					var targetPos = entityTarget.locatable().loc.pos;
					var actorLoc = entityActor.locatable().loc;
					var actorPos = actorLoc.pos;
					var displacementToTarget = targetPos.clone().subtract(actorPos);
					var distanceToTarget = displacementToTarget.magnitude();
					var detectionDistanceMax = 150; // todo
					if (distanceToTarget > detectionDistanceMax)
					{
						Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
					}
					else
					{
						var distancePerTick = entityActor.movable().speedMax(uwpe);
						if (distanceToTarget < distancePerTick)
						{
							actorPos.overwriteWith(targetPos);
						}
						else
						{
							actorLoc.vel.overwriteWith
							(
								displacementToTarget
							).divideScalar
							(
								distanceToTarget
							).multiplyScalar
							(
								distancePerTick
							);
						}
					}
				}
			}
		);
	}

	static activityDefnAvoidPlayer(): ActivityDefn
	{
		return new ActivityDefn
		(
			"AvoidPlayer",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var entityActor = uwpe.entity;
				var place = uwpe.place;
				var entityTarget = place.entityByName(Player.name);
				if (entityTarget == null)
				{
					Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
				}
				else
				{
					var targetPos = entityTarget.locatable().loc.pos;
					var actorLoc = entityActor.locatable().loc;
					var actorPos = actorLoc.pos;
					var displacementToTarget = targetPos.clone().subtract(actorPos);
					var distanceToTarget = displacementToTarget.magnitude();
					var detectionDistanceMax = 150; // todo
					var distancePerTick = entityActor.movable().speedMax(uwpe);
					if (distanceToTarget > detectionDistanceMax)
					{
						Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
					}
					else
					{
						actorLoc.vel.overwriteWith
						(
							displacementToTarget
						).divideScalar
						(
							distanceToTarget
						).multiplyScalar
						(
							distancePerTick
						).invert();
					}
				}
			}
		);
	}

	static activityDefnDoNothing(): ActivityDefn
	{
		return new ActivityDefn
		(
			"DoNothing",
			(uwpe: UniverseWorldPlaceEntities) => {}
		);
	}

	static activityDefnMoveToRandomPosition(): ActivityDefn
	{
		return new ActivityDefn
		(
			"MoveToRandomPosition",
			Lifeform.activityDefnMoveToRandomPosition_Perform
		);
	}

	static activityDefnMoveToRandomPosition_Perform
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var entityActor = uwpe.entity;
		var actor = entityActor.actor();
		var activity = actor.activity;
		var entityTarget = activity.targetEntity();
		if (entityTarget == null)
		{
			var targetPos = Coords.create().randomize
			(
				uwpe.universe.randomizer
			).multiply
			(
				uwpe.place.size()
			);
			entityTarget = Locatable.fromPos(targetPos).toEntity();
			activity.targetEntitySet(entityTarget);
		}
		var targetPos = entityTarget.locatable().loc.pos;
		var actorLoc = entityActor.locatable().loc;
		var actorPos = actorLoc.pos;
		var displacementToTarget = targetPos.clone().subtract(actorPos);
		var distanceToTarget = displacementToTarget.magnitude();
		var distancePerTick = entityActor.movable().speedMax(uwpe);
		if (distanceToTarget < distancePerTick)
		{
			activity.targetEntityClear();
		}
		else
		{
			actorLoc.vel.overwriteWith
			(
				displacementToTarget
			).divideScalar
			(
				distanceToTarget
			).multiplyScalar
			(
				distancePerTick
			);
		}
	}

	// Clonable.
	clone(): Lifeform { throw new Error("todo"); }
	overwriteWith(other: Lifeform): Lifeform { throw new Error("todo"); }

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return Lifeform.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	equals(other: Lifeform): boolean { return false; }

}
