import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class statusEffect {
    constructor(data) {
        this.item = data.item;
        this.duration = data.duration;
        this.effects = data.effects ?? [];
        this.statusEffect = [];
    }

    static registerHooks() {
        return;
    }

    async apply(target) {

        let statusEffects = target.data.flags?.advancedspelleffects?.statusEffects ?? [];
        console.log('THIS: ', this);
        if (this.effects.source) {
            this.effects.sourceId = target.id;
        }
        this.statusEffect.push(this.parseEffect(this.effects));

        console.log('statusEffects: ', this.statusEffect);
        statusEffects.push(this.statusEffect);
        //await target.setFlag('advancedspelleffects', 'statusEffects', statusEffects);
        await aseSocket.executeAsGM("updateFlag", target.id, "statusEffects", statusEffects);

    }

    parseEffect(effect) {
        console.log(effect);
        let returnData = { type: effect.effectType };
        let effectValue;
        let sourceId;
        if (effect.effectTargetType == "damageRolls") {

            effectValue = effect.value;
            if (effect.source) {
                sourceId = effect.sourceId;
            } else {
                sourceId = 'ALL';
            }
            returnData['source'] = sourceId;
            returnData['value'] = effectValue;
            returnData['trigger'] = 'damageRolls';
            returnData['triggerType'] = 'attacks';

        } else if (effect.effectType == "abilityChecks") {

            effectValue = effect.value;
            returnData['value'] = effectValue;
            returnData['trigger'] = 'abilityChecks';

        } else if (effect.effectType == "attackRolls") {

        } else if (effect.effectType == "savingThrows") {

        } else if (effect.effectType == "speed") {

        } else if (effect.effectType == "initiative") {

        } else if (effect.effectType == "AC") {

        } else {
            console.log("Invalid status effect type: ", effect.effectType);
            return;
        }
        return returnData;
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        const effectTypes = {
            'buff': "Buff",
            'debuff': "Debuff",
            'advantage': "Advantage",
            'disadvantage': "Disadvantage"
        };

        const effectTargetTypes = {
            "damageRolls": "Damage",
            "abilityChecks": "Ability Checks",
            "attackRolls": "Attack Rolls",
            "savingThrows": "Saving Throws",
            "speed": "Speed",
            "initiative": "Initiative",
            "AC": "AC"
        };

        spellOptions.push({
            label: game.i18n.localize("ASE.StatusEffectTypesLabel"),
            tooltip: game.i18n.localize("ASE.StatusEffectTypesTooltip"),
            type: 'dropdown',
            options: effectTypes,
            name: 'flags.advancedspelleffects.effectOptions.statusEffects.effectType',
            flagName: 'statusEffects.effectType',
            flagValue: currFlags.statusEffects?.effectType ?? 'buff',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.StatusEffectTargetTypesLabel"),
            tooltip: game.i18n.localize("ASE.StatusEffectTargetTypesTooltip"),
            type: 'dropdown',
            options: effectTargetTypes,
            name: 'flags.advancedspelleffects.effectOptions.statusEffects.effectTargetType',
            flagName: 'statusEffects.effectTargetType',
            flagValue: currFlags.statusEffects?.effectTargetType ?? 'damageRolls',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.StatusEffectValueLabel"),
            tooltip: game.i18n.localize("ASE.StatusEffectValueTooltip"),
            type: 'formula',
            name: 'flags.advancedspelleffects.effectOptions.statusEffects.value',
            flagName: 'statusEffects.value',
            flagValue: currFlags.statusEffects?.value ?? '1d4',

        });

        spellOptions.push({
            label: game.i18n.localize("ASE.StatusEffectSourceLabel"),
            tooltip: game.i18n.localize("ASE.StatusEffectSourceTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.statusEffects.source',
            flagName: 'statusEffects.source',
            flagValue: currFlags.statusEffects?.source ?? false,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }

}