import * as utilFunctions from "./utilityFunctions.js";
import { setupASESocket } from "./aseSockets.js";
import { aseSocket } from "./aseSockets.js";
import { concentrationHandler } from "./concentrationHandler.js";
// Importing spells
import { darkness } from "./spells/darkness.js";
import { detectMagic } from "./spells/detectMagic.js";
import { callLightning } from "./spells/callLightning.js";
import { fogCloud } from "./spells/fogCloud.js";
import { spiritualWeapon } from "./spells/spiritualWeapon.js";
import { steelWindStrike } from "./spells/steelWindStrike.js";
import { thunderStep } from "./spells/thunderStep.js";
import { summonCreature } from "./spells/summonCreature.js";

//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
    setupASESocket();
});

Hooks.on('init', () => {
    //Hook onto MIDI- roll complete to activate effects
    if (game.modules.get("midi-qol")?.active) {
        Hooks.on("midi-qol.RollComplete", (workflow) => {
            console.log("MIDI Workflow: ", workflow);
            handleASE(workflow)
        });
    }

    async function handleASE(midiData) {
        // check if the spell being rolled is marked as an ASE spell
        let item = midiData.item;
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
                await darkness.createDarkness(midiData);
                break;
            case "Detect Magic":
                await detectMagic.activateDetectMagic(midiData);
                break;
            case "Call Lightning":
                if (!midiData.flavor?.includes("Lightning Bolt")) {
                    await callLightning.createStormCloud(midiData);
                }
                break;
            case "Fog Cloud":
                await fogCloud.createFogCloud(midiData);
                break;
            case "Spiritual Weapon":
                await spiritualWeapon.createSpiritualWeapon(midiData);
                break;
            case "Steel Wind Strike":
                await steelWindStrike.doStrike(midiData);
                break;
            case "Thunder Step":
                await thunderStep.doTeleport(midiData);
                break;
        }
        if(item.name.includes("Summon")){
            await summonCreature.doSummon(midiData);
        }
        else
        {
            console.log("--SPELL NAME NOT RECOGNIZED--");
        }
    }
});


//Take care of Setup
const aseModules = {
    callLightning,
    concentrationHandler,
    detectMagic,
    fogCloud,
    darkness,
    spiritualWeapon,
    steelWindStrike,
    thunderStep,
    summonCreature
}
Hooks.once('ready', async function () {
    Object.values(aseModules).forEach(cl => cl.registerHooks());
});
