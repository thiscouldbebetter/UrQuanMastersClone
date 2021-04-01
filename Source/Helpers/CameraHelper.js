"use strict";
class CameraHelper {
    static toEntity(camera) {
        var viewColliderSize = camera.viewSize.clone();
        viewColliderSize.z = Number.POSITIVE_INFINITY;
        var viewCollider = new Box(Coords.create(), viewColliderSize);
        var collidable = Collidable.fromCollider(viewCollider);
        var boundable = new Boundable(viewCollider.clone());
        var locatable = new Locatable(camera.loc);
        return new Entity(Camera.name, [
            camera,
            boundable,
            collidable,
            locatable
        ]);
    }
}
