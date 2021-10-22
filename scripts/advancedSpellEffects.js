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
import {animateDead} from "./spells/animateDead.js";
import {witchBolt} from "./spells/witchBolt.js";

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
                return;
            case "Detect Magic":
                await detectMagic.activateDetectMagic(midiData);
                return;
            case "Call Lightning":
                if (!midiData.flavor?.includes("Lightning Bolt")) {
                    await callLightning.createStormCloud(midiData);
                }
                return;
            case "Fog Cloud":
                await fogCloud.createFogCloud(midiData);
                return;
            case "Spiritual Weapon":
                await spiritualWeapon.createSpiritualWeapon(midiData);
                return;
            case "Steel Wind Strike":
                if (!midiData.flavor?.includes("Steel Wind Strike")) {
                    await steelWindStrike.doStrike(midiData);
                }
                return;
            case "Thunder Step":
                await thunderStep.doTeleport(midiData);
                return;
            case "Animate Dead":
                await animateDead.rise(midiData);
                return;
            case 'Witch Bolt':
                if(midiData.flavor != "Witch Bolt - Damage Roll (1d12 Lightning)" || !midiData.flavor){
                    console.log('Casting Witch Bolt!',midiData.flavor );
                    await witchBolt.cast(midiData);
                }
                else{
                    console.log('Activating Witch Bolt!',midiData.flavor);
                    await witchBolt.activateBolt(midiData);
                }
                return;
        }
        if(item.name.includes("Summon")){
            await summonCreature.doSummon(midiData);
            return;
        }
        else
        {
            console.log("--SPELL NAME NOT RECOGNIZED--");
            return;
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
    summonCreature,
    animateDead,
    witchBolt
}
Hooks.once('ready', async function () {
    Object.values(aseModules).forEach(cl => cl.registerHooks());
});
