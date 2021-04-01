
class EntityExtensions
{
	static energySource(entity: Entity): EnergySource
	{
		return entity.propertyByName(EnergySource.name) as EnergySource;
	}

	static faction(entity: Entity): Faction
	{
		return entity.propertyByName(Faction.name) as Faction;
	}

	static lifeform(entity: Entity): Lifeform
	{
		return entity.propertyByName(Lifeform.name) as Lifeform;
	}

	static planet(entity: Entity): Planet
	{
		return entity.propertyByName(Planet.name) as Planet;
	}

	static ship(entity: Entity): Ship
	{
		return entity.propertyByName(Ship.name) as Ship;
	}

	static shipGroup(entity: Entity): ShipGroup
	{
		return entity.propertyByName(ShipGroup.name) as ShipGroup;
	}

	static starsystem(entity: Entity): Starsystem
	{
		return entity.propertyByName(Starsystem.name) as Starsystem;
	}

	static station(entity: Entity): Station
	{
		return entity.propertyByName(Station.name) as Station;
	}
}
