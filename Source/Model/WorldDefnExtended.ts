
class WorldDefnExtended extends WorldDefn
{
	factions: Faction[];
	lifeformDefns: LifeformDefn[];
	resourceDefns: ResourceDefn[];
	shipDefns: ShipDefn[];

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
		shipDefns: ShipDefn[]
	)
	{
		super
		(
			[
				activityDefns,
				resourceDefns.map(x => x.toItemDefn()),
				placeDefns
			]
		);

		this.factions = factions;
		this.lifeformDefns = lifeformDefns;
		this.shipDefns = shipDefns;

		this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
		this.lifeformDefnsByName = ArrayHelper.addLookupsByName(this.lifeformDefns);
		this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
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
