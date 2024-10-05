
interface Satellite
{
	posAsPolar: Polar;
	toEntityForPlanetVicinity(world: WorldExtended, isPrimary: boolean, primaryPos: Coords, entityDimension: number): Entity
	toEntityForStarsystem(world: WorldExtended, primary: Planet, pos: Coords): Entity;
}
