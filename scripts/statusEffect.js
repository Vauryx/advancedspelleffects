export class statusEffect {
    constructor(data) {
        this.item = data.item;
        this.duration = data.duration;
        this.effects = data.effects;
        this.statusEffect = [];
    }

    async apply(target) {

        let statusEffects = target.data.flags?.advancedspelleffects?.aseStatusEffects ?? [];

        for await (let effect of this.effects) {
            if (effect.type == "buff") {
                this.statusEffect.push(this.buff(effect));
            } else if (effect.type == "debuff") {
                this.statusEffect.push(this.debuff(effect));
            }
        }
        console.log('statusEffect: ', this.statusEffect);
        statusEffects.push(this.statusEffect);
        await target.setFlag('advancedspelleffects', 'statusEffects', statusEffects);

    }

    buff(effect) {
        switch (effect.effectType) {
            case "damageRolls":
                break;
            case "abilityChecks":
                break;
            case "attackRolls":
                break;
            case "savingThrows":
                break;
            case "speed":
                break;
            case "initiative":
                break;
            case "AC":
                break;
            default:
                console.log("Invalid status effect type: ", effect.effectType);
                return;
        }
    }

    debuff(effect) {
        let returnData = { type: "debuff" };
        let effectValue;
        let sourceId;
        if (effect.effectType == "damageRolls") {

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

}


/*
Deal - Take extra damage
Bonus or neg to attack rolls
Bonus or neg to ability checks
Bonus or neg to saving throws
Bonus or neg to speed
Bonus or neg to AC
Bonus or neg to Spell DC
Bonus or neg to Initiative

Advantage/disadvantage to ability checks/saving throws/attack rolls
Prevent Healing
Temp HP
- Overwrite temp hp when its more than current
- Only remove any temp specifically added by the spell itself
- Ask DM before removing temp hp
Conditions
Apply to source only ?? MAYBE ??
*/