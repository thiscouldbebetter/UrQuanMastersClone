
class Lifeform implements EntityProperty
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
				CollidableHelper.fromCollider(lifeformCollider),
				Drawable.fromVisual(lifeformVisual),
				new Killable
				(
					lifeformDefn.durability,
					null, // ?
					(universe: Universe, world: World, placeAsPlace: Place, entity: Entity) => // die
					{
						var place = placeAsPlace as PlacePlanetOrbit;
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

	finalize(u: Universe, w: World, p: Place, e: Entity): void {}

	initialize(u: Universe, w: World, p: Place, e: Entity): void {}

	updateForTimerTick(u: Universe, w: World, p: Place, e: Entity): void {}

}
