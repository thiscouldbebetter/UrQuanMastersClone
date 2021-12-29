"use strict";
class LifeformDefn {
    constructor(name, durability, speed, damagePerAttack, value, visual, activityDefnName) {
        this.name = name;
        this.durability = durability;
        this.speed = speed;
        this.damagePerAttack = damagePerAttack;
        this.value = value;
        this.visual = visual;
        this.activityDefnName = activityDefnName;
    }
    static Instances() {
        if (LifeformDefn._instances == null) {
            LifeformDefn._instances = new LifeformDefn_Instances();
        }
        return LifeformDefn._instances;
    }
}
class LifeformDefn_Instances {
    constructor() {
        var lifeformDimension = 10;
        var ld = LifeformDefn;
        var visual = (colorFill, colorBorder) => {
            return new VisualRectangle(Coords.fromXY(1, 1).multiplyScalar(lifeformDimension), colorFill, colorBorder, null);
        };
        var r = Color.byName("Red");
        //var o = Color.byName("Orange");
        var y = Color.byName("Yellow");
        var g = Color.byName("Green");
        var b = Color.byName("Blue");
        var v = Color.byName("Violet");
        //var a = Color.byName("Gray");
        var w = Color.byName("White");
        var k = Color.byName("Black");
        var n = Color.byName("Brown");
        var c = Color.byName("Cyan");
        var p = Color.byName("Pink");
        var activityDefnAvoid = Lifeform.activityDefnAvoidPlayer().name;
        var activityDefnNone = Lifeform.activityDefnDoNothing().name;
        var activityDefnPursue = Lifeform.activityDefnApproachPlayer().name;
        var activityDefnWander = Lifeform.activityDefnMoveToRandomPosition().name;
        this._All =
            [
                // name				hp,sp,dm,val
                new ld("RadarBlossom", 1, 0, 0, 1, visual(r, g), activityDefnNone),
                new ld("LavaPool", 1, 0, 0, 6, visual(r, p), activityDefnNone),
                new ld("SquirtPod", 1, 0, 1, 3, visual(g, r), activityDefnNone),
                new ld("ClapperBush", 3, 0, 2, 5, visual(n, g), activityDefnNone),
                new ld("CarouselTree", 10, 0, 0, 1, visual(y, g), activityDefnNone),
                new ld("BlueTube", 2, 1, 0, 1, visual(b, c), activityDefnWander),
                new ld("BrassNeedler", 5, 1, 0, 8, visual(y, w), activityDefnPursue),
                new ld("CreepingBean", 2, 1, 1, 2, visual(w, v), activityDefnPursue),
                new ld("LightningAnemone", 8, 1, 2, 3, visual(b, w), activityDefnWander),
                new ld("Radiooculopod", 15, 1, 3, 10, visual(b, w), activityDefnWander),
                new ld("SwarmsOfThings", 3, 2, 1, 3, visual(k, y), activityDefnPursue),
                new ld("ElasticSphere", 1, 2, 0, 2, visual(g, g), activityDefnAvoid),
                new ld("TriopticSquid", 2, 2, 1, 2, visual(r, w), activityDefnWander),
                new ld("LeapingLizard", 6, 2, 2, 4, visual(r, w), activityDefnWander),
                new ld("BloodyBathmat", 12, 2, 3, 9, visual(r, w), activityDefnWander),
                new ld("BiteyMouse", 1, 3, 1, 3, visual(n, p), activityDefnPursue),
                new ld("SmushedDuckling", 1, 3, 0, 1, visual(r, g), activityDefnAvoid),
                new ld("FungusAmungus", 8, 3, 2, 7, visual(b, v), activityDefnPursue),
                new ld("WaddleEye", 2, 3, 1, 15, visual(g, w), activityDefnAvoid),
                new ld("SpuriousEaglet", 1, 3, 1, 1, visual(w, r), activityDefnAvoid),
                new ld("CottonyCandycane", 2, 1, 1, 6, visual(r, w), activityDefnWander),
                new ld("BulgingEyeworm", 2, 1, 1, 4, visual(p, v), activityDefnAvoid),
                new ld("PopperUpper", 5, 0, 1, 8, visual(w, v), activityDefnNone),
                new ld("BioDecoy", 1, 0, 0, 0, visual(w, v), activityDefnWander),
                new ld("MauluskaGourmand", 1, 0, 3, 1, visual(n, w), activityDefnNone),
                new ld("FreakyBeast", 15, 3, 3, 15, visual(n, p), activityDefnPursue),
            ];
    }
}
