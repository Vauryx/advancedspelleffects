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
        let missed = false;
        if (game.modules.get("midi-qol")?.active) {
            missed = Array.from(midiData.hitTargets).length == 0;
        }

        new Sequence("Advanced Spell Effects")
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
            const updates = {
                embedded: {
                    Item: {
                        "Activate Witch Bolt": {
                            "type": "spell",
                            "img": midiData.item.img,
                            "data": {
                                "ability": "",
                                "actionType": "other",
                                "activation": { "type": "action", "cost": 1, "condition": "" },
                                "damage": { "parts": [], "versatile": "" },
                                "level": midiData.itemLevel,
                                "preparation": { "mode": 'atwill', "prepared": true },
                                "range": { "value": null, "long": null, "units": "" },
                                "school": "con",
                                "description": {
                                    "value": "Send lightning along the arc."
                                }
                            },
                            "flags": {
                                "advancedspelleffects": {
                                    "enableASE": true,
                                    'effectOptions': effectOptions
                                }
                            }
                        }
                    }
                }
            }
            //console.log(`${caster.actor.id}-witch-bolt`);
            ui.notifications.info(`Activate Witch Bolt has been added to your At-Will spells.`);
            await warpgate.mutate(caster.document, updates, {}, { name: `${caster.actor.id}-witch-bolt` });
        }
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        console.log(`${casterToken.id}-witchBolt`);
        await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-witchBolt` });
        await casterToken.document.unsetFlag("advancedspelleffects", "witchBolt");
        //console.log(`${casterActor.id}-witch-bolt`);
        ui.notifications.info(`Activate Witch Bolt has been removed from your At-Will spells.`);
        await warpgate.revert(casterToken.document, `${casterActor.id}-witch-bolt`);
        return;
    }

    static async activateBolt(midiData) {
        let casterActor = midiData.actor;
        let caster = canvas.tokens.get(midiData.tokenId);
        let target = canvas.tokens.get(caster.document.getFlag("advancedspelleffects", "witchBolt.targetId"));
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');
        let boltFile = `jb2a.chain_lightning.primary.${effectOptions.initialBoltColor}`;
        let damageRoll = await new Roll(`1d12`).evaluate({ async: true });
        let itemData = midiData.item.data;
        itemData.data.components.concentration = false;
        if (game.modules.get("midi-qol")?.active) {
            //console.log(damageRoll);
            new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, damageRoll.total, "lightning", target ? [target] : [], damageRoll, { flavor: `Witch Bolt - Damage Roll (1d12 Lightning)`, itemCardId: "new", itemData: itemData });
        }
        new Sequence("Advanced Spell Effects")
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
            return (token.actor?.effects.filter((effect) => {
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
                    new Sequence("Advanced Spell Effects")
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
                    //console.log(witchBoltConcentration);
                    await witchBoltConcentration.delete();
                    return;
                }
                new Sequence("Advanced Spell Effects")
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
        if (!casterActor.isOwner || (game.user.isGM && caster.actor.hasPlayerOwner)) return;
        let witchBoltConcentration = casterActor.effects.filter((effect) => {
            let origin = effect.data.origin?.split(".");
            if (!origin || origin?.length < 4) return false;
            let itemId = origin[5] ?? origin[3];
            let effectSource = casterActor.items.get(itemId).name;
            return effectSource == "Witch Bolt"
        })[0];
        //console.log(witchBoltConcentration);
        if (witchBoltConcentration) {
            let confirmData = {
                buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
                title: "Activate Witch Bolt?"
            };
            let target = canvas.tokens.get(caster.document.getFlag("advancedspelleffects", "witchBolt.targetId"));
            let concOrigin = witchBoltConcentration.data.origin.split(".");
            if (!concOrigin || concOrigin?.length < 4) return false;
            let itemID = concOrigin[5] ?? concOrigin[3];
            let witchBoltItem = casterActor.items.get(itemID);

            //console.log(witchBoltItem);
            let confirm = await warpgate.buttonDialog(confirmData, 'row');
            if (confirm) {
                await witchBolt.activateBolt({ actor: casterActor, item: witchBoltItem, tokenId: caster.id });
            }

        }
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const initialBoltAnim = 'jb2a.chain_lightning.primary';
        const initialBoltColorOptions = utilFunctions.getDBOptions(initialBoltAnim);

        const streamAnim = 'jb2a.witch_bolt';
        const streamColorOptions = utilFunctions.getDBOptions(streamAnim);

        let animOptions = [];
        let soundOptions = [];
        let spellOptions = [];

        animOptions.push({
            label: 'Initial Bolt Color:',
            type: 'dropdown',
            options: initialBoltColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.initialBoltColor',
            flagName: 'initialBoltColor',
            flagValue: currFlags.initialBoltColor ?? 'blue',
        });
        soundOptions.push({
            label: 'Initial Bolt Sound:',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.initialBoltSound',
            flagName: 'initialBoltSound',
            flagValue: currFlags.initialBoltSound ?? '',
        });
        soundOptions.push({
            label: 'Initial Bolt Sound Delay:',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.initialBoltSoundDelay',
            flagName: 'initialBoltSoundDelay',
            flagValue: currFlags.initialBoltSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Initial Bolt Volume:',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.initialBoltVolume',
            flagName: 'initialBoltVolume',
            flagValue: currFlags.initialBoltVolume ?? 1,
        });

        animOptions.push({
            label: 'Continuous Stream Color:',
            type: 'dropdown',
            options: streamColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.streamColor',
            flagName: 'streamColor',
            flagValue: currFlags.streamColor ?? 'blue',
        });
        soundOptions.push({
            label: 'Continuous Stream Sound(Caster):',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.streamCasterSound',
            flagName: 'streamCasterSound',
            flagValue: currFlags.streamCasterSound ?? '',
        });
        soundOptions.push({
            label: 'Continuous Stream Sound Delay(Caster):',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.streamCasterSoundDelay',
            flagName: 'streamCasterSoundDelay',
            flagValue: currFlags.streamCasterSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Continuous Stream Volume(Caster):',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.streamCasterVolume',
            flagName: 'streamCasterVolume',
            flagValue: currFlags.streamCasterVolume ?? 1,
        });

        soundOptions.push({
            label: 'Continuous Stream Sound(Target):',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.streamTargetSound',
            flagName: 'streamTargetSound',
            flagValue: currFlags.streamTargetSound ?? '',
        });
        soundOptions.push({
            label: 'Continuous Stream Sound Delay(Target):',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.streamTargetSoundDelay',
            flagName: 'streamTargetSoundDelay',
            flagValue: currFlags.streamTargetSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Continuous Stream Volume(Target):',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.streamTargetVolume',
            flagName: 'streamTargetVolume',
            flagValue: currFlags.streamTargetVolume ?? 1,
        });
        //TEMP WHILE WITCHBOLT SOUND IS UNDER DEV
        soundOptions = [];

        return {
            animOptions: animOptions,
            spellOptions: spellOptions,
            soundOptions: soundOptions,
        }

    }


}