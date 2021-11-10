import * as utilFunctions from "./utilityFunctions.js";

// Importing spells
import { darkness } from "./spells/darkness.js";
import { detectMagic } from "./spells/detectMagic.js";
import { callLightning } from "./spells/callLightning.js";
import { fogCloud } from "./spells/fogCloud.js";
import { spiritualWeapon } from "./spells/spiritualWeapon.js";
import { steelWindStrike } from "./spells/steelWindStrike.js";
import { thunderStep } from "./spells/thunderStep.js";
import { summonCreature } from "./spells/summonCreature.js";
import { animateDead } from "./spells/animateDead.js";
import { witchBolt } from "./spells/witchBolt.js";
import { vampiricTouch } from "./spells/vampiricTouch.js";
import { magicMissile } from "./spells/magicMissile.js";
import { scorchingRay } from "./spells/scorchingRay.js";
import { eldritchBlast } from "./spells/eldritchBlast.js";
import { moonBeam } from "./spells/moonBeam.js";

export class ASEHandler {
    static async handleASE(data) {
        // check if the spell being rolled is marked as an ASE spell
        let item = data.item;
        let aseFlags = item?.data?.flags?.advancedspelleffects ?? false;
        if (!aseFlags.enableASE) return;

        // check for required modules
        let missingModule = utilFunctions.checkModules();
        if (missingModule) {
            ui.notifications.error(missingModule);
            return;
        }
        //Activate spell
        switch (item.name) {
            case game.i18n.localize("ASE.Darkness"):
                await darkness.createDarkness(data);
                return;
            case game.i18n.localize('ASE.DetectMagic'):
                await detectMagic.activateDetectMagic(data);
                return;
            case game.i18n.localize('ASE.CallLightning'):
                if (!data.flavor?.includes("Lightning Bolt")) {
                    await callLightning.createStormCloud(data);
                }
                return;
            case game.i18n.localize('ASE.CallLightningBolt'):
                if (!data.flavor?.includes("Lightning Bolt")) {
                    await callLightning.callLightningBolt(aseFlags.effectOptions.stormTileId);
                }
                return;
            case game.i18n.localize('ASE.FogCloud'):
                await fogCloud.createFogCloud(data);
                return;
            case game.i18n.localize('ASE.SpiritualWeapon'):
                await spiritualWeapon.createSpiritualWeapon(data);
                return;
            case game.i18n.localize('ASE.SteelWindStrike'):
                if (!data.flavor?.includes("Steel Wind Strike")) {
                    await steelWindStrike.doStrike(data);
                }
                return;
            case game.i18n.localize('ASE.ThunderStep'):
                await thunderStep.doTeleport(data);
                return;
            case game.i18n.localize('ASE.AnimateDead'):
                await animateDead.rise(data);
                return;
            case game.i18n.localize('ASE.WitchBolt'):
                if (data.flavor != "Witch Bolt - Damage Roll (1d12 Lightning)" || !data.flavor) {
                    console.log('Casting Witch Bolt!', data.flavor);
                    await witchBolt.cast(data);
                }
                else {
                    console.log('Activating Witch Bolt!', data.flavor);
                    //await witchBolt.activateBolt(data);
                }
                return;
            case game.i18n.localize('ASE.ActivateWitchBolt'):
                if (data.flavor != "Witch Bolt - Damage Roll (1d12 Lightning)" || !data.flavor) {
                    await witchBolt.activateBolt(data);
                }
                return;
            case game.i18n.localize('ASE.VampiricTouch'):
                await vampiricTouch.cast(data);
                return;
            case game.i18n.localize('ASE.VampiricTouchAttack'):
                await vampiricTouch.activateTouch(data);
                return;
            case game.i18n.localize('ASE.MagicMissile'):
                await magicMissile.selectTargets(data);
                return;
            case game.i18n.localize('ASE.ScorchingRay'):
                await scorchingRay.selectTargets(data);
                return;
            case game.i18n.localize('ASE.EldritchBlast'):
                await eldritchBlast.selectTargets(data);
                return;
            case game.i18n.localize('ASE.Moonbeam'):
                if (!data.flavor?.includes("- Damage Roll")) {
                    await moonBeam.callBeam(data);
                }
                return;
            case game.i18n.localize('ASE.MoveMoonbeam'):
                await moonBeam.moveBeam(data);
                return;
        }
        if (item.name.includes(game.i18n.localize("ASE.Summon"))) {
            await summonCreature.doSummon(data);
            return;
        }
        else {
            console.log("--SPELL NAME NOT RECOGNIZED--");
            return;
        }
    }
}