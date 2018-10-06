function Player(name, credit, flagship, factionsKnownNames, shipGroup)
{
	this.name = name;
	this.credit = credit;
	this.flagship = flagship;
	this.factionsKnownNames = factionsKnownNames;
	this.shipGroup = shipGroup;

	this.variableLookup = {};

	// Abbreviate for scripts.
	this.vars = this.variableLookup;
}

{
	Player.prototype.cachesInvalidate = function()
	{
		this._fuelMax = null;
		this._flagshipComponents = null;
	}

	Player.prototype.componentsCurrentOverMax = function()
	{
		return this.flagship.componentNames.length + "/" + this.flagship.componentsMax;
	}

	Player.prototype.shipsCurrentOverMax = function()
	{
		return this.shipGroup.ships.length + "/" + this.flagship.shipsMax;
	}

	Player.prototype.toControlSidebar = function()
	{
		var containerSidebarSize = new Coords(100, 300); // hack
		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 16;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = new Coords(childControlWidth, fontHeight);

		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0), // hack - pos
			containerSidebarSize,
			// children
			[
				new ControlLabel
				(
					"labelFlagship",
					new Coords(containerSidebarSize.x / 2, marginSize.y + labelSize.y / 2),
					labelSize,
					true, // isTextCentered,
					"Flagship",
					fontHeight
				),

				new ControlContainer
				(
					"containerShipImage",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y), // pos
					new Coords(1, 2).multiplyScalar(childControlWidth),
					[
						// todo
					]// children
				),
			]
		);

		return containerSidebar;
	}
}
