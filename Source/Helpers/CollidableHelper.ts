
class CollidableHelper
{
	static fromCollider(collider: ShapeBase): Collidable
	{
		return new Collidable(null, collider, [ Collidable.name ], null);
	}
}
