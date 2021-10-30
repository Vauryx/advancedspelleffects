// Magic Missile spell
import {magicMissileDialog} from "../apps/magic-missile-dialog.js";

export class magicMissile {
    static async registerHooks() {
        console.log('Clearing ASE Magic Missile Targets...');
        Hooks.on("sequencerEffectManagerReady", magicMissile._clearTargets);
        return;
    }

    static async _clearTargets() {
        let tokens = Array.from(canvas.tokens.placeables);
            //console.log("ASE Magic Missile Targets Detected...", tokens);
            for (let target of tokens) {
                //console.log('Target: ',target);
                let effectsOnTarget = await Sequencer.EffectManager.getEffects({ object: target }).filter((e) => {
                    //console.log('e data name',e.data.name);
                    return e.data.name.startsWith("mm-target-")
                }).forEach(async (e) => {
                    console.log('Cleaning up leftover ASE Magic Missile Effect...',e);
                    await Sequencer.EffectManager.endEffects({ object: target, name: e.data.name });
                })
                await target?.document.unsetFlag("advancedspelleffects", 'magicMissile');
            }
    }
    static async selectTargets(midiData){
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const numMissiles = midiData.itemLevel + 2;
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const  aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        new magicMissileDialog({casterId: casterToken.id, numMissiles: numMissiles, itemCardId: itemCardId, effectOptions: aseEffectOptions}).render(true);
    }
}