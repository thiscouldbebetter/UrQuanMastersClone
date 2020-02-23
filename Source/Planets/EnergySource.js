
function EnergySource(name, pos, visual, collideWithLander)
{
	this.name = name;
	this.pos = pos;
	this.visual = visual;
	this.collideWithLander = collideWithLander;
}
{
	EnergySource.prototype.toEntity = function(world, place)
	{
		var visual = new VisualCircle(10, "Cyan");
		visual = new VisualCamera(visual, () => place.camera);
		Visual = new VisualWrapped(place.size, visual);
		var energySourceCollider = new Sphere(new Coords(0, 0, 0), 5);
		var returnValue = new Entity
		(
			this.name,
			[
				this,
				new Collidable(energySourceCollider),
				new Drawable(visual),
				new Locatable(new Location(this.pos)),
			]
		);

		return returnValue;
	}
}
