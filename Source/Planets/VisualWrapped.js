"use strict";
class VisualWrapped {
    constructor(sizeToWrapTo, child) {
        this.sizeToWrapTo = sizeToWrapTo;
        this.child = child;
        this._offset = Coords.create();
        this._posSaved = Coords.create();
        this._tilePos = Coords.create();
    }
    clone() {
        return new VisualWrapped(this.sizeToWrapTo.clone(), this.child.clone());
    }
    overwriteWith(otherAsVisual) {
        var other = otherAsVisual;
        this.sizeToWrapTo.overwriteWith(other.sizeToWrapTo);
        this.child.overwriteWith(other.child);
        return this;
    }
    // Transformable.
    transform(t) {
        return this; // todo
    }
    // Visual.
    draw(uwpe, display) {
        var entity = uwpe.entity;
        var drawablePos = entity.locatable().loc.pos;
        this._posSaved.overwriteWith(drawablePos);
        var tilePos = this._tilePos;
        for (var y = -1; y <= 1; y++) {
            tilePos.y = y;
            for (var x = -1; x <= 1; x++) {
                tilePos.x = x;
                drawablePos.add(this._offset.overwriteWith(this.sizeToWrapTo).multiply(tilePos));
                this.child.draw(uwpe, display);
                drawablePos.overwriteWith(this._posSaved);
            }
        }
    }
}
