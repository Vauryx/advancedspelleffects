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
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');
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
    static async activateBolt(midiData) {
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
        let witchBoltConcentration;
        let itemId;
        let origin;
        let witchBoltCasters = canvas.tokens.placeables.filter((token) => {
            //console.log('Scanning Token: ',token.name);
            return (token.actor.effects.filter((effect) => {
                //console.log('Active Effect: ', effect);
                let origin = effect.data.origin?.split(".");
                if (!origin || origin?.length < 4) return false;
                let itemId = origin[5] ?? origin[3];
                //console.log("scanning item id: ", itemId);
                let effectSource = token.actor.items.get(itemId)?.name;
                //console.log("Effect Source Detecetd: ", effectSource);
                return effectSource == "Witch Bolt"
            }).length > 0)
        });
        //console.log('Witch Bolt Casters: ', witchBoltCasters);
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
        //console.log("Is target of any witch bolts?", isWitchBoltTarget);
        if (isWitchBoltTarget) {
            let newPos = { x: 0, y: 0 };
            newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
            newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
            newPos = utilFunctions.getCenter(newPos);
            //console.log(newPos);
            //console.log(castersOnTarget);
            for (let i = 0; i < castersOnTarget.length; i++) {
                let casterOnTarget = castersOnTarget[i];
                //console.log(casterOnTarget);
                let distanceToTarget = utilFunctions.measureDistance(newPos, casterOnTarget);
                //console.log(distanceToTarget);
                await Sequencer.EffectManager.endEffects({ name: `${casterOnTarget.id}-witchBolt` });
                witchBoltConcentration = casterOnTarget.actor.effects.filter((effect) => {
                    let origin = effect.data.origin?.split(".");
                    if (!origin || origin?.length < 4) return false;
                    let itemId = origin[5] ?? origin[3];
                    let effectSource = casterOnTarget.actor.items.get(itemId)?.name;
                    return effectSource == "Witch Bolt"
                })[0];
                if (distanceToTarget > 30) {
                    //console.log(witchBoltConcentration);
                    await witchBoltConcentration.delete();
                }
                else {
                    origin = witchBoltConcentration.data.origin?.split(".");
                    if (!origin || origin?.length < 4) return false;
                    itemId = origin[5] ?? origin[3];
                    witchBoltItem = casterOnTarget.actor.items.get(itemId);
                    effectOptions = witchBoltItem.getFlag("advancedspelleffects", 'effectOptions');
                    animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
                    new Sequence()
                        .effect()
                        .file(animFile)
                        .JB2A()
                        .atLocation(casterOnTarget)
                        .reachTowards(newPos)
                        .persist()
                        .name(`${casterOnTarget.id}-witchBolt`)
                        .play()
                }

            };
        }
        witchBoltConcentration = casterActor.effects.filter((effect) => {
            //console.log(effect.data);
            let origin = effect.data.origin?.split(".");
            if (!origin || origin?.length < 4) return false;
            let itemId = origin[5] ?? origin[3];
            let effectSource = casterActor.items.get(itemId)?.name;
            return effectSource == "Witch Bolt"
        })[0];
        //console.log(witchBoltConcentration);
        //console.log(casterActor);
        if (witchBoltConcentration) {
            let concOrigin = witchBoltConcentration.data.origin.split(".");
            if (!concOrigin || concOrigin?.length < 4) return false;
            let itemID = concOrigin[5] ?? concOrigin[3];
            witchBoltItem = casterActor.items.get(itemID);
            effectOptions = witchBoltItem.getFlag("advancedspelleffects", 'effectOptions');
            animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
            let effectInfo = tokenDocument.getFlag("advancedspelleffects", "witchBolt");
            if (effectInfo) {
                //console.log(effectInfo.casterId, effectInfo.targetId);
                let target = canvas.tokens.get(effectInfo.targetId);
                let newPos = { x: 0, y: 0 };
                newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
                newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
                newPos = utilFunctions.getCenter(newPos);
                //console.log(newPos);
                await Sequencer.EffectManager.endEffects({ name: `${tokenDocument.id}-witchBolt` });
                let casterToTargetDist = utilFunctions.measureDistance(newPos, target);
                if (casterToTargetDist > 30) {
                    witchBoltConcentration = casterActor.effects.filter((effect) => {
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
        if (witchBoltConcentration) {
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
            if (confirm) {
                let damageRoll = await new Roll(`1d12`).evaluate({ async: true });
                //console.log(damageRoll);
                new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, damageRoll.total, "lightning", target ? [target] : [], damageRoll, { flavor: `Witch Bolt - Damage Roll (1d12 Lightning)`, itemCardId: "new", itemData: itemData });
            }

        }
    }
}