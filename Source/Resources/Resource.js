
class Resource
{
	constructor(defnName, quantity, pos)
	{
		this.defnName = defnName;
		this.quantity = quantity;
		this.pos = pos;
	}

	toEntity(world, place, resourceRadiusBase)
	{
		var resource = this;

		var resourceQuantity = resource.quantity;
		var resourceDefnName = resource.defnName;
		var resourceDefns = ResourceDefn.Instances();
		var resourceDefn = resourceDefns[resourceDefnName];

		var resourceColor = resourceDefn.color;
		var resourceGradient = new ValueBreakGroup
		([
			new ValueBreak(0, resourceColor), new ValueBreak(1, Color.byName("Black"))
		]);
		var resourceRadius = resourceRadiusBase * Math.sqrt(resourceQuantity);
		var resourceVisual = new VisualCircleGradient
		(
			resourceRadius, resourceGradient
		);
		var camera = place.camera();
		if (camera != null)
		{
			resourceVisual = new VisualWrapped(place.planet.sizeSurface, resourceVisual);
		}

		var resourcePos = resource.pos;
		var resourceCollider = new Sphere(new Coords(0, 0, 0), resourceRadius);

		var resourceEntity = new Entity
		(
			"Resource" + Math.random(),
			[
				new Item(resourceDefnName, resourceQuantity),
				new Locatable( new Disposition(resourcePos) ),
				CollidableHelper.fromCollider(resourceCollider),
				new Drawable(resourceVisual)
			]
		);

		return resourceEntity;
	}
}
