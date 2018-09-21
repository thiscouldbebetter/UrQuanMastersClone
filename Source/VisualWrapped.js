
function VisualWrapped(sizeToWrapTo, child)
{
	this.sizeToWrapTo = sizeToWrapTo;
	this.child = child;

	this._offset = new Coords();
	this._posSaved = new Coords();
	this._tilePos = new Coords();
}

{
	VisualWrapped.prototype.draw = function(universe, world, display, drawable, entity)
	{
		var drawablePos = drawable.loc.pos;
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

				this.child.draw(universe, world, display, drawable, entity);

				drawablePos.overwriteWith(this._posSaved);
			}
		}
	}
}
