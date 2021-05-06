
class EnergySource implements EntityProperty
{
	name: string;
	pos: Coords;
	visual: Visual;
	collideWithLander: any;

	constructor(name: string, pos: Coords, visual: Visual, collideWithLander: any)
	{
		this.name = name;
		this.pos = pos;
		this.visual = visual;
		this.collideWithLander = collideWithLander;
	}

	toEntity(world: WorldExtended, place: Place)
	{
		var visual: Visual =
			VisualCircle.fromRadiusAndColorFill(10, Color.byName("Cyan"));
		visual = new VisualWrapped(place.size, visual);
		var energySourceCollider = new Sphere(Coords.create(), 5);
		var returnValue = new Entity
		(
			this.name,
			[
				this,
				CollidableHelper.fromCollider(energySourceCollider),
				Drawable.fromVisual(visual),
				Locatable.fromPos(this.pos),
			]
		);

		return returnValue;
	}

	// EntityProperty.

	finalize(u: Universe, w: World, p: Place, e: Entity): void {}

	initialize(u: Universe, w: World, p: Place, e: Entity): void {}

	updateForTimerTick(u: Universe, w: World, p: Place, e: Entity): void {}
}
