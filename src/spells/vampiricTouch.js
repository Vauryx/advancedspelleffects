import { concentrationHandler } from "../concentrationHandler.js";
import * as utilFunctions from "../utilityFunctions.js";
//Contributed by Wasp - The Sequencer Guy
export class vampiricTouch {
    static async cast(midiData) {
        const tokenD = canvas.tokens.get(midiData.tokenId);
        let tactor = midiData.actor;
        const target = Array.from(midiData.targets)[0];
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');

        let casterAnim = `jb2a.energy_strands.overlay.${effectOptions.vtCasterColor}.01`;
        const casterSound = effectOptions.vtCasterSound ?? "";
        const casterSoundDelay = Number(effectOptions.vtCasterSoundDelay) ?? 0;
        const casterSoundVolume = effectOptions.vtCasterVolume ?? 1;

        const impactSound = effectOptions.vtImpactSound;
        const impactSoundDelay = Number(effectOptions.vtImpactSoundDelay) ?? 0;
        const impactVolume = effectOptions.vtImpactVolume ?? 1;


        const siphonSound = effectOptions.vtSiphonSound;
        const siphonSoundDelay = Number(effectOptions.vtSiphonSoundDelay) ?? 0;
        const siphonVolume = effectOptions.vtSiphonVolume ?? 1;

        const itemData = midiData.item.system;

        const maxStrands = effectOptions.vtMaxStrands ?? 20;
        const updates = {
            embedded: {
                Item: {}
            }
        };
        const activationItemName = game.i18n.localize('ASE.VampiricTouchAttack');

        updates.embedded.Item[activationItemName] = {
            "type": "spell",
            "img": midiData.item.img,
            "system": {
                "ability": "",
                "actionType": itemData.actionType,
                "activation": { "type": 'action', "cost": 1 },
                "damage": itemData.damage,
                "level": midiData.itemLevel,
                "preparation": { "mode": 'atwill', "prepared": true },
                "range": { "value": 5, "units": 'ft' },
                "school": "nec",
                "target": { "value": 1, "type": 'creature' },
                "description": {
                    "value": game.i18n.localize("ASE.VampiricTouchDescription")
                }
            },
            "flags": {
                "advancedspelleffects": {
                    "enableASE": true,
                    "spellEffect": game.i18n.localize('ASE.VampiricTouchAttack'),
                    "castItem": true,
                    "castStage": "preDamage",
                    'effectOptions': {
                        'vtStrandColor': effectOptions.vtStrandColor,
                        'vtImpactColor': effectOptions.vtImpactColor,
                        'vtSiphonSound': siphonSound,
                        'vtSiphonSoundDelay': siphonSoundDelay,
                        'vtSiphonVolume': siphonVolume,
                        'vtImpactSound': impactSound,
                        'vtImpactSoundDelay': impactSoundDelay,
                        'vtImpactVolume': impactVolume,
                        'vtMaxStrands': maxStrands,
                        'allowInitialMidiCall': true
                    }
                }
            }
        }

        
       /* if (game.modules.get("midi-qol")?.active) {
            missed = Array.from(midiData.hitTargets).length === 0;
            damageTotal = midiData.damageRoll?.total ?? 12;
            if (Array.from(midiData.hitTargets).length > 0) {
                const updatedHP = tactor.system.attributes.hp.value + Math.floor(damageTotal / 2);
                await tactor.update({
                    "system.attributes.hp.value": Math.min(tactor.system.attributes.hp.max, updatedHP)
                });
            }
            strandNum = Math.min(Math.floor(damageTotal), maxStrands);
        }
        */
        new Sequence('Advanced Spell Effects')
            .sound()
            .file(casterSound)
            .delay(casterSoundDelay)
            .volume(casterSoundVolume)
            .playIf(casterSound !== "")
            .effect()
            .file(casterAnim)
            .attachTo(tokenD)
            .scaleToObject(1.15)
            .zIndex(1)
            .persist()
            .name(`${tokenD.id}-vampiric-touch`)
            .scaleIn(0, 12 * 200, { ease: "easeInOutBack" })
            .scaleOut(0, 1000, { ease: "easeInOutBack" })
            .fadeOut(1000)
            //.scale(0.4)
            .play()
            
        await warpgate.mutate(tokenD.document, updates, {}, { name: `${tactor.id}-vampiric-touch` });
        ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.VampiricTouchAttack") }));
        await ChatMessage.create({ content: `${tactor.name}'s hands are wrapped in darkness...` });
        effectOptions.concentration = true;
        let castItem = tactor.items.getName(activationItemName);
        effectOptions.castItem = castItem.uuid;
        effectOptions.targets = [target.document.uuid];
        game.ASESpellStateManager.addSpell(midiData.itemUuid, effectOptions);

    }
    static async handleConcentration(casterActor, casterToken, effectOptions) {
        //handle concentration removal for vampiric touch
        await warpgate.revert(casterToken.document, `${casterActor.id}-vampiric-touch`);

        ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.VampiricTouchAttack") }));

        await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-vampiric-touch` });

        await ChatMessage.create({ content: `${casterActor.name}'s returns to normal.` });
    }

