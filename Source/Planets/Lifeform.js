"use strict";
class Lifeform extends EntityProperty {
    constructor(defnName, pos) {
        super();
        this.defnName = defnName;
        this.pos = pos;
    }
    defn(world) {
        return world.defnExtended().lifeformDefnByName(this.defnName);
    }
    toEntity(world, place) {
        var lifeformDefn = this.defn(world);
        var lifeformVisual = lifeformDefn.visual;
        lifeformVisual = new VisualWrapped(place.size, lifeformVisual);
        var lifeformCollider = new Sphere(Coords.create(), 5);
        var lifeformActivity = new Activity(lifeformDefn.activityDefn.name, null);
        var returnValue = new Entity("Lifeform" + this.defnName + Math.random(), [
            this,
            new Actor(lifeformActivity),
            CollidableHelper.fromCollider(lifeformCollider),
            Drawable.fromVisual(lifeformVisual),
            new Killable(lifeformDefn.durability, null, // ?
            (universe, world, placeAsPlace, entity) => // die
             {
                var place = placeAsPlace;
                var resource = new Resource("Biodata", 1, entity.locatable().loc.pos);
                var radius = entity.collidable().collider.radius;
                var entityResource = resource.toEntity(world, place, radius);
                place.entitiesToSpawn.push(entityResource);
            }),
            Locatable.fromPos(this.pos),
        ]);
        return returnValue;
    }
}
