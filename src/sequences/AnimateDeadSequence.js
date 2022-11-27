import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export async function AnimateDeadSequence(effectSettings, token, summonTokenData) {

    console.log('ASE Animate Dead Sequence: ', effectSettings);
    const colorA = effectSettings.effectAColor ?? 'green';
    const soundA = effectSettings.effectASound ?? "";
    const soundADelay = Number(effectSettings.effectASoundDelay) ?? 0;
    const soundAVolume = effectSettings.effectASoundVolume === "" ? 1 : Number(effectSettings.effectASoundVolume);

    const colorB = effectSettings.effectBColor;
    const soundB = effectSettings.effectBSound ?? "";
    const soundBDelay = Number(effectSettings.effectBSoundDelay) ?? 0;
    const soundBVolume = effectSettings.effectBSoundVolume === "" ? 1 : Number(effectSettings.effectBSoundVolume);

    const schoolName = effectSettings.magicSchool;
    const schoolColor = effectSettings.magicSchoolColor;
    const schoolSound = effectSettings.magicSchoolSound ?? "";
    const SchoolSoundDelay = Number(effectSettings.magicSchoolSoundDelay) ?? 0;
    const schoolVolume = effectSettings.magicSchoolVolume === "" ? 1 : Number(effectSettings.magicSchoolVolume);

    const schoolSoundOutro = effectSettings.magicSchoolSoundOutro ?? "";
    const schoolSoundDelayOutro = Number(effectSettings.magicSchoolSoundDelayOutro) ?? 0;
    const schoolVolumeOutro = effectSettings.magicSchoolVolumeOutro === "" ? 1 : Number(effectSettings.magicSchoolVolumeOutro);


    // console.log("Corpse to Mutate: ", corpseDoc);
    let animLoc = utilFunctions.getCenter(token);
    let portalAnimIntro = `jb2a.magic_signs.circle.02.${schoolName}.intro.${schoolColor}`;
    let portalAnimLoop = `jb2a.magic_signs.circle.02.${schoolName}.loop.${schoolColor}`;
    let portalAnimOutro = `jb2a.magic_signs.circle.02.${schoolName}.outro.${schoolColor}`;
    let effectAAnim = `jb2a.eldritch_blast.${colorA}.05ft`;
    let effectBAnim = `jb2a.energy_strands.complete.${colorB}.01`;

    let returnSeq = new Sequence("Advanced Spell Effects")
                        .sound()
                        .file(schoolSound)
                        .delay(SchoolSoundDelay)
                        .volume(schoolVolume)
                        .playIf(schoolSound !== "")
                        .effect()
                        .file(portalAnimIntro)
                        .atLocation(animLoc)
                        .belowTokens()
                        .scale(0.25)
                        .waitUntilFinished(-2000)
                        .effect()
                        .file(portalAnimLoop)
                        .atLocation(animLoc)
                        .belowTokens()
                        .scale(0.25)
                        .persist()
                        .fadeOut(750, { ease: "easeInQuint" })
                        .name("portalAnimLoop")
                        .sound()
                        .file(soundA)
                        .delay(soundADelay)
                        .volume(soundAVolume)
                        .playIf(soundA !== "")
                        .effect()
                        .file(effectAAnim)
                        .atLocation(animLoc)
                        .waitUntilFinished(-1000)
                        .endTime(3300)
                        .playbackRate(0.7)
                        .scaleOut(0, 500)
                        .scale(1.5)
                        .zIndex(1)
                        .center()
                        .sound()
                        .file(soundB)
                        .delay(soundBDelay)
                        .volume(soundBVolume)
                        .playIf(soundB !== "")
                        .effect()
                        .file(effectBAnim)
                        .atLocation(animLoc)
                        .zIndex(1)
                        .scale(0.4)
                        .fadeOut(500)
                        .scaleIn(0, 1000, { ease: "easeInOutBack" })
                        .waitUntilFinished(-1500)
                        .thenDo(async () => {
                            try {
                                let corpseDoc = token.document;
                                let summonActorData = game.actors.get(summonTokenData.actorId).toObject();
                                //delete summonActorData.items;
                                //delete summonActorData.effects;
                                delete summonActorData._id;
                                const sheet = token.actor.sheet;
                                await token.actor.sheet.close();
                                token.actor._sheet = null;
                                delete token.actor.apps[sheet.appId];
                                let mutateUpdates = { token: summonTokenData, actor: summonActorData };
                                await aseSocket.executeAsGM("checkGMAlwaysAccept");
                                await warpgate.mutate(corpseDoc, mutateUpdates);
                            }
                            catch (err) {
                                console.log(err);
                            };
                        })
                        .sound()
                        .file(schoolSoundOutro)
                        .delay(schoolSoundDelayOutro)
                        .volume(schoolVolumeOutro)
                        .playIf(schoolSoundOutro !== "")
                        .effect()
                        .file(portalAnimOutro)
                        .atLocation(animLoc)
                        .belowTokens()
                        .scale(0.25)
                        .thenDo(async () => {
                            await Sequencer.EffectManager.endEffects({ name: "portalAnimLoop" });
                        });
    return returnSeq;
}
