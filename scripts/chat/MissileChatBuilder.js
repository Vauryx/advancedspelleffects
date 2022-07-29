import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

export async function MissileChatBuilder(data) {
    let content = `<table id="ASEmissileDialogChatTable"><tr><th>${localize("ASE.Target")}</th><th>Hit / Miss</th><th>${localize("ASE.AttackRoll")}</th><th>${localize("ASE.DamageRoll")}</th>`
    let rolls = data.rolls;
    console.log("ASE: Missile Chat Builder: Data", data);
    console.log("ASE: Missile Chat Builder: Rolls", rolls);
    //build content table using rolls data
    for (let i = 0; i < rolls.length; i++) {
        let currAttackRoll = rolls[i].attackRoll;
        let currDamageRoll = rolls[i].damageRoll ?? {};
        let currTarget = rolls[i].target;
        let currTargetName = currTarget.name;
        let hit = rolls[i].hit;
        let currAttackBreakDown = '';
        let currDamageBreakdown = '';
        let damageTotalText = '';
        if(currAttackRoll){
            if(currAttackRoll.hasAdvantage || currAttackRoll.hasDisadvantage) {
                let advantageText = '';
                currAttackRoll.dice[0].results.forEach(result => {
                    //add result.result to advantageText with comma 
                    advantageText += result.result + ', ';
                });
                //remove last comma
                advantageText = advantageText.slice(0, -2);
                currAttackBreakDown = `[${currAttackRoll.hasAdvantage ? 'Advantage' : 'Disadvantage'} : ${advantageText}] - [${currAttackRoll.result}]`;
            } else {
                currAttackBreakDown = `[${currAttackRoll.result}]`;
            }
    
            if (currDamageRoll.isCritical) {
                currAttackRoll._total = `Critical!`;
            }
        } else {
            currAttackBreakDown = "NO ROLL";
            currAttackRoll = {_total: "NO ROLL"};
        }
        
        if(hit){
            currDamageBreakdown = `${currDamageRoll.formula} : ${currDamageRoll.result}`;
            damageTotalText = currDamageRoll.total;
        } else {
            currDamageBreakdown = `NO ROLL`;
            damageTotalText = `NO ROLL`;
        }
        content += `<tr><td><figure><img alt="Token" src="${currTarget.document.data.img}" height="40" style="border:0px"><figcaption style="white-space: nowrap;">${currTargetName}</figcaption></figure></td><td>${hit ? 'Hit' : 'Miss'}</td><td title = '${currAttackBreakDown}'>${currAttackRoll._total}</td><td title = '${currDamageBreakdown}'>${damageTotalText}</td></tr>`;
    }
    

    return content;
}