import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
export class witchBolt {
    static registerHooks() {
        Hooks.on("updateToken", witchBolt._updateToken);
    }
    static async cast(midiData) {
        let actor = midiData.actor;
        let caster = canvas.tokens.get(midiData.tokenId);
        let target = Array.from(midiData.targets)[0];
        let animFile = "jb2a.witch_bolt.dark_purple"
        let boltFile = "jb2a.chain_lightning.primary.dark_purple"
        let missed = Array.from(midiData.hitTargets).length == 0;
        new Sequence()
            .effect()
            .file(boltFile)
            .JB2A()
            .atLocation(caster)
            .reachTowards(target)
            .missed(missed)
            .waitUntilFinished(-900)
            .effect()
            .file(animFile)
            .JB2A()
            .atLocation(caster)
            .reachTowards(target)
            .persist()
            .playIf(!missed)
            .name(`${caster.id}-witchBolt`)
            .play()
        if (!missed) {
            await caster.document.setFlag("advancedspelleffects", "witchBolt.casterId", caster.id);
            await caster.document.setFlag("advancedspelleffects", "witchBolt.targetId", target.id);
        }

    }

    static async _updateToken(tokenDocument, updateData) {
        //console.log("Registering Detect Magic Hook");
        if ((!updateData.x && !updateData.y)) return;
        let casterActor = tokenDocument.actor;
        let animFile = "jb2a.witch_bolt.dark_purple";
        let witchBoltCasters = canvas.tokens.placeables.filter((token) => {
            return (token.actor.effects.filter((effect) => {
                let origin = effect.data.origin;
                if(!origin || origin?.length<4) return false;
                origin = origin.split(".");
                let effectSource = token.actor.items.get(origin[3])?.name;
                return effectSource == "Witch Bolt"
            }).length > 0)
        })
        if (witchBoltCasters.length == 0) return;
        //console.log(witchBoltCasters);
        let isWitchBoltTarget = false;
        let castersOnTarget = [];
        witchBoltCasters.forEach(caster => {
            if (caster.document.getFlag("advancedspelleffects", "witchBolt.targetId") == tokenDocument.id) {
                castersOnTarget.push(caster);
                isWitchBoltTarget = true;
            }
        });
        if (isWitchBoltTarget) {
            let newPos = { x: 0, y: 0 };
            newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
            newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
            newPos = utilFunctions.getCenter(newPos);
            //console.log(newPos);
            castersOnTarget.forEach(async (casterOnTarget) => {
                //console.log(casterOnTarget);
                let distanceToTarget = utilFunctions.measureDistance(newPos, casterOnTarget);
                //console.log(distanceToTarget);
                Sequencer.EffectManager.endEffects({ name: `${casterOnTarget.id}-witchBolt` });
                if (distanceToTarget > 30) {
                    let witchBoltConcentration = casterOnTarget.actor.effects.filter((effect) => {
                        let origin = effect.data.origin;
                        origin = origin.split(".");
                        let effectSource = casterOnTarget.actor.items.get(origin[3]).name;
                        return effectSource == "Witch Bolt"
                    })[0];
                    console.log(witchBoltConcentration);
                    await witchBoltConcentration.delete();
                    return;
                }
                new Sequence()
                    .effect()
                    .file(animFile)
                    .JB2A()
                    .atLocation(casterOnTarget)
                    .reachTowards(newPos)
                    .persist()
                    .name(`${casterOnTarget.id}-witchBolt`)
                    .play()
            });
        }
        else {
            let witchBoltConcentration = casterActor.effects.filter((effect) => {
                //console.log(effect.data);
                let origin = effect.data.origin;
                if(!origin) return false;
                origin = origin.split(".");
                let effectSource = casterActor.items.get(origin[3]).name;
                return effectSource == "Witch Bolt"
            })[0];
            //console.log(witchBoltConcentration);
            //console.log(casterActor);
            if (witchBoltConcentration) {
                let effectInfo = tokenDocument.getFlag("advancedspelleffects", "witchBolt");
                if (effectInfo) {
                    //console.log(effectInfo.casterId, effectInfo.targetId);
                    let target = canvas.tokens.get(effectInfo.targetId);
                    let newPos = { x: 0, y: 0 };
                    newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
                    newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
                    newPos = utilFunctions.getCenter(newPos);
                    //console.log(newPos);
                    Sequencer.EffectManager.endEffects({ name: `${tokenDocument.id}-witchBolt` });
                    let casterToTargetDist = utilFunctions.measureDistance(newPos, target);
                    if (casterToTargetDist > 30) {
                        let witchBoltConcentration = casterActor.effects.filter((effect) => {
                            let origin = effect.data.origin;
                            origin = origin.split(".");
                            let effectSource = casterActor.items.get(origin[3]).name;
                            return effectSource == "Witch Bolt"
                        })[0];
                        console.log(witchBoltConcentration);
                        await witchBoltConcentration.delete();
                        return;
                    }
                    new Sequence()
                        .effect()
                        .file(animFile)
                        .JB2A()
                        .atLocation(newPos)
                        .reachTowards(target)
                        .persist()
                        .name(`${tokenDocument.id}-witchBolt`)
                        .play()


                }
            }
        }


    }

    static async _updateCombat(combat) {
        let currentCombatantId = combat.current.tokenId;
        let caster = canvas.tokens.get(currentCombatantId);
        let casterActor = caster.actor;
        if (!casterActor.isOwner) return;
        let witchBoltConcentration = casterActor.effects.filter((effect) => {
            let origin = effect.data.origin;
            origin = origin.split(".");
            let effectSource = casterActor.items.get(origin[3]).name;
            return effectSource == "Witch Bolt"
        })[0];
        console.log(witchBoltConcentration);
        if(witchBoltConcentration){
            let confirmData = {
                buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
                title: "Activate Witch Bolt?"
            };
            let target;

            
            
        }
    }
}