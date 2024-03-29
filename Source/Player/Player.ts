class Player
{
	name: string;
	resourceCredits: number;
	infoCredits: number;
	flagship: Flagship;
	factionsKnownNames: string[];
	shipGroup: ShipGroup;

	variableLookup: Map<string, any>;
	vars: Map<string,any>;

	_factionsAllied: Faction[];
	_factionsKnown: Faction[];
	_shipDefnsAvailable: ShipDefn[];
	_shipComponentDefnsKnown: ShipComponentDefn[];
	_shipComponentDefnsKnownBackbone: ShipComponentDefn[];

	constructor
	(
		name: string,
		resourceCredits: number,
		infoCredits: number,
		flagship: Flagship,
		factionsKnownNames: string[],
		shipGroup: ShipGroup
	)
	{
		this.name = name;
		this.resourceCredits = resourceCredits;
		this.infoCredits = infoCredits;
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
			"AcceptUserInput", Player.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		// todo - Replace this with equivalent from Framework?

		var universe = uwpe.universe;
		var world = uwpe.world;
		var place = uwpe.place;

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
			if (action != null) // Can't fire in some places.
			{
				action.perform(uwpe);
			}
		}
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

	hasInfoToSell(world: World): boolean
	{
		return this.flagship.hasInfoToSell(world);
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		var ships = this.shipGroup.ships;
		for (var i = 0; i < ships.length; i++)
		{
			var ship = ships[i];
			ship.initialize(uwpe);
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

			var world = universe.world as WorldExtended;

			var factionsAllied = this.factionsAllied(world);

			for (var i = 0; i < factionsAllied.length; i++)
			{
				var faction = factionsAllied[i];
				var shipDefn = faction.shipDefn(world);
				this._shipDefnsAvailable.push(shipDefn);
			}
		}

		return this._shipDefnsAvailable;
	}

	varGet(variableName: string): unknown
	{
		return this.vars.get(variableName);
	}

	varGetWithDefault(variableName: string, defaultValue: unknown): unknown
	{
		var variableValue = this.varGet(variableName);
		if (variableValue == null)
		{
			variableValue = defaultValue;
			this.varSet(variableName, variableValue);
		}
		return variableValue;
	}

	varSet(variableName: string, value: unknown): Player
	{
		this.vars.set(variableName, value);
		return this;
	}

	// controls

	toControlSidebar(world: WorldExtended): ControlBase
	{
		var containerFlagship = this.flagship.toControlSidebar(world);

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
