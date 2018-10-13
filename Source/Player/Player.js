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
		this._factionsKnown = null;
		this._fuelMax = null;

		this.flagship.cachesInvalidate();
	}

	Player.prototype.factionsAllied = function(world)
	{
		if (this._factionsAllied == null)
		{
			this._factionsAllied = [];

			var factionsKnown = this.factionsKnown(world);
			for (var i = 0; i < factionsKnown.length; i++)
			{
				var faction = factionsKnown[i];
				if (faction.relationsWithPlayer == Faction.RelationsAllied)
				{
					this._factionsAllied.push(faction);
				}
			}
		}

		return this._factionsAllied;
	}

	Player.prototype.factionsKnown = function(world)
	{
		if (this._factionsKnown == null)
		{
			this._factionsKnown = [];

			for (var i = 0; i < this.factionsKnownNames.length; i++)
			{
				var factionName = this.factionsKnownNames[i];
				var faction = world.defns.factions[factionName];
				this._factionsKnown.push(faction);
			}
		}

		return this._factionsKnown;
	}

	Player.prototype.initialize = function(universe, world)
	{
		var ships = this.shipGroup.ships;
		for (var i = 0; i < ships.length; i++)
		{
			var ship = ships[i];
			ship.initialize(universe, world);
		}
	}

	Player.prototype.shipComponentDefnsKnown = function()
	{
		if (this._shipComponentDefnsKnown == null)
		{
			this._shipComponentDefnsKnown =
				ShipComponentDefn.Instances()._All; // todo
		}
		return this._shipComponentDefnsKnown;
	}

	Player.prototype.shipComponentDefnsKnownBackbone = function()
	{
		if (this._shipComponentDefnsKnownBackbone == null)
		{
			this._shipComponentDefnsKnownBackbone = [];
			var shipComponentDefnsKnown = this.shipComponentDefnsKnown();
			for (var i = 0; i < shipComponentDefnsKnown.length; i++)
			{
				var componentDefn = shipComponentDefnsKnown[i];
				if (componentDefn.categories.contains("Backbone")) // todo
				{
					this._shipComponentDefnsKnownBackbone.push(componentDefn);
				}
			}
		}

		return this._shipComponentDefnsKnownBackbone;
	}

	Player.prototype.shipsCurrentOverMax = function()
	{
		return this.shipGroup.ships.length + "/" + this.flagship.shipsMax;
	}

	Player.prototype.shipDefnsAvailable = function(universe)
	{
		if (this._shipDefnsAvailable == null)
		{
			this._shipDefnsAvailable = [];

			var factionsAllied = this.factionsAllied(universe.world);
			var shipDefnsAll = ShipDefn.Instances(universe);

			for (var i = 0; i < factionsAllied.length; i++)
			{
				var faction = factionsAllied[i];
				var shipDefnName = faction.shipDefnName;
				if (shipDefnName != null)
				{
					var shipDefn = shipDefnsAll[shipDefnName];
					this._shipDefnsAvailable.push(shipDefn);
				}
			}
		}

		return this._shipDefnsAvailable;
	}

	// controls

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
