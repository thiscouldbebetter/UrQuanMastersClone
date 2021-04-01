
class ShipWeaponSlot
{
	name: string;
	componentInstalledIndex: number;

	constructor(name: string, componentInstalledIndex: number)
	{
		this.name = name;
		this.componentInstalledIndex = componentInstalledIndex;
	}

	static _instances: ShipWeaponSlot_Instances;
	static Instances(): ShipWeaponSlot_Instances
	{
		if (ShipWeaponSlot._instances == null)
		{
			ShipWeaponSlot._instances = new ShipWeaponSlot_Instances();
		}

		return ShipWeaponSlot._instances;
	}

	// instance methods

	componentInstalled(ship: Ship): ShipComponentDefn
	{
		return null; // todo
	}

	nameAndComponentInstalled(): string
	{
		var componentInstalled = this.componentInstalled;
		var componentInstalledName =
			(componentInstalled == null ? "[none]" : componentInstalled.name);
		var returnValue = this.name + ": " + componentInstalledName;
		return returnValue;
	}
}

class ShipWeaponSlot_Instances
{
	Forward: ShipWeaponSlot;
	Oblique: ShipWeaponSlot;
	Lateral: ShipWeaponSlot;
	Rear: ShipWeaponSlot;

	_All: ShipWeaponSlot[];
	_AllByName: Map<string,ShipWeaponSlot>;

	constructor()
	{
		this.Forward = new ShipWeaponSlot("Forward", null);
		this.Oblique = new ShipWeaponSlot("Oblique", null);
		this.Lateral = new ShipWeaponSlot("Lateral", null);
		this.Rear = new ShipWeaponSlot("Rear", null);

		this._All =
		[
			this.Forward,
			this.Oblique,
			this.Lateral,
			this.Rear
		]
		this._AllByName = ArrayHelper.addLookupsByName(this._All);
	}
}

