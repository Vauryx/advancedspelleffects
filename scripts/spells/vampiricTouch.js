import {concentrationHandler} from "../concentrationHandler.js"

export class vampiricTouch {
    static async cast(midiData) {
        const tokenD = canvas.tokens.get(midiData.tokenId);
        let tactor = midiData.actor;
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');
        const target = Array.from(midiData.targets)[0];
        let missed = false;
        let damageTotal = 4 * midiData.itemLevel;
        let casterAnim = `jb2a.energy_strands.overlay.${effectOptions.vtCasterColor}.01`;
        let strandAnim = `jb2a.energy_strands.range.standard.${effectOptions.vtStrandColor}`;
        let impactAnim = `jb2a.impact.004.${effectOptions.vtImpactColor}`;
        const updates = {
            embedded: {
                Item: {
                    "Vampiric Touch (Attack)": {
                        "type": "spell",
                        "img": midiData.item.img,
                        "data": {
                            "ability": "",
                            "actionType": "msak",
                            "activation": { "type": 'action', "cost": 1 },
                            "damage": { "parts": [[`${midiData.itemLevel}d6`, "necrotic"]] },
                            "level": midiData.itemLevel,
                            "preparation": { "mode": 'atwill', "prepared": true },
                            "range": { "value": 5, "units": 'ft' },
                            "school": "nec",
                            "target": { "value": 1, "type": 'creature' },
                            "description": {
                                "value": "The touch of your shadow-wreathed hand can siphon force from others to heal your wounds."
                            }
                        },
                        "flags": {"advancedspelleffects": {
                            "enableASE": true,
                            'effectOptions': {
                                'vtStrandColor': effectOptions.vtStrandColor,
                                'vtImpactColor': effectOptions.vtImpactColor
                            }}}
                    }
                }
            }
        }
        if (game.modules.get("midi-qol")?.active) {
            missed = Array.from(midiData.hitTargets).length == 0;
            damageTotal = midiData.damageRoll?.total ?? 12;
            if (Array.from(midiData.hitTargets).length > 0) {
                const updatedHP = tactor.data.data.attributes.hp.value + Math.floor(damageTotal / 2);
                await tactor.update({
                    "data.attributes.hp.value": Math.min(tactor.data.data.attributes.hp.max, updatedHP)
                });
            }
            else{
                await concentrationHandler.addConcentration(tactor, midiData.item);
            }
        }
        new Sequence('Advanced Spell Effects')
            .effect()
            .file(impactAnim)
            .atLocation(target)
            .scaleToObject()
            .missed(missed)
            .delay(100)
            .effect()
            .file(strandAnim)
            .atLocation(target)
            .playIf(!missed)
            .reachTowards(tokenD)
            .repeats(Math.max(1, Math.floor(damageTotal)), 100, 200)
            .randomizeMirrorY()
            .effect()
            .file(casterAnim)
            .attachTo(tokenD)
            .scaleToObject(1.15)
            .zIndex(1)
            .persist()
            .name(`${tokenD.id}-vampiric-touch`)
            .scaleIn(0, damageTotal * 200, { ease: "easeInOutBack" })
            .scaleOut(0,1000, { ease: "easeInOutBack" })
            .fadeOut(1000)
            //.scale(0.4)
            .play()
        await warpgate.mutate(tokenD.document, updates, {}, { name: `${tactor.id}-vampiric-touch` });
        ui.notifications.info(`Vampiric Touch (Attack) has been added to your At-Will spells.`);
        ChatMessage.create({ content: `${tactor.name}'s hands are wrapped in darkness...` });

    }
    static async handleConcentration(casterActor, casterToken, effectOptions) {
        //handle concentration removal for vampiric touch
        await warpgate.revert(casterToken.document, `${casterActor.id}-vampiric-touch`);

        ui.notifications.info(`Vampiric Touch (Attack) has been removed from your At-Will spells.`);

        await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-vampiric-touch` });

        ChatMessage.create({ content: `${casterActor.name}'s returns to normal.` });
    }

    static async activateTouch(midiData) {
        const tokenD = canvas.tokens.get(midiData.tokenId);
        let tactor = midiData.actor;
        const target = Array.from(midiData.targets)[0];
        let missed = false;
        let damageTotal = 4 * midiData.itemLevel;
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');
        let strandAnim = `jb2a.energy_strands.range.standard.${effectOptions.vtStrandColor}`;
        let impactAnim = `jb2a.impact.004.${effectOptions.vtImpactColor}`;
        if (game.modules.get("midi-qol")?.active) {
            missed = Array.from(midiData.hitTargets).length == 0;
            damageTotal = midiData.damageRoll?.total ?? 12;
            if (Array.from(midiData.hitTargets).length > 0) {
                const updatedHP = tactor.data.data.attributes.hp.value + Math.floor(damageTotal / 2);
                await tactor.update({
                    "data.attributes.hp.value": Math.min(tactor.data.data.attributes.hp.max, updatedHP)
                })
            }
        }
        new Sequence('Advanced Spell Effects')
            .effect()
            .file(impactAnim)
            .atLocation(target)
            .scaleToObject()
            .missed(missed)
            .delay(100)
            .effect()
            .file(strandAnim)
            .atLocation(target)
            .playIf(!missed)
            .reachTowards(tokenD)
            .repeats(Math.max(1, Math.floor(damageTotal)), 100, 200)
            .randomizeMirrorY()
            .play()
    }
}