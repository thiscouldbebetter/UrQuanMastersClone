
class CollidableHelper
{
	static fromCollider(collider)
	{
		return new Collidable(null, collider, [ Collidable.name ], null);
	}
}
