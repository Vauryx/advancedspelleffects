// Magic Missile spell
import {MissileDialog} from "../apps/missile-dialog.js";

export class eldritchBlast {
    static async registerHooks() {
        return;
    }
    static async selectTargets(midiData){
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const characterLevel =  casterActor.data?.data?.details?.level ?? 1;
        let numMissiles = 1;
        if(characterLevel >= 5){
            numMissiles+=1;
        }
        if(characterLevel >= 11){
            numMissiles+=1;
        }
        if(characterLevel >= 17){
            numMissiles+=1;
        }
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const  aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        aseEffectOptions['targetMarkerType'] = 'jb2a.markers.02';
        aseEffectOptions['missileType'] = 'beam';
        aseEffectOptions['missileAnim'] = 'jb2a.eldritch_blast';
        aseEffectOptions['baseScale'] = 0.1;
        aseEffectOptions['dmgDie'] = 'd10';
        aseEffectOptions['dmgDieCount'] = 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = 0;
        aseEffectOptions['impactDelay'] = -3000;
        let invocations = aseEffectOptions.invocations;
        if(invocations.agonizingBlast){
            aseEffectOptions.dmgMod = casterActor?.data?.data?.abilities?.cha?.mod ?? 0;
        }
        
    new MissileDialog({
      casterId: casterToken.id,
      numMissiles: numMissiles,
      itemCardId: itemCardId,
      effectOptions: aseEffectOptions,
      item: spellItem,
      actionType: "rsak",
    }).render(true);
    }
}