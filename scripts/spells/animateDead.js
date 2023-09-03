import { animateDeadDialog } from "../apps/animte-dead-dialog.js"
import ASESettings from "../apps/aseSettings.js";
import * as utilFunctions from "../utilityFunctions.js";

export class animateDead {
    static registerHooks() {
        return;
    }

    static async rise(midiData) {

        const actorD = midiData.actor;
        const tokenD = canvas.tokens.get(midiData.tokenId);
        const itemD = actorD.items.getName(midiData.item.name);
        let aseSettings = itemD.getFlag("advancedspelleffects", "effectOptions");
        const spellLevel = midiData.itemLevel ? Number(midiData.itemLevel) : 3;
        const spellSaveDC = midiData.actor?.system?.attributes?.spelldc ?? 10;
        const raiseLimit = (2 * spellLevel) - 5;
        const detectRange = aseSettings.range ?? 10;
        let corpses = canvas.tokens.placeables.filter(function (target) {
            return target?.actor?.system?.attributes?.hp?.value == 0
                && utilFunctions.measureDistance(utilFunctions.getCenter(tokenD.document), utilFunctions.getCenter(target.document)) <= detectRange
                && target !== tokenD
        });

        new animateDeadDialog(corpses, { raiseLimit: raiseLimit, effectSettings: aseSettings }).render(true);

    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const magicSignsRaw = `jb2a.magic_signs.circle.02`;
        const magicSchoolOptions = utilFunctions.getDBOptions(magicSignsRaw);

        const magicSchoolColorsRaw = `jb2a.magic_signs.circle.02.${currFlags.advancedspelleffects?.effectOptions?.magicSchool ?? 'abjuration'}.intro`;
        const magicSchoolColorOptions = utilFunctions.getDBOptions(magicSchoolColorsRaw);

        const effectAColorsRaw = `jb2a.eldritch_blast`;
        const effectAColorOptions = utilFunctions.getDBOptions(effectAColorsRaw);

        const effectBColorsRaw = `jb2a.energy_strands.complete`;
        const effectBColorOptions = utilFunctions.getDBOptions(effectBColorsRaw);

        const portalColorsRaw = `jb2a.portals.vertical.vortex`;
        const portalColorOptions = utilFunctions.getDBOptions(portalColorsRaw);

        const portalImpactColorsRaw = `jb2a.impact.010`;
        const portalImpactColorOptions = utilFunctions.getDBOptions(portalImpactColorsRaw);
        let summonActorsFolder = game.folders?.getName("ASE-Summons");
        let summonActorsList = summonActorsFolder?.contents ?? [];

        if (!summonActorsFolder || summonActorsList.length === 0) {
            summonActorsList = await utilFunctions.createFolderWithActors("ASE-Summons", ["Skeleton", "Zombie"]);
        }

        let summonOptions = {};
        summonActorsList.forEach((actor) => {
            summonOptions[actor.id] = actor.name;
        });

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        spellOptions.push({
            label: game.i18n.localize('ASE.ZombieActorLabel'),
            type: 'dropdown',
            options: summonOptions,
            name: 'flags.advancedspelleffects.effectOptions.animateDeadSummons.zombie.actor',
            flagName: 'animateDeadSummons.zombie.actor',
            flagValue: currFlags.animateDeadSummons?.zombie?.actor ?? '',
        });
        spellOptions.push({
            label: game.i18n.localize('ASE.SkeletonActorLabel'),
            type: 'dropdown',
            options: summonOptions,
            name: 'flags.advancedspelleffects.effectOptions.animateDeadSummons.skeleton.actor',
            flagName: 'animateDeadSummons.skeleton.actor',
            flagValue: currFlags.animateDeadSummons?.skeleton?.actor ?? '',
        });

        spellOptions.push({
            label: game.i18n.localize('ASE.animateDeadRangeLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.range',
            flagName: 'range',
            flagValue: currFlags.range ?? 10
        });

        animOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolLabel'),
            type: 'dropdown',
            options: magicSchoolOptions,
            name: 'flags.advancedspelleffects.effectOptions.magicSchool',
            flagName: 'magicSchool',
            flagValue: currFlags.magicSchool ?? 'abjuration',
        });
        animOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolColorLabel'),
            type: 'dropdown',
            options: magicSchoolColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolColor',
            flagName: 'magicSchoolColor',
            flagValue: currFlags.magicSchoolColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolColorLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolSound',
            flagName: 'magicSchoolSound',
            flagValue: currFlags.magicSchoolSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolIntroSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolSoundDelay',
            flagName: 'magicSchoolSoundDelay',
            flagValue: currFlags.magicSchoolSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolIntroSoundVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolVolume',
            flagName: 'magicSchoolVolume',
            flagValue: currFlags.magicSchoolVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolOutroSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolSoundOutro',
            flagName: 'magicSchoolSoundOutro',
            flagValue: currFlags.magicSchoolSoundOutro ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolOutroSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolSoundDelayOutro',
            flagName: 'magicSchoolSoundDelayOutro',
            flagValue: currFlags.magicSchoolSoundDelayOutro ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.MagicSchoolOutroSoundVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolVolumeOutro',
            flagName: 'magicSchoolVolumeOutro',
            flagValue: currFlags.magicSchoolVolumeOutro ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize('ASE.EffectAColorLabel'),
            type: 'dropdown',
            options: effectAColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.effectAColor',
            flagName: 'effectAColor',
            flagValue: currFlags.effectAColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.EffectASoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.effectASound',
            flagName: 'effectASound',
            flagValue: currFlags.effectASound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.EffectASoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.effectASoundDelay',
            flagName: 'effectASoundDelay',
            flagValue: currFlags.effectASoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.EffectASoundVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.effectASoundVolume',
            flagName: 'effectASoundVolume',
            flagValue: currFlags.effectASoundVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize('ASE.EffectBColorLabel'),
            type: 'dropdown',
            options: effectBColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.effectBColor',
            flagName: 'effectBColor',
            flagValue: currFlags.effectBColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.EffectBSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.effectBSound',
            flagName: 'effectBSound',
            flagValue: currFlags.effectBSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.EffectBSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.effectBSoundDelay',
            flagName: 'effectBSoundDelay',
            flagValue: currFlags.effectBSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.EffectBSoundVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.effectBSoundVolume',
            flagName: 'effectBSoundVolume',
            flagValue: currFlags.effectBSoundVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            animOptions: animOptions,
            spellOptions: spellOptions,
            soundOptions: soundOptions,
        }

    }

}