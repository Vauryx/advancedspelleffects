import * as utilFunctions from "./utilityFunctions.js";
export class statusEffectHandler {

    static registerHooks() {
        if (utilFunctions.isMidiActive()) {
            Hooks.on("midi-qol.preDamageRollComplete", statusEffectHandler.handlePreDamageRoll);
        }
    }

    static async handlePreDamageRoll(data) {
        console.log('data: ', data);
        const target = Array.from(data.targets)[0];
        const targetStatusEffects = target.getFlag('advancedspelleffects', 'statusEffects');
        console.log('target: ' + target.name);
        console.log('targetStatusEffects: ', targetStatusEffects);
    }
}