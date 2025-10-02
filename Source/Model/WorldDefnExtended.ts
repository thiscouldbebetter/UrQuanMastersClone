
class WorldDefnExtended extends WorldDefn
{
	factions: Faction[];
	lifeformDefns: LifeformDefn[];
	resourceDefns: ResourceDefn[];
	shipDefns: ShipDefn[];
	energySources: EnergySource[];

	factionsByName: Map<string,Faction>;
	lifeformDefnsByName: Map<string,LifeformDefn>;
	shipDefnsByName: Map<string,ShipDefn>;

	constructor
	(
		activityDefns: ActivityDefn[],
		energySources: EnergySource[],
		factions: Faction[],
		itemDefns: ItemDefn[],
		lifeformDefns: LifeformDefn[],
		placeDefns: PlaceDefn[],
		resourceDefns: ResourceDefn[],
		shipDefns: ShipDefn[]
	)
	{
		super
		(
			[
				activityDefns,
				placeDefns,
				WorldDefnExtended.itemDefnsFromResourceDefnsAndEnergySources(resourceDefns, energySources)
			]
		);

		this.energySources = energySources;
		this.factions = factions;
		this.lifeformDefns = lifeformDefns;
		this.shipDefns = shipDefns;

		itemDefns.forEach(x => this.itemDefnAdd(x) );

		this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
		this.lifeformDefnsByName = ArrayHelper.addLookupsByName(this.lifeformDefns);
		this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
	}

	static itemDefnsFromResourceDefnsAndEnergySources
	(
		resourceDefns: ResourceDefn[],
		energySources: EnergySource[]
	): ItemDefn[]
	{
		var itemDefns = new Array<ItemDefn>();
		var resourceDefnsAsItemDefns =
			resourceDefns.map(x => x.toItemDefn() );
		itemDefns.push(...resourceDefnsAsItemDefns);
		var energySourcesAsItemDefns =
			energySources
				.map(x => x.toItemDefn() )
				.filter(x => x != null);
		itemDefns.push(...energySourcesAsItemDefns);
		return itemDefns;
	}

	energySourceByName(name: string): EnergySource
	{
		return this.energySources.find(x => x.name == name);
	}

	factionByName(factionName: string): Faction
	{
		var faction = this.factionsByName.get(factionName);
		if (factionName != null && faction == null)
		{
			throw new Error("No faction found with name '" + factionName + "'.");
		}
		return faction;
	}

	lifeformDefnByName(defnName: string): LifeformDefn
	{
		return this.lifeformDefnsByName.get(defnName);
	}

	shipDefnByName(defnName: string): ShipDefn
	{
		return this.shipDefnsByName.get(defnName);
	}

	// ItemDefns.

	static itemDefn_HummingSpiral_Use(uwpe: UniverseWorldPlaceEntities): string
	{
		throw new Error("todo");
	}

	static itemDefn_ParaspacePortalProjector_Use(uwpe: UniverseWorldPlaceEntities): string
	{
		var world = uwpe.world as WorldExtended;
		var place = world.place();
		var placeTypeName = place.constructor.name;
		if (placeTypeName == PlaceHyperspace.name)
		{
			var placeHyperspace = place as PlaceHyperspace;
			var spaceOccupied = placeHyperspace.hyperspace;
			if (spaceOccupied.name != "Hyperspace")
			{
				// Do nothing.
			}
			else
			{
				var player = Playable.entityFromPlace(placeHyperspace);
				var playerPos = Locatable.of(player).pos();
				var portalPos = playerPos.clone();
				var linkPortalToParaspace = new LinkPortal
				(
					"ParaspacePortal",
					portalPos,
					"Paraspace",
					Coords.fromXY(5000, 5000)
				);
				placeHyperspace.linkPortalAdd(linkPortalToParaspace, world);
			}
		}
		return null;
	}

	static itemDefn_ShimmeringHemitrope_Use(uwpe: UniverseWorldPlaceEntities): string
	{
		throw new Error("todo");
	}

	static itemDefn_TranslucentOblong_Use(uwpe: UniverseWorldPlaceEntities): string
	{
		throw new Error("todo");
	}

}
