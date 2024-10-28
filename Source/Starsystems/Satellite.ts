
interface Satellite
{
	offsetFromPrimaryAsPolar: Polar;
	toEntityForPlanetVicinity(world: WorldExtended, isPrimary: boolean, primaryPos: Coords, orbitColor: Color, entityDimension: number): Entity
	toEntityForStarsystem(world: WorldExtended, primary: Planet, pos: Coords): Entity;
}
