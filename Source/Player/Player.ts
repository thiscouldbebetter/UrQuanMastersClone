class Player
{
	name: string;
	credit: number;
	flagship: Flagship;
	factionsKnownNames: string[];
	shipGroup: ShipGroup;

	variableLookup: Map<string,any>;
	vars: Map<string,any>;

	_factionsAllied: Faction[];
	_factionsKnown: Faction[];
	_shipDefnsAvailable: ShipDefn[];
	_shipComponentDefnsKnown: ShipComponentDefn[];
	_shipComponentDefnsKnownBackbone: ShipComponentDefn[];

	constructor
	(
		name: string, credit: number, flagship: Flagship,
		factionsKnownNames: string[], shipGroup: ShipGroup
	)
	{
		this.name = name;
		this.credit = credit;
		this.flagship = flagship;
		this.factionsKnownNames = factionsKnownNames;
		this.shipGroup = shipGroup;

		this.variableLookup = new Map<string,any>();

		// Abbreviate for scripts.
		this.vars = this.variableLookup;
	}

	static activityDefn(): ActivityDefn
	{
		return new ActivityDefn
		(
			"AcceptUserInput",
			(universe: Universe, world: World, place: Place, entity: Entity) =>
			{
				var inputHelper = universe.inputHelper;
				var placeDefn = place.defn(world);
				var actionsByName = placeDefn.actionsByName;
				var actionToInputsMappingsByInputName =
					placeDefn.actionToInputsMappingsByInputName;
				var actionsToPerform = inputHelper.actionsFromInput
				(
					actionsByName, actionToInputsMappingsByInputName
				);
				for (var i = 0; i < actionsToPerform.length; i++)
				{
					var action = actionsToPerform[i];
					action.perform(universe, world, place, entity);
				}
			}
		);
	}

	cachesCalculate(): void
	{
		this._factionsKnown = null;

		this.flagship.cachesCalculate();
	}

	factionsAllied(world: WorldExtended): Faction[]
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

	factionsKnown(world: WorldExtended): Faction[]
	{
		if (this._factionsKnown == null)
		{
			this._factionsKnown = [];

			for (var i = 0; i < this.factionsKnownNames.length; i++)
			{
				var factionName = this.factionsKnownNames[i];
				var faction = world.defnExtended().factionByName(factionName);
				this._factionsKnown.push(faction);
			}
		}

		return this._factionsKnown;
	}

	initialize(universe: Universe, world: World, place: Place, entity: Entity): void
	{
		var ships = this.shipGroup.ships;
		for (var i = 0; i < ships.length; i++)
		{
			var ship = ships[i];
			ship.initialize(universe, world, place, entity);
		}
	}

	shipComponentDefnsKnown(): ShipComponentDefn[]
	{
		if (this._shipComponentDefnsKnown == null)
		{
			this._shipComponentDefnsKnown =
				ShipComponentDefn.Instances()._All; // todo
		}
		return this._shipComponentDefnsKnown;
	}

	shipComponentDefnsKnownBackbone(): ShipComponentDefn[]
	{
		if (this._shipComponentDefnsKnownBackbone == null)
		{
			this._shipComponentDefnsKnownBackbone = new Array<ShipComponentDefn>();
			var shipComponentDefnsKnown = this.shipComponentDefnsKnown();
			for (var i = 0; i < shipComponentDefnsKnown.length; i++)
			{
				var componentDefn = shipComponentDefnsKnown[i];
				if (componentDefn.categoryNames.indexOf("Backbone") >= 0) // todo
				{
					this._shipComponentDefnsKnownBackbone.push(componentDefn);
				}
			}
		}

		return this._shipComponentDefnsKnownBackbone;
	}

	shipsCurrentOverMax(): string
	{
		return this.shipGroup.ships.length + "/" + this.flagship.shipsMax;
	}

	shipDefnsAvailable(universe: Universe): ShipDefn[]
	{
		if (this._shipDefnsAvailable == null)
		{
			this._shipDefnsAvailable = [];

			var factionsAllied = this.factionsAllied(universe.world as WorldExtended);

			for (var i = 0; i < factionsAllied.length; i++)
			{
				var faction = factionsAllied[i];
				var shipDefnName = faction.shipDefnName;
				if (shipDefnName != null)
				{
					var shipDefn = ShipDefn.byName(shipDefnName, universe);
					this._shipDefnsAvailable.push(shipDefn);
				}
			}
		}

		return this._shipDefnsAvailable;
	}

	// controls

	toControlSidebar(world: World): ControlBase
	{
		var flagship = this.flagship;
		var containerSidebarSize = Coords.fromXY(100, 300); // hack
		var marginWidth = 8;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = Coords.fromXY(childControlWidth, fontHeight);
		var containerFlagshipSize = Coords.fromXY
		(
			containerSidebarSize.x - marginSize.x * 2,
			(containerSidebarSize.y - marginSize.x * 3) / 3
		);

		var containerFlagship = ControlContainer.from4
		(
			"containerFlagship",
			Coords.fromXY(marginSize.x, marginSize.y), // hack - pos
			containerFlagshipSize,
			// children
			[
				new ControlLabel
				(
					"labelFlagship",
					Coords.fromXY(containerFlagshipSize.x / 2, labelSize.y),
					labelSize,
					true, // isTextCentered,
					flagship.name,
					fontHeight
				),

				new ControlLabel
				(
					"labelCrew",
					Coords.fromXY(marginSize.x, labelSize.y * 2),
					labelSize,
					false, // isTextCentered
					"Crew:",
					fontHeight
				),

				new ControlLabel
				(
					"infoCrew",
					Coords.fromXY(marginSize.x * 4, labelSize.y * 2),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => c.crewCurrentOverMax()
					),
					fontHeight
				),

				new ControlLabel
				(
					"labelFuel",
					Coords.fromXY(marginSize.x, labelSize.y * 3),
					labelSize,
					false, // isTextCentered
					"Fuel:",
					fontHeight
				),

				new ControlLabel
				(
					"infoFuel",
					Coords.fromXY(marginSize.x * 4, labelSize.y * 3),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => c.fuelCurrentOverMax()
					),
					fontHeight
				),

				new ControlLabel
				(
					"labelLanders",
					Coords.fromXY(marginSize.x, labelSize.y * 4),
					labelSize,
					false, // isTextCentered
					"Landers:",
					fontHeight
				),

				new ControlLabel
				(
					"infoLanders",
					Coords.fromXY(marginSize.x * 6, labelSize.y * 4),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => c.numberOfLanders
					),
					fontHeight
				),

				new ControlLabel
				(
					"labelCargo",
					Coords.fromXY(marginSize.x, labelSize.y * 5),
					labelSize,
					false, // isTextCentered
					"Cargo:",
					fontHeight
				),

				new ControlLabel
				(
					"infoCargo",
					Coords.fromXY(marginSize.x * 5, labelSize.y * 5),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => c.cargoCurrentOverMax()
					),
					fontHeight
				),

				new ControlLabel
				(
					"labelPosition",
					Coords.fromXY(marginSize.x, labelSize.y * 6),
					labelSize,
					false, // isTextCentered
					"Pos:",
					fontHeight
				),

				new ControlLabel
				(
					"infoPosition",
					Coords.fromXY(marginSize.x * 5, labelSize.y * 6),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						this.shipGroup, (c: ShipGroup) => c.toStringPosition(world)
					),
					fontHeight
				),
			]
		);

		/*
		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			Coords.fromXY(0, 0), // hack - pos
			containerSidebarSize,
			// children
			[ containerFlagship ]
		);
		*/
		var containerSidebar = containerFlagship;

		return containerSidebar;
	}
}
