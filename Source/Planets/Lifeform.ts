
class Lifeform implements EntityProperty<Lifeform>
{
	defnName: string;
	pos: Coords;

	constructor(defnName: string, pos: Coords)
	{
		this.defnName = defnName;
		this.pos = pos;
	}

	defn(world: WorldExtended)
	{
		return world.defnExtended().lifeformDefnByName(this.defnName);
	}

	toEntity(world: WorldExtended, place: Place): Entity
	{
		var lifeformDefn = this.defn(world);
		var lifeformVisual = lifeformDefn.visual;
		lifeformVisual = new VisualWrapped(place.size, lifeformVisual);
		var lifeformCollider = new Sphere(Coords.create(), 5);
		var lifeformActivity = new Activity(lifeformDefn.activityDefn.name, null);
		var returnValue = new Entity
		(
			"Lifeform" + this.defnName + Math.random(),
			[
				this,
				new Actor(lifeformActivity),
				Collidable.fromCollider(lifeformCollider),
				Drawable.fromVisual(lifeformVisual),
				new Killable
				(
					lifeformDefn.durability,
					null, // ?
					(uwpe: UniverseWorldPlaceEntities) => // die
					{
						var world = uwpe.world as WorldExtended;
						var place = uwpe.place as PlacePlanetOrbit;
						var entity = uwpe.entity;

						var resource =
							new Resource("Biodata", 1, entity.locatable().loc.pos);
						var radius = (entity.collidable().collider as Sphere).radius;
						var entityResource =
							resource.toEntity(world, place, radius);
						place.entitiesToSpawn.push(entityResource);
					}
				),
				Locatable.fromPos(this.pos),
			]
		);

		return returnValue;
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	equals(other: Lifeform): boolean { return false; }

}
