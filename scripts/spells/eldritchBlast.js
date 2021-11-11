// Magic Missile spell
import { MissileDialog } from "../apps/missile-dialog.js";
import * as utilFunctions from "../utilityFunctions.js";
export class eldritchBlast {
    static async registerHooks() {
        return;
    }
    static async selectTargets(midiData) {
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const characterLevel = casterActor.data?.data?.details?.level ?? 1;
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
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
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
        if (invocations.agonizingBlast) {
            aseEffectOptions.dmgMod += casterActor?.data?.data?.abilities?.cha?.mod ?? 0;
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

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const missileColorOptions = utilFunctions.getDBOptions('jb2a.eldritch_blast');
        const targetMarkerColorOptions = utilFunctions.getDBOptions('jb2a.markers.02');

        const dieOptions = {
            'd4': 'd4',
            'd6': 'd6',
            'd8': 'd8',
            'd10': 'd10',
            'd12': 'd12',
            'd20': 'd20',
        };

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        spellOptions.push({
            label: game.i18n.localize("ASE.AgonizingBlastLabel"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.invocations.agonizingBlast',
            flagName: 'invocations.agonizingBlast',
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
            flagValue: currFlags.targetMarkerColor,
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
            flagValue: currFlags.markerVolume ?? 1,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.BeamColorLabel"),
            type: 'dropdown',
            options: missileColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileColor',
            flagName: 'missileColor',
            flagValue: currFlags.missileColor,
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
            flagValue: currFlags.missileIntroVolume ?? 1,
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
            flagValue: currFlags.missileImpactVolume ?? 1,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}