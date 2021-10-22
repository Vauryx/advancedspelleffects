import { animateDeadDialog } from "../apps/animte-dead-dialog.js"
import * as utilFunctions from "../utilityFunctions.js";

export class animateDead {
    static registerHooks() {
        return;
    }
    static async rise(midiData) {

        const actorD = midiData.actor;
        const tokenD = canvas.tokens.get(midiData.tokenId);
        const itemD = actorD.items.getName(midiData.item.name);
        let aseSettings = itemD.getFlag("advancedspelleffects", "effectOptions");
        const spellLevel = midiData.itemLevel ? Number(midiData.itemLevel) : 3;
        const spellSaveDC = midiData.actor?.data?.data?.attributes?.spelldc ?? 10;
        const raiseLimit = (2 * spellLevel) - 5;

        let corpses = canvas.tokens.placeables.filter(function (target) {
            return target?.actor?.data?.data?.attributes?.hp?.value == 0
                && utilFunctions.measureDistance(utilFunctions.getCenter(tokenD.data), utilFunctions.getCenter(target.data)) <= 10
                && target !== tokenD
        });

        console.log("Detected corpses in range: ", corpses);
        new animateDeadDialog(corpses, {raiseLimit: raiseLimit, effectSettings: aseSettings}).render(true);

    }
}