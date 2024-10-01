
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
		factions: Faction[],
		lifeformDefns: LifeformDefn[],
		placeDefns: PlaceDefn[],
		resourceDefns: ResourceDefn[],
		shipDefns: ShipDefn[],
		energySources: EnergySource[]
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

		this.factions = factions;
		this.lifeformDefns = lifeformDefns;
		this.shipDefns = shipDefns;
		this.energySources = energySources;

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
		return this.factionsByName.get(factionName);
	}

	lifeformDefnByName(defnName: string): LifeformDefn
	{
		return this.lifeformDefnsByName.get(defnName);
	}

	shipDefnByName(defnName: string): ShipDefn
	{
		return this.shipDefnsByName.get(defnName);
	}
}
