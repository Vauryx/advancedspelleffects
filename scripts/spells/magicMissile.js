// Magic Missile spell
import  MissileDialog  from "../svelteApps/MissileDialog.js";
import * as utilFunctions from "../utilityFunctions.js";
export class magicMissile {
    static async registerHooks() {
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
        const numMissiles = Number(midiData.itemLevel) + 2;
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        aseEffectOptions['targetMarkerType'] = 'jb2a.moonbeam.01.loop';
        aseEffectOptions['missileType'] = 'dart';
        aseEffectOptions['missileAnim'] = 'jb2a.magic_missile';
        aseEffectOptions['baseScale'] = 0.05;
        aseEffectOptions['dmgDie'] = aseEffectOptions.dmgDie ?? 'd4';
        aseEffectOptions['dmgDieCount'] = aseEffectOptions.dmgDieCount ?? 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = aseEffectOptions.dmgMod ?? 1;
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

        const dieOptions = [
            {'d4': 'd4'},
            {'d6': 'd6'},
            {'d8': 'd8'},
            {'d10': 'd10'},
            {'d12': 'd12'},
            {'d20': 'd20'}
        ];

        const soundPlaybackOptions = [
            {'indiv': 'Individual'},
            {'group': 'Group'}];

        spellOptions.push({
            label: game.i18n.localize('ASE.DamageDieCountLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgDieCount',
            flagName: 'dmgDieCount',
            flagValue: currFlags.dmgDieCount ?? 1,
        });

        spellOptions.push({
            label: game.i18n.localize('ASE.DamageDieLabel'),
            type: 'dropdown',
            options: dieOptions,
            name: 'flags.advancedspelleffects.effectOptions.dmgDie',
            flagName: 'dmgDie',
            flagValue: currFlags.dmgDie ?? 'd10',
        });

        spellOptions.push({
            label: game.i18n.localize('ASE.DamageBonusLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgMod',
            flagName: 'dmgMod',
            flagValue: currFlags.dmgMod ?? 0,
        });

        animOptions.push({
            label: game.i18n.localize('ASE.TargetmarkerColorLabel'),
            type: 'dropdown',
            options: targetMarkerColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.targetMarkerColor',
            flagName: 'targetMarkerColor',
            flagValue: currFlags.targetMarkerColor ?? 'blue',
        });
        animOptions.push({
            label: game.i18n.localize('ASE.TargetMarkerHueLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.targetMarkerHue',
            flagName: 'targetMarkerHue',
            flagValue: currFlags.targetMarkerHue ?? 0,
        });
        animOptions.push({
            label: game.i18n.localize('ASE.TargetMarkerSaturationLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.targetMarkerSaturation',
            flagName: 'targetMarkerSaturation',
            flagValue: currFlags.targetMarkerSaturation ?? 0,
            min: -1,
            max: 1,
            step: 0.1,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.TargetMarkerSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.markerSound',
            flagName: 'markerSound',
            flagValue: currFlags.markerSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.TargetMarkerSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.markerSoundDelay',
            flagName: 'markerSoundDelay',
            flagValue: currFlags.markerSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.TargetMarkerVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.markerVolume',
            flagName: 'markerVolume',
            flagValue: currFlags.markerVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize('ASE.DartColorLabel'),
            type: 'dropdown',
            options: missileColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileColor',
            flagName: 'missileColor',
            flagValue: currFlags.missileColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.DartIntroSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSound',
            flagName: 'missileIntroSound',
            flagValue: currFlags.missileIntroSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.DartIntroSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSoundDelay',
            flagName: 'missileIntroSoundDelay',
            flagValue: currFlags.missileIntroSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.DartIntroVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroVolume',
            flagName: 'missileIntroVolume',
            flagValue: currFlags.missileIntroVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsLabel"),
            tooltip: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsTooltip"),
            type: 'dropdown',
            options: soundPlaybackOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSoundPlayback',
            flagName: 'missileIntroSoundPlayback',
            flagValue: currFlags.missileIntroSoundPlayback ?? 'indiv',

        });

        soundOptions.push({
            label: game.i18n.localize('ASE.DartImpactSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSound',
            flagName: 'missileImpactSound',
            flagValue: currFlags.missileImpactSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.DartImpactSoundDelayLabel'),
            tooltip: game.i18n.localize("ASE.DartImpactSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSoundDelay',
            flagName: 'missileImpactSoundDelay',
            flagValue: currFlags.missileImpactSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.DartImpactVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactVolume',
            flagName: 'missileImpactVolume',
            flagValue: currFlags.missileImpactVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsLabel"),
            tooltip: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsTooltip"),
            type: 'dropdown',
            options: soundPlaybackOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSoundPlayback',
            flagName: 'missileImpactSoundPlayback',
            flagValue: currFlags.missileImpactSoundPlayback ?? 'indiv',

        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: false
        }

    }
}