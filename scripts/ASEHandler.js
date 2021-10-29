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
            case "Darkness":
                await darkness.createDarkness(data);
                return;
            case "Detect Magic":
                await detectMagic.activateDetectMagic(data);
                return;
            case "Call Lightning":
                if (!data.flavor?.includes("Lightning Bolt")) {
                    await callLightning.createStormCloud(data);
                }
                return;
            case "Call Lightning Bolt":
                if(!data.flavor?.includes("Lightning Bolt")) {
                    await callLightning.callLightningBolt(aseFlags.effectOptions.stormTileId);
                }
                return;
            case "Fog Cloud":
                await fogCloud.createFogCloud(data);
                return;
            case "Spiritual Weapon":
                await spiritualWeapon.createSpiritualWeapon(data);
                return;
            case "Steel Wind Strike":
                if (!data.flavor?.includes("Steel Wind Strike")) {
                    await steelWindStrike.doStrike(data);
                }
                return;
            case "Thunder Step":
                await thunderStep.doTeleport(data);
                return;
            case "Animate Dead":
                await animateDead.rise(data);
                return;
            case 'Witch Bolt':
                if (data.flavor != "Witch Bolt - Damage Roll (1d12 Lightning)" || !data.flavor) {
                    console.log('Casting Witch Bolt!', data.flavor);
                    await witchBolt.cast(data);
                }
                else {
                    console.log('Activating Witch Bolt!', data.flavor);
                    await witchBolt.activateBolt(data);
                }
                return;
            case 'Vampiric Touch':
                await vampiricTouch.cast(data);
                return;
            case 'Vampiric Touch (Attack)':
                await vampiricTouch.activateTouch(data);
                return;
            case 'Magic Missile':
                await magicMissile.selectTargets(data);
                return;
        }
        if (item.name.includes("Summon")) {
            await summonCreature.doSummon(data);
            return;
        }
        else {
            console.log("--SPELL NAME NOT RECOGNIZED--");
            return;
        }
    }
}