
class FactionTerritory
{
	shape: ShapeBase;

	_disabled: boolean;

	constructor(shape: ShapeBase)
	{
		this.shape = shape;

		this._disabled = false;
	}

	disable(): FactionTerritory
	{
		this._disabled = true;
		return this;
	}

	disabled(): boolean
	{
		return this._disabled;
	}

	enable(): FactionTerritory
	{
		this._disabled = false;
		return this;
	}

	enabled(): boolean
	{
		return (this._disabled == false);
	}

}