    static async activateTouch(midiData) {
        const tokenD = canvas.tokens.get(midiData.tokenId);
        let tactor = midiData.actor;
        const target = Array.from(midiData.targets)[0];
        console.log("ASE: Vampiric Touch Activated: target:", target);
        let missed = false;
        let damageTotal = 4 * midiData.itemLevel;
        let effectOptions = midiData.item.getFlag("advancedspelleffects", 'effectOptions');
        let strandAnim = `jb2a.energy_strands.range.standard.${effectOptions.vtStrandColor}`;
        let impactAnim = `jb2a.impact.004.${effectOptions.vtImpactColor}`;
        const siphonSound = effectOptions.vtSiphonSound;
        const siphonSoundDelay = Number(effectOptions.vtSiphonSoundDelay) ?? 0;
        const siphonVolume = effectOptions.vtSiphonVolume ?? 1;
        const impactSound = effectOptions.vtImpactSound;
        const impactSoundDelay = Number(effectOptions.vtImpactSoundDelay) ?? 0;
        const impactVolume = effectOptions.vtImpactVolume ?? 1;
        const maxStrands = Number(effectOptions.vtMaxStrands) ?? 20;
        missed = Array.from(midiData.hitTargets).length === 0;
        damageTotal = midiData.damageRoll?.total ?? 12;
        if (Array.from(midiData.hitTargets).length > 0) {
            const updatedHP = tactor.system.attributes.hp.value + Math.floor(damageTotal / 2);
            await tactor.update({
                "system.attributes.hp.value": Math.min(tactor.system.attributes.hp.max, updatedHP)
            })
        }
        const strandNum = Math.min(Math.floor(damageTotal), maxStrands);
        new Sequence('Advanced Spell Effects')
            .sound()
            .file(impactSound)
            .delay(impactSoundDelay + 100)
            .volume(impactVolume)
            .playIf(impactSound !== "")
            .effect()
            .file(impactAnim)
            .atLocation(target)
            .scaleToObject()
            .missed(missed)
            .delay(100)
            .sound()
            .file(siphonSound)
            .delay(siphonSoundDelay)
            .volume(siphonVolume)
            .playIf(siphonSound !== "" && !missed)
            .effect()
            .file(strandAnim)
            .atLocation(target)
            .playIf(!missed)
            .stretchTo(tokenD)
            .repeats(Math.max(1, strandNum), 100, 200)
            .randomizeMirrorY()
            .play()
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        //console.log(currFlags);
        const vampiricTouchCasterAnim = 'jb2a.energy_strands.overlay';
        const vampiricTouchStrandAnim = `jb2a.energy_strands.range.standard`;
        const vampiricTouchImpactAnim = `jb2a.impact.004`;

        const vampiricTouchCasterColorOptions = utilFunctions.getDBOptions(vampiricTouchCasterAnim);
        const vampiricTouchStrandColorOptions = utilFunctions.getDBOptions(vampiricTouchStrandAnim);
        const vampiricTouchImpactColorOptions = utilFunctions.getDBOptions(vampiricTouchImpactAnim);

        const spellDetails = {
            actionType: "msak",
            target : {
                type: "creature",
                units: "",
                value: 1,
                width: null,
            }
        };

        let animOptions = [];
        let soundOptions = [];
        let spellOptions = [];
        animOptions.push({
            label: game.i18n.localize('ASE.VTCasterEffectLabel'),
            tooltip: game.i18n.localize('ASE.VTCasterEffectTooltip'),
            type: 'dropdown',
            options: vampiricTouchCasterColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.vtCasterColor',
            flagName: 'vtCasterColor',
            flagValue: currFlags.vtCasterColor ?? 'blue',
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTCasterSoundLabel'),
            tooltip: game.i18n.localize('ASE.VTCasterSoundTooltip'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.vtCasterSound',
            flagName: 'vtCasterSound',
            flagValue: currFlags.vtCasterSound ?? '',
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTCasterSoundDelayLabel'),
            tooltip: game.i18n.localize('ASE.VTCasterSoundDelayTooltip'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.vtCasterSoundDelay',
            flagName: 'vtCasterSoundDelay',
            flagValue: currFlags.vtCasterSoundDelay ?? 0,
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTCasterVolumeLabel'),
            tooltip: game.i18n.localize('ASE.VTCasterVolumeTooltip'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.vtCasterVolume',
            flagName: 'vtCasterVolume',
            flagValue: currFlags.vtCasterVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01
        });

        animOptions.push({
            label: game.i18n.localize('ASE.VTSiphonEffectLabel'),
            tooltip: game.i18n.localize('ASE.VTSiphonEffectTooltip'),
            type: 'dropdown',
            options: vampiricTouchStrandColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.vtStrandColor',
            flagName: 'vtStrandColor',
            flagValue: currFlags.vtStrandColor ?? 'blue',
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTSiphonSoundLabel'),
            tooltip: game.i18n.localize('ASE.VTSiphonSoundTooltip'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.vtSiphonSound',
            flagName: 'vtSiphonSound',
            flagValue: currFlags.vtSiphonSound ?? '',
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTSiphonSoundDelayLabel'),
            tooltip: game.i18n.localize('ASE.VTSiphonSoundDelayTooltip'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.vtSiphonSoundDelay',
            flagName: 'vtSiphonSoundDelay',
            flagValue: currFlags.vtSiphonSoundDelay ?? 0,
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTSiphonVolumeLabel'),
            tooltip: game.i18n.localize('ASE.VTSiphonVolumeTooltip'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.vtSiphonVolume',
            flagName: 'vtSiphonVolume',
            flagValue: currFlags.vtSiphonVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01
        });

        animOptions.push({
            label: game.i18n.localize('ASE.VTImpactEffectLabel'),
            tooltip: game.i18n.localize('ASE.VTImpactEffectTooltip'),
            type: 'dropdown',
            options: vampiricTouchImpactColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.vtImpactColor',
            flagName: 'vtImpactColor',
            flagValue: currFlags.vtImpactColor ?? 'blue',
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTImpactSoundLabel'),
            tooltip: game.i18n.localize('ASE.VTImpactSoundTooltip'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.vtImpactSound',
            flagName: 'vtImpactSound',
            flagValue: currFlags.vtImpactSound ?? '',
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTImpactSoundDelayLabel'),
            tooltip: game.i18n.localize('ASE.VTImpactSoundDelayTooltip'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.vtImpactSoundDelay',
            flagName: 'vtImpactSoundDelay',
            flagValue: currFlags.vtImpactSoundDelay ?? 0,
        });

        soundOptions.push({
            label: game.i18n.localize('ASE.VTImpactVolumeLabel'),
            tooltip: game.i18n.localize('ASE.VTImpactVolumeTooltip'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.vtImpactVolume',
            flagName: 'vtImpactVolume',
            flagValue: currFlags.vtImpactVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01
        });

        animOptions.push({
            label: game.i18n.localize('ASE.VTMaxStrandsLabel'),
            tooltip: game.i18n.localize('ASE.VTMaxStrandsTooltip'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.vtMaxStrands',
            flagName: 'vtMaxStrands',
            flagValue: currFlags.vtMaxStrands ?? 20,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: true,
            requireDetails: spellDetails
        }

    }
}
