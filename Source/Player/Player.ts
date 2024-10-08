
class Player
{
	name: string;
	flagship: Flagship;
	shipGroup: ShipGroupFinite;
	diplomaticRelationships: DiplomaticRelationship[];

	variableLookup: Map<string, any>;
	vars: Map<string,any>;

	_factionsAllied: Faction[];
	_factionsKnown: Faction[];
	_rainbowWorldLocations: RainbowWorldLocation[];
	_shipDefnsAvailable: ShipDefn[];
	_shipComponentDefnsKnown: ShipComponentDefn[];
	_shipComponentDefnsKnownBackbone: ShipComponentDefn[];

	constructor
	(
		name: string,
		flagship: Flagship,
		shipGroup: ShipGroupFinite,
		diplomaticRelationships: DiplomaticRelationship[]
	)
	{
		this.name = name;
		this.flagship = flagship;
		this.shipGroup = shipGroup;
		this.diplomaticRelationships = diplomaticRelationships || [];

		this.variableLookup = new Map<string,any>();

		// Abbreviate for scripts.
		this.vars = this.variableLookup;

		this._rainbowWorldLocations = [];
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

	cachesReset(): void
	{
		this.flagship.cachesReset();
	}

	deviceWithNameAdd(deviceName: string): Player
	{
		this.flagship.itemHolderDevices.itemAdd(Item.fromDefnName(deviceName) );
		return this;
	}

	deviceWithNameRemove(deviceName: string): Player
	{
		this.flagship.itemHolderDevices.itemRemove(Item.fromDefnName(deviceName) );
		return this;
	}

	diplomaticRelationshipWithFaction(faction: Faction): DiplomaticRelationship
	{
		var relationship =
			this.diplomaticRelationships.find(x => x.factionOtherName = faction.name);
		if (relationship == null)
		{
			relationship = faction.diplomaticRelationshipDefaultBuild();
			this.diplomaticRelationships.push(relationship);
		}
		return relationship;
	}

	diplomaticRelationshipWithFactionIsAllied(faction: Faction): boolean
	{
		return this.diplomaticRelationshipWithFaction(faction).isAllied();
	}

	diplomaticRelationshipWithFactionIsHostile(faction: Faction): boolean
	{
		return this.diplomaticRelationshipWithFaction(faction).isHostile();
	}

	factionsAllied(world: WorldExtended): Faction[]
	{
		if (this._factionsAllied == null)
		{
			var factionsKnown = this.factionsKnown(world);
			this._factionsAllied =
				factionsKnown.filter(x => this.diplomaticRelationshipWithFactionIsAllied(x));
		}

		return this._factionsAllied;
	}

	factionsKnown(world: WorldExtended): Faction[]
	{
		if (this._factionsKnown == null)
		{
			this._factionsKnown =
				this.diplomaticRelationships.map(x => x.factionOther(world) );
		}

		return this._factionsKnown;
	}

	hasInfoCredits(): boolean
	{
		return this.flagship.hasInfoCredits();
	}

	hasInfoToSell(world: World): boolean
	{
		var returnValue =
			this.hasInfoToSell_RainbowWorldLocations()
			|| this.flagship.hasInfoToSell(world);

		return returnValue;
	}

	hasInfoToSell_RainbowWorldLocations(): boolean
	{
		return (this.rainbowWorldLocationsKnownButUnsoldCount() > 0);
	}

	hasDeviceWithName(deviceName: string): boolean
	{
		return this.flagship.hasDeviceWithName(deviceName);
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

	rainbowWorldLocationsKnownButUnsoldCount(): number
	{
		var returnValue =
			this._rainbowWorldLocations.filter(x => x.sold == false).length;
		return returnValue;
	}

	rainbowWorldLocationsSell(): void
	{
		var locationsToSell =
			this.rainbowWorldLocationsKnownButUnsoldCount();

		const infoCreditsPerLocation = 500;

		var locationsValue = locationsToSell * infoCreditsPerLocation;

		this.flagship.infoCredits += locationsValue;

		this._rainbowWorldLocations.forEach(x => x.sold = true);
	}

	rainbowWorldKnownStarsystemAdd(starsystemContainingRainbowWorld: Starsystem): void
	{
		var starsystemName = starsystemContainingRainbowWorld.name;

		var rainbowWorldIsAlreadyKnown =
			this._rainbowWorldLocations.some(x => x.starsystemName == starsystemName);

		if (rainbowWorldIsAlreadyKnown == false)
		{
			var rainbowWorldLocation = new RainbowWorldLocation(starsystemName, false);
			this._rainbowWorldLocations.push(rainbowWorldLocation);
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

	shipAdd(shipToAdd: Ship): Player
	{
		this.shipGroup.shipAdd(shipToAdd);
		return this;
	}

	shipRemove(ship: Ship): Player
	{
		this.shipGroup.shipRemove(ship);
		return this;
	}

	ships(): Ship[]
	{
		return this.shipGroup.ships;
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

	varIncrement(variableName: string): Player
	{
		var valueBefore = this.varGet(variableName) as number;
		var valueAfter = valueBefore + 1;
		this.varSet(variableName, valueAfter);
		return this;
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

class RainbowWorldLocation
{
	starsystemName: string;
	sold: boolean;

	constructor(starsystemName: string, sold: boolean)
	{
		this.starsystemName = starsystemName;
		this.sold = sold;
	}
}