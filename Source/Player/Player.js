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
	Player.prototype.cachesCalculate = function()
	{
		this._factionsKnown = null;

		this.flagship.cachesCalculate();
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

	Player.prototype.toControlSidebar = function(world)
	{
		var flagship = this.flagship;
		var containerSidebarSize = new Coords(100, 300); // hack
		var marginWidth = 8;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = new Coords(childControlWidth, fontHeight);
		var containerFlagshipSize = new Coords
		(
			containerSidebarSize.x - marginSize.x * 2,
			(containerSidebarSize.y - marginSize.x * 3) / 3
		);

		var containerFlagship = new ControlContainer
		(
			"containerFlagship",
			new Coords(marginSize.x, marginSize.y), // hack - pos
			containerFlagshipSize,
			// children
			[
				new ControlLabel
				(
					"labelFlagship",
					new Coords(containerFlagshipSize.x / 2, labelSize.y),
					labelSize,
					true, // isTextCentered,
					flagship.name,
					fontHeight
				),

				new ControlLabel
				(
					"labelCrew",
					new Coords(marginSize.x, labelSize.y * 2),
					labelSize,
					false, // isTextCentered
					"Crew:",
					fontHeight
				),

				new ControlLabel
				(
					"infoCrew",
					new Coords(marginSize.x * 4, labelSize.y * 2),
					labelSize,
					false, // isTextCentered
					new DataBinding(flagship, function get(c) { return c.crewCurrentOverMax(); } ),
					fontHeight
				),

				new ControlLabel
				(
					"labelFuel",
					new Coords(marginSize.x, labelSize.y * 3),
					labelSize,
					false, // isTextCentered
					"Fuel:",
					fontHeight
				),

				new ControlLabel
				(
					"infoFuel",
					new Coords(marginSize.x * 4, labelSize.y * 3),
					labelSize,
					false, // isTextCentered
					new DataBinding(flagship, function get(c) { return c.fuelCurrentOverMax(); } ),
					fontHeight
				),

				new ControlLabel
				(
					"labelLanders",
					new Coords(marginSize.x, labelSize.y * 4),
					labelSize,
					false, // isTextCentered
					"Landers:",
					fontHeight
				),

				new ControlLabel
				(
					"infoLanders",
					new Coords(marginSize.x * 6, labelSize.y * 4),
					labelSize,
					false, // isTextCentered
					new DataBinding(flagship, function get(c) { return c.numberOfLanders; } ),
					fontHeight
				),

				new ControlLabel
				(
					"labelCargo",
					new Coords(marginSize.x, labelSize.y * 5),
					labelSize,
					false, // isTextCentered
					"Cargo:",
					fontHeight
				),

				new ControlLabel
				(
					"infoCargo",
					new Coords(marginSize.x * 5, labelSize.y * 5),
					labelSize,
					false, // isTextCentered
					new DataBinding(flagship, function get(c) { return c.cargoCurrentOverMax(); } ),
					fontHeight
				),

				new ControlLabel
				(
					"labelPosition",
					new Coords(marginSize.x, labelSize.y * 6),
					labelSize,
					false, // isTextCentered
					"Pos:",
					fontHeight
				),

				new ControlLabel
				(
					"infoPosition",
					new Coords(marginSize.x * 5, labelSize.y * 6),
					labelSize,
					false, // isTextCentered
					new DataBinding(this.shipGroup, function get(c) { return c.toStringPosition(world); } ),
					fontHeight
				),
			]
		);

		/*
		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(0, 0), // hack - pos
			containerSidebarSize,
			// children
			[ containerFlagship ]
		);
		*/
		var containerSidebar = containerFlagship;

		return containerSidebar;
	}
}
