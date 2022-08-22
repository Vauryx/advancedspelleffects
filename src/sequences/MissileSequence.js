import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export function MissileSequence(data) {
    //caster, target, effectOptions, hit, type
    const caster = data.caster;
    const target = data.targets[0] ?? false;
    const effectOptions = data.effectOptions ?? {};
    const hit = data.hit ?? false;
    let intro = data.intro ?? false;
    const missileIntroSound = effectOptions.missileIntroSound ?? "";
    const missleIntroPlayback = effectOptions.missileIntroSoundPlayback ?? "indiv";
    let missileIntroSoundDelay = Number(effectOptions.missileIntroSoundDelay) ?? 0;
    let missileIntroVolume = Number(effectOptions.missileIntroVolume) ?? 1;

    const impactDelay = Number(effectOptions.impactDelay) ?? -1000;
    const missileImpactSound = effectOptions.missileImpactSound ?? "";
    const missleImpactPlayback = effectOptions.missileImpactSoundPlayback ?? "indiv";
    let missileImpactSoundDelay = Number(effectOptions.missileImpactSoundDelay) ?? 0;
    let missileImpactVolume = Number(effectOptions.missileImpactVolume) ?? 1;

    let missileAnim = `${effectOptions.missileAnim}.${effectOptions.missileColor}`;

    let missileSequence;
    if(intro){
        missileSequence = new Sequence("Advanced Spell Effects")
                            .sound()
                            .file(missileIntroSound)
                            .delay(missileIntroSoundDelay)
                            .volume(missileIntroVolume)
                            .playIf(missileIntroSound != "" && missleIntroPlayback == "group")
    } else {
        missileSequence = new Sequence("Advanced Spell Effects")
                            .sound()
                            .file(missileIntroSound)
                            .delay(missileIntroSoundDelay)
                            .volume(missileIntroVolume)
                            .playIf(missileIntroSound != "" && missleIntroPlayback == "indiv")
                            .effect()
                            .file(missileAnim)
                            .atLocation(caster)
                            .randomizeMirrorY()
                            .missed(!hit)
                            .stretchTo(target)
                            .randomOffset(0.65)
                            //.playbackRate(utilFunctions.getRandomNumber(0.7, 1.3))
                            .waitUntilFinished(impactDelay)
                            .sound()
                            .file(missileImpactSound)
                            .delay(missileImpactSoundDelay)
                            .volume(missileImpactVolume)
                            .playIf(missileImpactSound != "")
    }
    return missileSequence;
    
}