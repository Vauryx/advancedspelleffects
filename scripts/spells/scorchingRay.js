// Magic Missile spell
import {MissileDialog} from "../apps/missile-dialog.js";

export class scorchingRay {
    static async registerHooks() {
        return;
    }
    static async selectTargets(midiData){
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const numMissiles = midiData.itemLevel + 1;
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const  aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        aseEffectOptions['targetMarkerType'] = 'jb2a.markers.01';
        aseEffectOptions['missileType'] = 'ray';
        aseEffectOptions['missileAnim'] = 'jb2a.scorching_ray';
        aseEffectOptions['baseScale'] = 0.1;
        aseEffectOptions['dmgDie'] = 'd6';
        aseEffectOptions['dmgDieCount'] = 2;
        aseEffectOptions['dmgType'] = 'fire';
        aseEffectOptions['dmgMod'] = 0;
        new MissileDialog({casterId: casterToken.id, numMissiles: numMissiles, itemCardId: itemCardId, effectOptions: aseEffectOptions}).render(true);
    }
}