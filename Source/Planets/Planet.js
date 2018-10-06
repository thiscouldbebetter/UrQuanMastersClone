
function Planet(name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites, shipGroups, tectonics, weather, temperature, resources, hasLife)
{
	this.name = name;
	this.defnName = defnName;
	this.radiusOuter = radiusOuter;
	this.posAsPolar = posAsPolar;
	this.sizeSurface = sizeSurface;
	this.satellites = satellites;
	this.shipGroups = (shipGroups == null ? [] : shipGroups);
	this.tectonics = tectonics;
	this.weather = weather;
	this.temperature = temperature;
	this.resources = resources;
	this.hasLife = hasLife;
}
{
	// instance methods

	Planet.prototype.defn = function()
	{
		return PlanetDefn.Instances()[this.defnName];
	}

	Planet.prototype.lifeformsGenerate = function()
	{
		this.lifeforms = [];

		if (this.hasLife == true)
		{
			var numberOfLifeforms = 8; // todo
			for (var i = 0; i < numberOfLifeforms; i++)
			{
				var lifeformPos =
					new Coords().randomize().multiply(this.sizeSurface);
				var lifeform = new Lifeform("BiteyMouse", lifeformPos);
				this.lifeforms.push(lifeform);
			}
		}

		return this.lifeforms;
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
				this, // planet
				new Locatable( new Location(pos) ),
				new Collidable(collider),
				new Drawable(visual)
			]
		);

		return returnValue;
	}

	// controls

	Planet.prototype.toControlSidebar = function(universe)
	{
		var containerSidebarSize = new Coords(100, 300); // hack
		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = new Coords(childControlWidth, fontHeight);
		var minimapSize = new Coords(1, .5).multiplyScalar(childControlWidth);
		var containerLanderSize = new Coords(1, 2).multiplyScalar(childControlWidth);

		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0), // hack - pos
			containerSidebarSize,
			// children
			[
				new ControlLabel
				(
					"labelMap",
					new Coords(marginSize.x, marginSize.y),
					labelSize,
					false, // isTextCentered,
					"Map:",
					fontHeight
				),


				new ControlContainer
				(
					"containerMap",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y), // pos
					minimapSize,
					[
						new ControlVisual
						(
							"visualMap",
							new Coords(0, 0),
							minimapSize,
							new VisualRectangle(minimapSize, "Gray")
						)
					]
				),

				new ControlLabel
				(
					"labelLander",
					new Coords(marginSize.x, marginSize.y * 3 + labelSize.y + minimapSize.y),
					labelSize,
					false, // isTextCentered,
					"Lander:",
					fontHeight
				),

				new ControlContainer
				(
					"containerLander",
					new Coords
					(
						marginSize.x,
						marginSize.y * 4 + labelSize.y * 2 + minimapSize.y
					), // pos
					containerLanderSize,
					[
						// todo
					]// children
				),

				new ControlButton
				(
					"buttonLeave",
					new Coords
					(
						marginSize.x,
						marginSize.y * 5 + labelSize.y * 2 + minimapSize.y + containerLanderSize.y
					), // pos
					new Coords(containerLanderSize.x, labelSize.y * 2),
					"Launch",
					fontHeight,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{},
					null // contextForClick
				),

			]
		);

		return containerSidebar;
	}
}
