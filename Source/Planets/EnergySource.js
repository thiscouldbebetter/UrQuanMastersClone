
class EnergySource
{
	constructor(name, pos, visual, collideWithLander)
	{
		this.name = name;
		this.pos = pos;
		this.visual = visual;
		this.collideWithLander = collideWithLander;
	}

	toEntity(world, place)
	{
		var visual = new VisualCircle(10, Color.byName("Cyan"));
		visual = new VisualWrapped(place.size, visual);
		var energySourceCollider = new Sphere(new Coords(0, 0, 0), 5);
		var returnValue = new Entity
		(
			this.name,
			[
				this,
				CollidableHelper.fromCollider(energySourceCollider),
				new Drawable(visual),
				new Locatable(new Disposition(this.pos)),
			]
		);

		return returnValue;
	}
}
