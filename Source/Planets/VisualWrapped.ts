
class VisualWrapped2 extends VisualBase<VisualWrapped2>
{
	sizeToWrapTo: Coords;
	child: Visual;

	_offset: Coords;
	_posSaved: Coords;
	_tilePos: Coords;

	constructor(sizeToWrapTo: Coords, child: Visual)
	{
		super();

		this.sizeToWrapTo = sizeToWrapTo;
		this.child = child;

		this._offset = Coords.create();
		this._posSaved = Coords.create();
		this._tilePos = Coords.create();
	}

	clone(): VisualWrapped2
	{
		return new VisualWrapped2(this.sizeToWrapTo.clone(), this.child.clone());
	}

	overwriteWith(otherAsVisual: Visual): VisualWrapped2
	{
		var other = otherAsVisual as VisualWrapped2;
		this.sizeToWrapTo.overwriteWith(other.sizeToWrapTo);
		this.child.overwriteWith(other.child);
		return this;
	}

	// Transformable.

	transform(t: TransformBase): VisualWrapped2
	{
		return this; // todo
	}

	// Visual.

	draw(uwpe: UniverseWorldPlaceEntities, display: Display): void
	{
		var entity = uwpe.entity;

		var drawablePos = Locatable.of(entity).loc.pos;
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

				this.child.draw(uwpe, display);

				drawablePos.overwriteWith(this._posSaved);
			}
		}
	}

	initialize(): void {}
	initializeIsComplete(): boolean { return true; }
}
