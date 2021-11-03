// Magic Missile spell
import {MissileDialog} from "../apps/missile-dialog.js";
import * as utilFunctions from "../utilityFunctions.js";
export class magicMissile {
    static async registerHooks() {
        if (game.settings.get("advancedspelleffects", "preloadFiles")) {
            Hooks.on("sequencer.ready", magicMissile._preloadAssets);
        }
        return;
    }
    static async _preloadAssets() {
        console.log('Preloading assets for ASE Magic Missile...');
        let assetDBPaths = [];
        let magicMissileItems = utilFunctions.getAllItemsNamed("Magic Missile");
        if (magicMissileItems.length > 0) {
            for (let item of magicMissileItems) {
                let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
                //console.log(aseSettings);
                let missileAnim = `jb2a.magic_missile.${aseSettings.missileColor}`;
                let markerAnim = `jb2a.moonbeam.01.loop.${aseSettings.targetMarkerColor}`;
                if(!assetDBPaths.includes(missileAnim)) assetDBPaths.push(missileAnim);
                if(!assetDBPaths.includes(markerAnim)) assetDBPaths.push(markerAnim);
            }
        }
        //console.log('DB Paths about to be preloaded...', assetDBPaths);
        //console.log('Files about to be preloaded...', assetFilePaths);
        console.log(`Preloaded ${assetDBPaths.length} assets for Magic Missile!`);
        await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
        return;
    }
    static async selectTargets(midiData){
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const numMissiles = midiData.itemLevel + 2;
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const  aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        aseEffectOptions['targetMarkerType'] = 'jb2a.moonbeam.01.loop';
        aseEffectOptions['missileType'] = 'dart';
        aseEffectOptions['missileAnim'] = 'jb2a.magic_missile';
        aseEffectOptions['baseScale'] = 0.05;
        aseEffectOptions['dmgDie'] = 'd4';
        aseEffectOptions['dmgDieCount'] = 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = 1;
        new MissileDialog({casterId: casterToken.id, numMissiles: numMissiles, itemCardId: itemCardId, effectOptions: aseEffectOptions}).render(true);
    }
}