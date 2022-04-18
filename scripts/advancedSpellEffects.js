import { setupASESocket } from "./aseSockets.js";
import { concentrationHandler } from "./concentrationHandler.js";
import { midiHandler } from "./midiHandler.js";
import { noMidiHandler } from "./noMidiHandler.js";
import { MissileDialog } from "./apps/missile-dialog.js";
// Importing spells
import { animateDead } from "./spells/animateDead.js";
import { chaosBolt } from "./spells/chaosBolt.js";
import { darkness } from "./spells/darkness.js";
import { detectMagic } from "./spells/detectMagic.js";
import { callLightning } from "./spells/callLightning.js";
import { fogCloud } from "./spells/fogCloud.js";
import { spiritualWeapon } from "./spells/spiritualWeapon.js";
import { steelWindStrike } from "./spells/steelWindStrike.js";
import { thunderStep } from "./spells/thunderStep.js";
import { summonCreature } from "./spells/summonCreature.js";
import { witchBolt } from "./spells/witchBolt.js";
import { magicMissile } from "./spells/magicMissile.js";
import { scorchingRay } from "./spells/scorchingRay.js";
import { eldritchBlast } from "./spells/eldritchBlast.js";
import { moonBeam } from "./spells/moonBeam.js";
import { mirrorImage } from "./spells/mirrorImage.js";
import { wallOfForce } from "./spells/wallOfForce.js";
import { detectStuff } from "./spells/detectStuff.js";
import { wallSpell } from "./spells/wallSpell.js";
//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
    setupASESocket();
});

//Take care of Setup
const aseModules = {
    animateDead,
    chaosBolt,
    callLightning,
    concentrationHandler,
    detectMagic,
    fogCloud,
    detectStuff,
    darkness,
    magicMissile,
    spiritualWeapon,
    steelWindStrike,
    thunderStep,
    summonCreature,
    witchBolt,
    midiHandler,
    noMidiHandler,
    MissileDialog,
    scorchingRay,
    eldritchBlast,
    moonBeam,
    mirrorImage,
    wallOfForce,
    wallSpell
}
Hooks.once('ready', async function () {
    Object.values(aseModules).forEach(cl => cl.registerHooks());
    Hooks.on('sequencerReady', () => {
        function easeOutElasticCustom(x) {
            const c4 = (2 * Math.PI) / 10;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -12 * x) * Math.sin((x * 12 - 0.75) * c4) + 1;
        }
        Sequencer.registerEase("easeOutElasticCustom", easeOutElasticCustom);
    });
});
