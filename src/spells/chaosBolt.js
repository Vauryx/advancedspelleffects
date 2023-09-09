// Chaos Bolt by Wasp

import * as utilFunctions from "../utilityFunctions.js";
import baseSpellClass from "./baseSpellClass.js";

export class chaosBolt extends baseSpellClass {

    elements = {
        "Acid": "icons/magic/acid/projectile-faceted-glob.webp",
        "Cold": "icons/magic/air/wind-tornado-wall-blue.webp",
        "Fire": "icons/magic/fire/beam-jet-stream-embers.webp",
        "Force": "icons/magic/sonic/projectile-sound-rings-wave.webp",
        "Lightning": "icons/magic/lightning/bolt-blue.webp",
        "Poison": "icons/magic/death/skull-poison-green.webp",
        "Psychic": "icons/magic/control/fear-fright-monster-grin-red-orange.webp",
        "Thunder": "icons/magic/sonic/explosion-shock-wave-teal.webp"
    }

    constructor(args) {
        super();

        this.params = args;

        this.actor = game.actors.get(this.params.actor.id);
        this.token = canvas.tokens.get(this.params.tokenId);
        this.item = this.params.item;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions") ?? {};

        this.itemCardId = this.params.itemCardId;

        this.spellLevel = Number(this.params.itemLevel);

        this.target = Array.from(this.params.targets)[0];

        this.targetsHitSoFar = [];

    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const acidEffects = `jb2a.magic_missile`;
        const acidEffectColorOptions = utilFunctions.getDBOptions(acidEffects);

        const coldEffects = `jb2a.ray_of_frost`;
        const coldEffectColorOptions = utilFunctions.getDBOptions(coldEffects);

        const fireEffects = 'jb2a.fire_bolt';
        const fireEffectColorOptions = utilFunctions.getDBOptions(fireEffects);

        const forceEffects = 'jb2a.eldritch_blast';
        const forceEffectColorOptions = utilFunctions.getDBOptions(forceEffects);

        const lightningEffects = 'jb2a.chain_lightning.primary';
        const lightningEffectColorOptions = utilFunctions.getDBOptions(lightningEffects);

        const poisonEffects = 'jb2a.spell_projectile.skull';
        const poisonEffectColorOptions = utilFunctions.getDBOptions(poisonEffects);

        const psychicEffects = 'jb2a.disintegrate';
        const psychicEffectColorOptions = utilFunctions.getDBOptions(psychicEffects);

        const thunderEffects = 'jb2a.bullet.01';
        const thunderEffectColorOptions = utilFunctions.getDBOptions(thunderEffects);

        const thunderShatterEffects = 'jb2a.shatter';
        const thunderShatterEffectColorOptions = utilFunctions.getDBOptions(thunderShatterEffects);

        const spellDetails = {
            actionType: "rsak",
            target : {
                type: "creature",
                units: "",
                value: 1,
                width: null,
            }
        };

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        animOptions.push({
            label: game.i18n.localize("ASE.AcidEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.AcidEffectColorTooltip"),
            type: 'dropdown',
            options: acidEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.acidColor',
            flagName: 'acidColor',
            flagValue: currFlags.acidColor ?? 'green',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.AcidEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.AcidEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.acidSound',
            flagName: 'acidSound',
            flagValue: currFlags.acidSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.AcidEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.AcidEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.acidSoundDelay',
            flagName: 'acidSoundDelay',
            flagValue: currFlags.acidSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.AcidEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.AcidEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.acidVolume',
            flagName: 'acidVolume',
            flagValue: currFlags.acidVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ColdEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.ColdEffectColorTooltip"),
            type: 'dropdown',
            options: coldEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.coldColor',
            flagName: 'coldColor',
            flagValue: currFlags.coldColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ColdEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.ColdEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.coldSound',
            flagName: 'coldSound',
            flagValue: currFlags.coldSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ColdEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.ColdEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.coldSoundDelay',
            flagName: 'coldSoundDelay',
            flagValue: currFlags.coldSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ColdEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.ColdEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.coldVolume',
            flagName: 'coldVolume',
            flagValue: currFlags.coldVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.FireEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.FireEffectColorTooltip"),
            type: 'dropdown',
            options: fireEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.fireColor',
            flagName: 'fireColor',
            flagValue: currFlags.fireColor ?? 'orange',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.FireEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.FireEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.fireSound',
            flagName: 'fireSound',
            flagValue: currFlags.fireSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.FireEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.FireEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.fireSoundDelay',
            flagName: 'fireSoundDelay',
            flagValue: currFlags.fireSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.FireEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.FireEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.fireVolume',
            flagName: 'fireVolume',
            flagValue: currFlags.fireVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ForceEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.ForceEffectColorTooltip"),
            type: 'dropdown',
            options: forceEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.forceColor',
            flagName: 'forceColor',
            flagValue: currFlags.forceColor ?? 'purple',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ForceEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.ForceEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.forceSound',
            flagName: 'forceSound',
            flagValue: currFlags.forceSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ForceEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.ForceEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.forceSoundDelay',
            flagName: 'forceSoundDelay',
            flagValue: currFlags.forceSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ForceEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.ForceEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.forceVolume',
            flagName: 'forceVolume',
            flagValue: currFlags.forceVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.LightningEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.LightningEffectColorTooltip"),
            type: 'dropdown',
            options: lightningEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.lightningColor',
            flagName: 'lightningColor',
            flagValue: currFlags.lightningColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.LightningEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.LightningEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.lightningSound',
            flagName: 'lightningSound',
            flagValue: currFlags.lightningSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.LightningEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.LightningEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.lightningSoundDelay',
            flagName: 'lightningSoundDelay',
            flagValue: currFlags.lightningSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.LightningEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.LightningEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.lightningVolume',
            flagName: 'lightningVolume',
            flagValue: currFlags.lightningVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.PoisonEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.PoisonEffectColorTooltip"),
            type: 'dropdown',
            options: poisonEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.poisonColor',
            flagName: 'poisonColor',
            flagValue: currFlags.poisonColor ?? 'pinkpurple',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PoisonEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.PoisonEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.poisonSound',
            flagName: 'poisonSound',
            flagValue: currFlags.poisonSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PoisonEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.PoisonEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.poisonSoundDelay',
            flagName: 'poisonSoundDelay',
            flagValue: currFlags.poisonSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PoisonEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.PoisonEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.poisonVolume',
            flagName: 'poisonVolume',
            flagValue: currFlags.poisonVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.PsychicEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.PsychicEffectColorTooltip"),
            type: 'dropdown',
            options: psychicEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.psychicColor',
            flagName: 'psychicColor',
            flagValue: currFlags.psychicColor ?? 'dark_red',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PsychicEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.PsychicEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.psychicSound',
            flagName: 'psychicSound',
            flagValue: currFlags.psychicSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PsychicEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.PsychicEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.psychicSoundDelay',
            flagName: 'psychicSoundDelay',
            flagValue: currFlags.psychicSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PsychicEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.PsychicEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.psychicVolume',
            flagName: 'psychicVolume',
            flagValue: currFlags.psychicVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ThunderEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.ThunderEffectColorTooltip"),
            type: 'dropdown',
            options: thunderEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.thunderColor',
            flagName: 'thunderColor',
            flagValue: currFlags.thunderColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ThunderEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.ThunderEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.thunderSound',
            flagName: 'thunderSound',
            flagValue: currFlags.thunderSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ThunderEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.ThunderEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.thunderSoundDelay',
            flagName: 'thunderSoundDelay',
            flagValue: currFlags.thunderSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ThunderEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.ThunderEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.thunderVolume',
            flagName: 'thunderVolume',
            flagValue: currFlags.thunderVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ThunderShatterEffectColorLabel"),
            tooltip: game.i18n.localize("ASE.ThunderShatterEffectColorTooltip"),
            type: 'dropdown',
            options: thunderShatterEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.thunderShatterColor',
            flagName: 'thunderShatterColor',
            flagValue: currFlags.thunderShatterColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ThunderShatterEffectSoundLabel"),
            tooltip: game.i18n.localize("ASE.ThunderShatterEffectSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.thunderShatterSound',
            flagName: 'thunderShatterSound',
            flagValue: currFlags.thunderShatterSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ThunderShatterEffectSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.ThunderShatterEffectSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.thunderShatterSoundDelay',
            flagName: 'thunderShatterSoundDelay',
            flagValue: currFlags.thunderShatterSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ThunderShatterEffectSoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.ThunderShatterEffectSoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.thunderShatterVolume',
            flagName: 'thunderShatterVolume',
            flagValue: currFlags.thunderShatterVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            animOptions: animOptions,
            spellOptions: spellOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: false,
            requireDetails: spellDetails
        }
    }

    static async cast(args) {
        console.log("ASE | CHAOS BOLT | Cast Args: ", args);
        const workflow = new this(args);
        const spellStateOptions = {
            repeat: true,
            damInterrupt: true,
            effectOptions: workflow.effectOptions,
            item: workflow.item,
            caster: workflow.token,
            targets: [workflow.target.document.uuid],
            targetsHit: []
        };
        console.log("ASE | CHAOS BOLT | spellStateOptions: ", spellStateOptions);
        game.ASESpellStateManager.addSpell(workflow.item.uuid, spellStateOptions);
        /*let bouncing = true;
        while (bouncing) {
            const validTarget = await workflow.determineTarget();
            if (!validTarget) break;
            await workflow.rollAttack();
            const validDamage = await workflow.rollDamage();
            await workflow.updateChatCards();
            bouncing = workflow.attackData[workflow.attackData.length - 1].bounce && validDamage;
        }

        await workflow.playSequence();*/
    }

    static async damageInterrupt(data){
        console.log("ASE | CHAOS BOLT | Damage Interrupt Data: ", data);

        const elements = {
            "Acid": "icons/magic/acid/projectile-faceted-glob.webp",
            "Cold": "icons/magic/air/wind-tornado-wall-blue.webp",
            "Fire": "icons/magic/fire/beam-jet-stream-embers.webp",
            "Force": "icons/magic/sonic/projectile-sound-rings-wave.webp",
            "Lightning": "icons/magic/lightning/bolt-blue.webp",
            "Poison": "icons/magic/death/skull-poison-green.webp",
            "Psychic": "icons/magic/control/fear-fright-monster-grin-red-orange.webp",
            "Thunder": "icons/magic/sonic/explosion-shock-wave-teal.webp"
        };
        const damageSequences = {
            "acid": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.acidSound ?? "")
                    .delay(options.acidSoundDelay ?? 0)
                    .volume(options.acidVolume ?? 0.5)
                    .playIf(options.acidSound !== "" && options.acidSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.magic_missile.${options.acidColor ?? "green"}`)
                    .missed(!attack.hits)
                    .waitUntilFinished(-1000)
            },
            "cold": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.coldSound ?? "")
                    .delay(options.coldSoundDelay ?? 0)
                    .volume(options.coldVolume ?? 0.5)
                    .playIf(options.coldSound !== "" && options.coldSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .missed(!attack.hits)
                    .file(`jb2a.ray_of_frost.${options.coldColor ?? "blue"}`)
                    .waitUntilFinished(-1500)
            },
            "fire": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.fireSound ?? "")
                    .delay(options.fireSoundDelay ?? 0)
                    .volume(options.fireVolume ?? 0.5)
                    .playIf(options.fireSound !== "" && options.fireSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.fire_bolt.${options.fireColor ?? "orange"}`)
                    .missed(!attack.hits)
                    .waitUntilFinished(-1000)
            },
            "force": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.forceSound ?? "")
                    .delay(options.forceSoundDelay ?? 0)
                    .volume(options.forceVolume ?? 0.5)
                    .playIf(options.forceSound !== "" && options.forceSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.eldritch_blast.${options.forceColor ?? "purple"}`)
                    .missed(!attack.hits)
                    .waitUntilFinished(-3000)
            },
            "lightning": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.lightningSound ?? "")
                    .delay(options.lightningSoundDelay ?? 0)
                    .volume(options.lightningVolume ?? 0.5)
                    .playIf(options.lightningSound !== "" && options.lightningSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.chain_lightning.primary.${options.lightningColor ?? "blue"}`)
                    .missed(!attack.hits)
                    .waitUntilFinished(-1500)
            },
            "poison": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.poisonSound ?? "")
                    .delay(options.poisonSoundDelay ?? 0)
                    .volume(options.poisonVolume ?? 0.5)
                    .playIf(options.poisonSound !== "")
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.spell_projectile.skull.${options.poisonColor ?? "pinkpurple"}`)
                    .missed(!attack.hits)
                    .waitUntilFinished(-1500)
            },
            "psychic": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.psychicSound ?? "")
                    .delay(options.psychicSoundDelay ?? 0)
                    .volume(options.psychicVolume ?? 0.5)
                    .playIf(options.psychicSound !== "" && options.psychicSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.disintegrate.${options.psychicColor ?? "dark_red"}`)
                    .missed(!attack.hits)
                    .waitUntilFinished(-1750)
            },
            "thunder": (sequence, attack, options) => {
                sequence
                    .sound()
                    .file(options.thunderSound ?? "")
                    .delay(options.thunderSoundDelay ?? 0)
                    .volume(options.thunderVolume ?? 0.5)
                    .playIf(options.thunderSound !== "" && options.thunderSound)
                    .effect()
                    .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file(`jb2a.bullet.01.${options.thunderColor ?? "blue"}`)
                    .missed(!attack.hits)
                    .name(`chaos-missile-thunder-${attack.origin.id}`)
                    .waitUntilFinished(-1000)
                    .sound()
                    .file(options.thunderShatterSound ?? "")
                    .delay(options.thunderShatterSoundDelay ?? 0)
                    .volume(options.thunderShatterVolume ?? 0.5)
                    .playIf(options.thunderShatterSound !== "" && options.thunderShatterSound)
                    .effect()
                    .atLocation(`chaos-missile-thunder-${attack.origin.id}`)
                    .file(`jb2a.shatter.${options.thunderShatterColor ?? "blue"}`)
                    .waitUntilFinished(-1500)
            },
        };
        
        const item = data.item;
        const effectOptions = item.getFlag("advancedspelleffects", "effectOptions");
        const range = item.system.range.value;
        const hitTarget = Array.from(data.hitTargets)[0];
        const attackHit = Array.from(data.hitTargets).length > 0;
        const target = Array.from(data.targets)[0];
        let returnObj = {};
        let spellState = game.ASESpellStateManager.getSpell(item.uuid);
        if (!spellState) return;
        if(!hitTarget) {
            spellState.finished = true;
            game.ASESpellStateManager.removeSpell(item.uuid);
        }
        console.log("ASE | CHAOS BOLT | Spell State: ", spellState);
        if(hitTarget){
            spellState.options.targetsHit.push(hitTarget.document.uuid);
        }
        if(spellState.options.nextTargets) {
            //remove nextTargets from object
            delete spellState.options.nextTargets;
        }
        const damageRoll = data.damageRoll;
        let die1;
        let die2;
        if(damageRoll.terms[0].faces === 8){
            die1 = damageRoll.terms[0].results[0].result;
            die2 = damageRoll.terms[0].results[1].result;
        }
        const firstElement = Object.keys(elements)[die1-1];
        const secondElement = Object.keys(elements)[die2-1];
        let damageType = await warpgate.buttonDialog({
            buttons: [{label: `First D8 Result: ${die1} <img src="${elements[firstElement]}"/> ${firstElement.slice(0, 1).toUpperCase() + firstElement.slice(1)} damage`, value: firstElement},
            {label: `Second D8 Result: ${die2} <img src="${elements[secondElement]}"/> ${secondElement.slice(0, 1).toUpperCase() + secondElement.slice(1)} damage`, value: secondElement}],
            title: 'Pick Damage Type...'
        }, 'row');
        if(!damageType) {
            spellState.finished = true;
            game.ASESpellStateManager.removeSpell(item.uuid);
            ui.notifications.error("Spell Aborted: You must pick a damage type!");
            return returnObj;
        }
        console.log("ASE | CHAOS BOLT | Damage Type: ", damageType.toLowerCase());
        returnObj['newDamageType'] = damageType;

        if(die1 !== die2) {
            spellState.finished = true;
            game.ASESpellStateManager.removeSpell(item.uuid);
        } else if (die1 === die2 && attackHit) {
            const potentialTargets = canvas.tokens.placeables.filter(function (target) {
                return target.actor?.system?.attributes.hp.value > 0
                    && canvas.grid.measureDistance(spellState.options.caster, target) <= range
                    /* target does not appear in spellState.targetsHit list */ && !spellState.options.targetsHit.includes(target.document.uuid)
                    && target !== spellState.options.caster
            });
            console.log("ASE | CHAOS BOLT | Potential Targets: ", potentialTargets);
            if (!potentialTargets.length) {
                spellState.finished = true;
                game.ASESpellStateManager.removeSpell(item.uuid);
            } else {
                const targetList = potentialTargets.map((target, index) => {
                    return `
                    <tr class="chaos-bolt-target" tokenId="${target.id}">
                        <td class="chaos-bolt-flex">
                            <img src="${target.document.texture.src}" width="30" height="30" style="border:0px"> - ${target.name}
                        </td>
                        <td>
                            <input type="checkbox" class='target' name="${index}">
                        </td>
                    </tr>
                    `;
                }).join('');
        
                const content = `
                <style>
                    .chaos-bolt-flex {
                        display: inline-flex;
                        align-items: center;
                    }
                    .chaos-bolt-flex img {
                        margin-right: 0.5rem;
                    }
                </style>
                <p>Choose next target: </p>
                <form class="flexcol">
                    <table width="100%">
                        <tbody>
                            <tr>
                                <th>Potential Target</th>
                                <th>Jump to</th>
                            </tr>
                            ${targetList}
                        </tbody>
                    </table>
                </form>
                `;
        
                let newTargets = await new Promise(async resolve => {
                    let resolved = false;
                    new Dialog({
                        title: "Chaos Bolt: Choose New Target",
                        content,
                        buttons: {
                            one: {
                                icon: `<i class="fas fa-bolt"></i>`,
                                label: "HURL!",
                                callback: async (html) => {
                                    let selected_targets = html.find('input:checkbox:checked');
                                    let targetData = [];
                                    for (let input of selected_targets) {
                                        targetData.push(potentialTargets[Number(input.name)].document.uuid);
                                    }
                                    resolved = true;
                                    resolve(targetData);
                                }
                            }
                        },
                        close: () => {
                            if (!resolved) resolve(false);
                        },
                        render: (html) => {
        
                            const jumpCount = 1;
        
                            html.find(".chaos-bolt-target").on("mouseenter", function (e) {
                                let token = canvas.tokens.get($(this).attr('tokenId'));
                                token._onHoverIn(e);
                            }).on("mouseleave", function (e) {
                                let token = canvas.tokens.get($(this).attr('tokenId'));
                                token._onHoverOut(e);
                            });
        
                            let numJumps = 1;
        
                            html.find("input:checkbox").on('change', function () {
                                let total = html.find('input:checkbox:checked').length;
                                html.find('input:checkbox:not(:checked)').each(function () {
                                    $(this).prop('disabled', total === numJumps);
                                });
                            });
        
                        }
                    }).render(true);
        
                });
                console.log("ASE | CHAOS BOLT | New Target: ", newTargets);
                if(!newTargets) {
                    spellState.finished = true;
                    game.ASESpellStateManager.removeSpell(item.uuid);
                }
                if (newTargets.length > 0) {
                    returnObj['newTargets'] = newTargets;
                }
            }
            
        }
        let sequence = new Sequence();
        damageSequences[damageType.toLowerCase()](sequence, {origin: spellState.options.caster, target: target, hits: attackHit}, effectOptions)
        sequence.play();
        return returnObj;
        
    }



    async playSequence() {

        if (!game.modules.get('sequencer')?.active) return;
        if (!game.modules.get('jb2a_patreon')?.active) return;

        let sequence = new Sequence();

        for (const attack of this.attackData) {
            damageSequences[attack.damageType](sequence, attack, this.effectOptions)
        }

        sequence.play();
    }

}