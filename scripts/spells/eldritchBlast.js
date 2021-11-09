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
        aseEffectOptions['dmgDie'] = 'd10';
        aseEffectOptions['dmgDieCount'] = 1;
        aseEffectOptions['dmgType'] = 'force';
        aseEffectOptions['dmgMod'] = 0;
        aseEffectOptions['impactDelay'] = -3000;
        let invocations = aseEffectOptions.invocations;
        if (invocations.agonizingBlast) {
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

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const missileColorOptions = utilFunctions.getDBOptions('jb2a.eldritch_blast');
        const targetMarkerColorOptions = utilFunctions.getDBOptions('jb2a.markers.02');

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        spellOptions.push({
            label: 'Agonizing Blast: ',
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.invocations.agonizingBlast',
            flagName: 'invocations.agonizingBlast',
            flagValue: currFlags.invocations?.agonizingBlast ?? false,
        });

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
            label: 'Beam Color: ',
            type: 'dropdown',
            options: missileColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.missileColor',
            flagName: 'missileColor',
            flagValue: currFlags.missileColor,
        });
        soundOptions.push({
            label: 'Beam Intro Sound: ',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSound',
            flagName: 'missileIntroSound',
            flagValue: currFlags.missileIntroSound ?? '',
        });
        soundOptions.push({
            label: 'Beam Intro Sound Delay',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroSoundDelay',
            flagName: 'missileIntroSoundDelay',
            flagValue: currFlags.missileIntroSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Beam Intro Volume',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.missileIntroVolume',
            flagName: 'missileIntroVolume',
            flagValue: currFlags.missileIntroVolume ?? 1,
        });

        soundOptions.push({
            label: 'Beam Impact Sound: ',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSound',
            flagName: 'missileImpactSound',
            flagValue: currFlags.missileImpactSound ?? '',
        });
        soundOptions.push({
            label: 'Beam Impact Sound Delay',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.missileImpactSoundDelay',
            flagName: 'missileImpactSoundDelay',
            flagValue: currFlags.missileImpactSoundDelay ?? 0,
        });
        soundOptions.push({
            label: 'Beam Impact Volume',
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