// Magic Missile spell
import {MissileDialog} from "../apps/missile-dialog.js";
import * as utilFunctions from "../utilityFunctions.js";
export class scorchingRay {
    static async registerHooks() {
        if (game.settings.get("advancedspelleffects", "preloadFiles")) {
            Hooks.on("sequencer.ready", scorchingRay._preloadAssets);
        }
        return;
    }

    static async _preloadAssets() {
        console.log('Preloading assets for ASE Scorching Ray...');
        let assetDBPaths = [];
        let scorchingRayItems = utilFunctions.getAllItemsNamed("Scorching Ray");
        if (scorchingRayItems.length > 0) {
            for (let item of scorchingRayItems) {
                let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
                //console.log(aseSettings);
                let missileAnim = `jb2a.scorching_ray.${aseSettings.missileColor}`;
                let markerAnim = `jb2a.markers.01.${aseSettings.targetMarkerColor}`;
                if(!assetDBPaths.includes(missileAnim)) assetDBPaths.push(missileAnim);
                if(!assetDBPaths.includes(markerAnim)) assetDBPaths.push(markerAnim);
            }
        }
        //console.log('DB Paths about to be preloaded...', assetDBPaths);
        //console.log('Files about to be preloaded...', assetFilePaths);
        console.log(`Preloaded ${assetDBPaths.length} assets for Scorching Ray!`);
        await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
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
        aseEffectOptions['impactDelay'] = -1000;
        new MissileDialog({casterId: casterToken.id, numMissiles: numMissiles, itemCardId: itemCardId, effectOptions: aseEffectOptions, item: spellItem}).render(true);
    }
}