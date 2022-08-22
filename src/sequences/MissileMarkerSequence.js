import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export function MissileMarkerSequence(effectOptions, target, index, type) {
    let markerAnim = `${effectOptions.targetMarkerType}.${effectOptions.targetMarkerColor}`;
    const markerSound = effectOptions.markerSound ?? "";
    const markerSoundDelay = Number(effectOptions.markerSoundDelay) ?? 0;
    const markerSoundVolume = Number(effectOptions.markerVolume) ?? 1;
    const markerAnimHue = effectOptions.targetMarkerHue ?? 0;
    const markerAnimSaturation = effectOptions.targetMarkerSaturation ?? 0;
    let baseScale = effectOptions.baseScale;
    let baseOffset = canvas.grid.size / 2;
    let offsetMod = (-(1 / 4) * index) + 1;
    let offset = { x: baseOffset * offsetMod, y: baseOffset };
    let markerSeq = new Sequence("Advanced Spell Effects")
            .sound()
            .file(markerSound)
            .delay(markerSoundDelay)
            .volume(markerSoundVolume)
            .playIf(markerSound != "")
            .effect()
            .attachTo(target, { followRotation: false })
            .filter("ColorMatrix", { hue: markerAnimHue, saturate: markerAnimSaturation })
            .locally()
            .file(markerAnim)
            .scale(0.01)
            .name(`missile-target-${target.id}-${index}`)
            .offset(offset)
            .persist()
            .animateProperty("sprite", "scale.x", { from: 0.01, to: baseScale, delay: 200, duration: 700, ease: "easeOutBounce" })
            .animateProperty("sprite", "scale.y", { from: 0.01, to: baseScale, duration: 900, ease: "easeOutBounce" })
    if (type == 'advantage') {
        markerSeq.loopProperty("sprite", "position.y", { from: 0, to: -10, duration: 1000, ease: "easeInOutSine", pingPong: true });

    }
    else if (type == 'disadvantage') {
        markerSeq.loopProperty("sprite", "position.y", { from: 0, to: 10, duration: 1000, ease: "easeInOutSine", pingPong: true });
    }
    return markerSeq;
}