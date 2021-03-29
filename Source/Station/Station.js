
class Station
{
	constructor(name, color, radiusOuter, factionName, posAsPolar)
	{
		this.name = name;
		this.color = color;
		this.radiusOuter = radiusOuter;
		this.factionName = factionName;
		this.posAsPolar = posAsPolar;
	}

	faction(world)
	{
		return world.defn.factionByName(this.factionName);
	}

	toEntity(primaryPos)
	{
		var pos = primaryPos.clone().add
		(
			this.posAsPolar.toCoords(new Coords())
		);

		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(this.posAsPolar.radius, null, Color.byName("Gray")),
				primaryPos
			),
			new VisualRectangle(new Coords(1, 1).multiplyScalar(this.radiusOuter), this.color)
		]);

		var collider = new Sphere(new Coords(0, 0, 0), this.radiusOuter);

		var returnValue = new Entity
		(
			this.name,
			[
				CollidableHelper.fromCollider(collider),
				new Drawable(visual),
				new Locatable( new Disposition(pos) ),
				this
			]
		);

		return returnValue;
	}
}
