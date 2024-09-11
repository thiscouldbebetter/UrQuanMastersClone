
interface Satellite
{
	posAsPolar: Polar;
	toEntity(world: WorldExtended, primary: Planet, pos: Coords): Entity;
}
