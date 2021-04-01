
class VisualWrapped implements Visual
{
	sizeToWrapTo: Coords;
	child: Visual;

	_offset: Coords;
	_posSaved: Coords;
	_tilePos: Coords;

	constructor(sizeToWrapTo: Coords, child: Visual)
	{
		this.sizeToWrapTo = sizeToWrapTo;
		this.child = child;

		this._offset = Coords.create();
		this._posSaved = Coords.create();
		this._tilePos = Coords.create();
	}

	clone(): Visual
	{
		return new VisualWrapped(this.sizeToWrapTo.clone(), this.child.clone());
	}

	overwriteWith(otherAsVisual: Visual): Visual
	{
		var other = otherAsVisual as VisualWrapped;
		this.sizeToWrapTo.overwriteWith(other.sizeToWrapTo);
		this.child.overwriteWith(other.child);
		return this;
	}

	// Transformable.

	transform(t: Transform): Transformable
	{
		return this; // todo
	}

	// Visual.

	draw(universe: Universe, world: World, place: Place, entity: Entity, display: Display)
	{
		var drawablePos = entity.locatable().loc.pos;
		this._posSaved.overwriteWith(drawablePos);

		var tilePos = this._tilePos;
		for (var y = -1; y <= 1; y++)
		{
			tilePos.y = y;

			for (var x = -1; x <= 1; x++)
			{
				tilePos.x = x;

				drawablePos.add
				(
					this._offset.overwriteWith
					(
						this.sizeToWrapTo
					).multiply
					(
						tilePos
					)
				);

				this.child.draw(universe, world, place, entity, display);

				drawablePos.overwriteWith(this._posSaved);
			}
		}
	}
}
