import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
export class witchBolt {
    static registerHooks() {
        Hooks.on("updateToken", witchBolt._updateToken);
        Hooks.on("updateCombat", witchBolt._updateCombat);
    }
    static async cast(midiData) {
        let casterActor = midiData.actor;
        let caster = canvas.tokens.get(midiData.tokenId);
        let target = Array.from(midiData.targets)[0];
        let effectOptions =midiData.item.getFlag("advancedspelleffects", 'effectOptions');
        let boltFile = `jb2a.chain_lightning.primary.${effectOptions.initialBoltColor}`;
        let animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
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
    static async activateBolt(midiData){
        let casterActor = midiData.actor;
        let caster = canvas.tokens.get(midiData.tokenId);
        let target = Array.from(midiData.targets)[0];
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');
        let boltFile = `jb2a.chain_lightning.primary.${effectOptions.initialBoltColor}`;
        new Sequence()
            .effect()
            .file(boltFile)
            .JB2A()
            .atLocation(caster)
            .reachTowards(target)
            .play()
    }

    static async _updateToken(tokenDocument, updateData) {
        //console.log("Registering Detect Magic Hook");
        if (!game.user.isGM) return;
        if ((!updateData.x && !updateData.y)) return;
        let casterActor = tokenDocument.actor;
        let animFile = '';
        let witchBoltItem;
        let effectOptions;
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
                let witchBoltConcentration = casterOnTarget.actor.effects.filter((effect) => {
                    let origin = effect.data.origin;
                    origin = origin.split(".");
                    let effectSource = casterOnTarget.actor.items.get(origin[3]).name;
                    return effectSource == "Witch Bolt"
                })[0];
                if (distanceToTarget > 30) {
                    //console.log(witchBoltConcentration);
                    await witchBoltConcentration.delete();
                    return;
                }
                witchBoltItem = casterOnTarget.actor.items.get(witchBoltConcentration?.data?.origin?.split(".")[3]);
                effectOptions = witchBoltItem.getFlag("advancedspelleffects", 'effectOptions');
                let animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
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
                let effectSource = casterActor.items.get(origin[3])?.name;
                return effectSource == "Witch Bolt"
            })[0];
            //console.log(witchBoltConcentration);
            //console.log(casterActor);
            if (witchBoltConcentration) {
                witchBoltItem = casterActor.items.get(witchBoltConcentration?.data?.origin?.split(".")[3]);
                effectOptions = witchBoltItem.getFlag("advancedspelleffects", 'effectOptions');
                let animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
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
                        //console.log(witchBoltConcentration);
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
        //console.log(casterActor, casterActor.isOwner);
        if (!casterActor.isOwner) return;
        let witchBoltConcentration = casterActor.effects.filter((effect) => {
            let origin = effect.data.origin;
            origin = origin.split(".");
            let effectSource = casterActor.items.get(origin[3]).name;
            return effectSource == "Witch Bolt"
        })[0];
        //console.log(witchBoltConcentration);
        if(witchBoltConcentration){
            let confirmData = {
                buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
                title: "Activate Witch Bolt?"
            };
            let target = canvas.tokens.get(caster.document.getFlag("advancedspelleffects", "witchBolt.targetId"));
            let witchBoltItem = casterActor.items.get(witchBoltConcentration?.data?.origin?.split(".")[3]);
            let itemData = witchBoltItem.data;
            itemData.data.components.concentration = false;
            //console.log(witchBoltItem);
            let confirm = await warpgate.buttonDialog(confirmData, 'row');
            if(confirm){
                let damageRoll = await new Roll(`1d12`).evaluate({ async: true });
                //console.log(damageRoll);
                new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, damageRoll.total, "lightning", target ? [target]: [], damageRoll, { flavor: `Witch Bolt - Damage Roll (1d12 Lightning)`, itemCardId: "new", itemData: itemData });
            }
            
        }
    }
}