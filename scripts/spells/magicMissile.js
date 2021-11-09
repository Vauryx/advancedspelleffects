// Magic Missile spell
import { MissileDialog } from "../apps/missile-dialog.js";
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
                if (!assetDBPaths.includes(missileAnim)) assetDBPaths.push(missileAnim);
                if (!assetDBPaths.includes(markerAnim)) assetDBPaths.push(markerAnim);
            }
        }
        //console.log('DB Paths about to be preloaded...', assetDBPaths);
        //console.log('Files about to be preloaded...', assetFilePaths);
        console.log(`Preloaded ${assetDBPaths.length} assets for Magic Missile!`);
        await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
        return;
    }
    static async selectTargets(midiData) {
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const numMissiles = midiData.itemLevel + 2;
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        aseEffectOptions['targetMarkerType'] = 'jb2a.moonbeam.01.loop';
        aseEffectOptions['missileType'] = 'dart';
        aseEffectOptions['missileAnim'] = 'jb2a.magic_missile';
        aseEffectOptions['baseScale'] = 0.05;
        aseEffectOptions['dmgDie'] = 'd4';
        aseEffectOptions['dmgDieCount'] = 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = 1;
        aseEffectOptions['impactDelay'] = -1000;
        new MissileDialog({ casterId: casterToken.id, numMissiles: numMissiles, itemCardId: itemCardId, effectOptions: aseEffectOptions, item: spellItem }).render(true);
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const missileColorOptions = utilFunctions.getDBOptions('jb2a.magic_missile');
        const targetMarkerColorOptions = utilFunctions.getDBOptions('jb2a.moonbeam.01.loop');

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        animOptions.push({
            label: 'Target Marker Color: ',
            type: 'dropdown',
            options: targetMarkerColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.targetMarkerColor',
            flagName: 'targetMarkerColor',
            flagValue: currFlags.targetMarkerColor,
        });
        soundOptions.push({
            label: 'Target Marker Sound: ',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.markerSound',
            flagName: 'markerSound',
            flagValue: currFlags.markerSound ?? '',
        });
        soundOptions.push({
            label: 'Target Marker Sound Delay: ',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.markerSoundDelay',
            flagName: 'markerSoundDelay',
            flagValue: currFlags.markerSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Target Marker Sound Volume: ',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.markerVolume',
            flagName: 'markerVolume',
            flagValue: currFlags.markerVolume ?? 1,
        });

        animOptions.push({
            label: 'Dart Color: ',
            type: 'dropdown',
            options: missileColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileColor',
            flagName: 'missileColor',
            flagValue: currFlags.missileColor,
        });
        soundOptions.push({
            label: 'Dart Intro Sound: ',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSound',
            flagName: 'missileIntroSound',
            flagValue: currFlags.missileIntroSound ?? '',
        });
        soundOptions.push({
            label: 'Dart Intro Sound Delay',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSoundDelay',
            flagName: 'missileIntroSoundDelay',
            flagValue: currFlags.missileIntroSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Dart Intro Volume',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroVolume',
            flagName: 'missileIntroVolume',
            flagValue: currFlags.missileIntroVolume ?? 1,
        });

        soundOptions.push({
            label: 'Dart Impact Sound: ',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSound',
            flagName: 'missileImpactSound',
            flagValue: currFlags.missileImpactSound ?? '',
        });
        soundOptions.push({
            label: 'Dart Impact Sound Delay',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSoundDelay',
            flagName: 'missileImpactSoundDelay',
            flagValue: currFlags.missileImpactSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Dart Impact Volume',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactVolume',
            flagname: 'missileImpactVolume',
            flagValue: currFlags.missileImpactVolume ?? 1,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}