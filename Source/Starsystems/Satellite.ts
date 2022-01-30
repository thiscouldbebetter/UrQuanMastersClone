
interface Satellite
{
	posAsPolar: Polar;
	toEntity(primary: Planet, pos: Coords): Entity;
}
