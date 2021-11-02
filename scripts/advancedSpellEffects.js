import * as utilFunctions from "./utilityFunctions.js";
import { setupASESocket } from "./aseSockets.js";
import { aseSocket } from "./aseSockets.js";
import { concentrationHandler } from "./concentrationHandler.js";
import { midiHandler } from "./midiHandler.js";
import { noMidiHandler } from "./noMidiHandler.js";
import { MissileDialog } from "./apps/missile-dialog.js";
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

//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
    setupASESocket();
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
    witchBolt,
    midiHandler,
    noMidiHandler,
    MissileDialog,
}
Hooks.once('ready', async function () {
    Object.values(aseModules).forEach(cl => cl.registerHooks());
});
