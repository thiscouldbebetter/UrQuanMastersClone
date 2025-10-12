
class CameraHelper
{
	static toEntity(camera: Camera)
	{
		var viewColliderSize = camera.viewSize.clone();
		viewColliderSize.z = Number.POSITIVE_INFINITY;
		var viewCollider = BoxAxisAligned.fromSize(viewColliderSize);
		var collidable =
			Collidable
				.fromCollider(viewCollider)
				.exemptFromCollisionEffectsOfOtherSet(true);
		var boundable = new Boundable(viewCollider.clone());
		var locatable = Locatable.fromDisposition(camera.loc);
		var movable = Movable.default();
		return Entity.fromNameAndProperties
		(
			Camera.name,
			[
				camera,
				boundable,
				collidable,
				locatable,
				movable
			]
		);
	}
}
