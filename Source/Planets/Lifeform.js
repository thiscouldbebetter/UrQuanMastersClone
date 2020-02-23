
function Lifeform(defnName, pos)
{
	this.defnName = defnName;
	this.pos = pos;
}
{
	Lifeform.prototype.defn = function(world)
	{
		return world.defns.lifeformDefns[this.defnName];
	}

	Lifeform.prototype.toEntity = function(world, place)
	{
		var lifeformDefn = this.defn(world);
		var lifeformVisual = new VisualCamera(lifeformDefn.visual, () => place.camera);
		lifeformVisual = new VisualWrapped(place.size, lifeformVisual);
		var lifeformCollider = new Sphere(new Coords(0, 0, 0), 5);
		var returnValue = new Entity
		(
			"Lifeform" + this.defnName + Math.random(),
			[
				this,
				new Actor(lifeformDefn.activity),
				new Collidable(lifeformCollider),
				new Drawable(lifeformVisual),
				new Killable
				(
					lifeformDefn.durability,
					function die(universe, world, place, entity)
					{
						var planet = place.planet;
						var resource = new Resource("Biodata", 1, entity.locatable.loc.pos);
						var radius = entity.collidable.collider.radius;
						var entityResource = resource.toEntity(world, place, radius);
						place.entitiesToSpawn.push(entityResource);
					}
				),
				new Locatable(new Location(this.pos)),
			]
		);

		return returnValue;
	}
}
