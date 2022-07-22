// Magic Missile spell
import  MissileDialog  from "../svelteApps/MissileDialog.js";
import * as utilFunctions from "../utilityFunctions.js";
export class eldritchBlast {
    static async registerHooks() {
        return;
    }
    static async selectTargets(midiData) {
        const casterActor = midiData.actor;
        //console.log("casterActor", casterActor);
        const casterToken = canvas.tokens.get(midiData.tokenId);
        //console.log("casterToken", casterToken);
        const characterLevel = casterActor.data?.data?.details?.level ?? casterActor.data?.data?.details?.spellLevel ?? 1;
        //console.log(`Caster level: ${characterLevel}`);
        let numMissiles = 1;
        if (characterLevel >= 5) {
            numMissiles += 1;
        }
        if (characterLevel >= 11) {
            numMissiles += 1;
        }
        if (characterLevel >= 17) {
            numMissiles += 1;
        }
        const itemCardId = midiData.itemCardId;
        const spellItem = midiData.item;
        const aseEffectOptions = JSON.parse(JSON.stringify(spellItem?.getFlag("advancedspelleffects", "effectOptions") ?? {}));
        aseEffectOptions['targetMarkerType'] = 'jb2a.markers.02';
        aseEffectOptions['missileType'] = 'beam';
        aseEffectOptions['missileAnim'] = 'jb2a.eldritch_blast';
        aseEffectOptions['baseScale'] = 0.1;
        aseEffectOptions['dmgDie'] = aseEffectOptions.dmgDie ?? 'd10';
        aseEffectOptions['dmgDieCount'] = aseEffectOptions.dmgDieCount ?? 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = aseEffectOptions.dmgMod ?? 0;
        aseEffectOptions['impactDelay'] = -3000;
        let invocations = aseEffectOptions.invocations;
        //console.log('ASEEffectOptions.dmgMod: ', aseEffectOptions.dmgMod);
        if (invocations.agonizingBlast) {
            aseEffectOptions.dmgMod += casterActor?.data?.data?.abilities?.cha?.mod ?? 0;
        }
        //console.log('ASEEffectOptions: ', aseEffectOptions);
        new MissileDialog({
            casterId: casterToken.id,
            numMissiles: numMissiles,
            itemCardId: itemCardId,
            effectOptions: aseEffectOptions,
            item: spellItem,
            actionType: "rsak",
        }).render(true);
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const missileColorOptions = utilFunctions.getDBOptions('jb2a.eldritch_blast');
        const targetMarkerColorOptions = utilFunctions.getDBOptions('jb2a.markers.02');

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

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        spellOptions.push({
            label: game.i18n.localize("ASE.AgonizingBlastLabel"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.agonizingBlast',
            flagName: 'agonizingBlast',
            flagValue: currFlags.invocations?.agonizingBlast ?? false,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieCountLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgDieCount',
            flagName: 'dmgDieCount',
            flagValue: currFlags.dmgDieCount ?? 1,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieLabel"),
            type: 'dropdown',
            options: dieOptions,
            name: 'flags.advancedspelleffects.effectOptions.dmgDie',
            flagName: 'dmgDie',
            flagValue: currFlags.dmgDie ?? 'd10',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageBonusLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgMod',
            flagName: 'dmgMod',
            flagValue: currFlags.dmgMod ?? 0,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.TargetmarkerColorLabel"),
            type: 'dropdown',
            options: targetMarkerColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.targetMarkerColor',
            flagName: 'targetMarkerColor',
            flagValue: currFlags.targetMarkerColor ?? 'blueyellow',
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
            label: game.i18n.localize("ASE.TargetMarkerSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.markerSound',
            flagName: 'markerSound',
            flagValue: currFlags.markerSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.TargetMarkerSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.markerSoundDelay',
            flagName: 'markerSoundDelay',
            flagValue: currFlags.markerSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.TargetMarkerVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.markerVolume',
            flagName: 'markerVolume',
            flagValue: currFlags.markerVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.BeamColorLabel"),
            type: 'dropdown',
            options: missileColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileColor',
            flagName: 'missileColor',
            flagValue: currFlags.missileColor ?? 'purple',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamIntroSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSound',
            flagName: 'missileIntroSound',
            flagValue: currFlags.missileIntroSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamIntroSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSoundDelay',
            flagName: 'missileIntroSoundDelay',
            flagValue: currFlags.missileIntroSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamIntroVolumeLabel"),
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
            label: game.i18n.localize("ASE.BeamImpactSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSound',
            flagName: 'missileImpactSound',
            flagValue: currFlags.missileImpactSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamImpactSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.BeamImpactSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSoundDelay',
            flagName: 'missileImpactSoundDelay',
            flagValue: currFlags.missileImpactSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.BeamImpactVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactVolume',
            flagname: 'missileImpactVolume',
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
            soundOptions: soundOptions
        }

    }
}