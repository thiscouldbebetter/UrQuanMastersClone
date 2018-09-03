
function Planet(name, color, radiusOuter, posAsPolar, sizeSurface, satellites, shipGroups)
{
	this.name = name;
	this.color = color;
	this.radiusOuter = radiusOuter;
	this.posAsPolar = posAsPolar;
	this.sizeSurface = sizeSurface;
	this.satellites = satellites;
	this.shipGroups = (shipGroups == null ? [] : shipGroups);
}
{
	Planet.Colors =
	[
		"Brown",
		"Cyan",
		"Green",
		"LightGray",
		"Orange",
		"White",
	];

	// instance methods

	Planet.prototype.toEntity = function(primaryPos)
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
			new VisualCircle(this.radiusOuter, this.color)
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

