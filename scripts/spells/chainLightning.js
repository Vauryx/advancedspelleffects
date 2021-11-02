// Magic Missile spell
import {ChainDialog} from "../apps/chain-lightning-dialog.js";

export class chainLightning {
    static async registerHooks() {
        return;
    }
    static async selectTargets(midiData){
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const numTargets = midiData.itemLevel - 2;
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const  aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions") ?? {};
        aseEffectOptions['targetMarkerType'] = 'jb2a.lightning_ball';
        aseEffectOptions['targetMarkerColor'] = 'blue';
        aseEffectOptions['missileType'] = 'bolt';
        aseEffectOptions['baseScale'] = 0.1;
        /*aseEffectOptions['missileAnim'] = 'jb2a.magic_missile';
        aseEffectOptions['dmgDie'] = 'd4';
        aseEffectOptions['dmgDieCount'] = 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = 1;*/
       new ChainDialog({casterId: casterToken.id, numTargets: numTargets, itemCardId: itemCardId, effectOptions: aseEffectOptions}).render(true);
    }
}