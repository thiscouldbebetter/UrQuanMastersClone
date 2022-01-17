"use strict";
class GameClock {
    constructor(gameSecondsPerRealSecond) {
        this.gameSecondsPerRealSecond = gameSecondsPerRealSecond;
    }
    toEntity() {
        return new Entity(GameClock.name, [this]);
    }
    // Clonable.
    clone() {
        return new GameClock(this.gameSecondsPerRealSecond);
    }
    overwriteWith(other) {
        this.gameSecondsPerRealSecond = other.gameSecondsPerRealSecond;
        return this;
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    updateForTimerTick(uwpe) {
        var world = uwpe.world;
        var timerHelper = uwpe.universe.timerHelper;
        var gameSecondsPerTick = this.gameSecondsPerRealSecond / timerHelper.ticksPerSecond;
        world.gameSecondsSinceStart += gameSecondsPerTick;
    }
    // Equatable.
    equals(other) {
        return (this.gameSecondsPerRealSecond == other.gameSecondsPerRealSecond);
    }
}
