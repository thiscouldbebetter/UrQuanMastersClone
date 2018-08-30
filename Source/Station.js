
function Station(name, color, radiusOuter, posAsPolar)
{
	this.name = name;
	this.color = color;
	this.radiusOuter = radiusOuter;
	this.posAsPolar = posAsPolar;
}
{
	Station.prototype.toEntity = function(primaryPos)
	{
		var pos = primaryPos.clone().add
		(
			this.posAsPolar.toCoords(new Coords())
		);

		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(this.posAsPolar.radius, null, "Gray"),
				primaryPos
			),
			new VisualRectangle(new Coords(1, 1).multiplyScalar(this.radiusOuter), this.color)
		]);

		var collider = new Sphere(pos, this.radiusOuter);

		var returnValue = new Entity
		(
			this.name,
			[
				new Modellable(this),
				new Locatable( new Location(pos) ),
				new Collidable(collider),
				new Drawable(visual)
			]
		);

		return returnValue;
	}
}