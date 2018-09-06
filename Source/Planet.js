
function Planet(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites, shipGroups)
{
	this.name = name;
	this.defnName = defnName;
	this.radiusOuter = radiusOuter;
	this.posAsPolar = posAsPolar;
	this.sizeSurface = sizeSurface;
	this.satellites = satellites;
	this.shipGroups = (shipGroups == null ? [] : shipGroups);

	var defn = this.defn();
	this.hasLife = (Math.random() <= defn.lifeChance);
}
{
	// instance methods

	Planet.prototype.defn = function()
	{
		return PlanetDefn.Instances()._All[this.defnName];
	}

	Planet.prototype.toEntity = function(primaryPos)
	{
		var pos = primaryPos.clone().add
		(
			this.posAsPolar.toCoords(new Coords())
		);

		var planetDefn = this.defn();
		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(this.posAsPolar.radius, null, "Gray"),
				primaryPos
			),
			new VisualCircle(this.radiusOuter, planetDefn.color)
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

