function Player(name, credit, flagshipComponentsMax, flagshipComponentNames, numberOfLanders, fuel, items, shipsMax, factionsKnownNames, shipGroup)
{
	this.name = name;
	this.credit = credit;
	this.flagshipComponentsMax = flagshipComponentsMax;
	this.flagshipComponentNames = flagshipComponentNames;
	this.numberOfLanders = numberOfLanders;
	this.fuel = fuel;
	this.itemHolder = new ItemHolder(items);
	this.shipsMax = shipsMax;
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
		return this.flagshipComponentNames.length + "/" + this.flagshipComponentsMax;
	}

	Player.prototype.flagshipComponents = function()
	{
		if (this._flagshipComponents == null)
		{
			this._flagshipComponents = [];

			var componentDefns = ShipComponentDefn.Instances()._All;

			var componentNames = this.flagshipComponentNames;
			for (var i = 0; i < componentNames.length; i++)
			{
				var componentName = componentNames[i];
				var component = componentDefns[componentName];
				this._flagshipComponents.push(component);
			}
		}

		return this._flagshipComponents;
	}

	Player.prototype.fuelCurrentOverMax = function()
	{
		return this.fuel + "/" + this.fuelMax();
	}

	Player.prototype.fuelMax = function()
	{
		if (this._fuelMax == null)
		{
			this._fuelMax = 0;
			var components = this.flagshipComponents();
			for (var i = 0; i < components.length; i++)
			{
				var component = components[i];
				component.applyToPlayer(this);
			}
		}
		return this._fuelMax;
	}

	Player.prototype.shipsCurrentOverMax = function()
	{
		return this.shipGroup.ships.length + "/" + this.shipsMax;
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
