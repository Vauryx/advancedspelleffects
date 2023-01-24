import "./styles/module.css";
import ASESettings from "./svelteApps/ASESettingsApp.js";
import * as utilFunctions from "./utilityFunctions.js";
import { setupASESocket } from "./aseSockets.js";
import { concentrationHandler } from "./concentrationHandler.js";
import { midiHandler } from "./midiHandler.js";
import { noMidiHandler } from "./noMidiHandler.js";
import { MissileDialog } from "./apps/missile-dialog.js";
import { SpellStateMachine } from "./SpellStateMachine.js";
import { spellStore } from "./stores/spellStore.js";
import { versionMigration } from "./versionMigration.js";
//import { effectOptionsStore } from "./stores/effectOptionsStore.js";

//Take care of Setup
const aseModules = {
  concentrationHandler,
  midiHandler,
  noMidiHandler,
  MissileDialog
}

Hooks.once('init', async function () {
  console.log("Registering ASE game settings...");
  game.ASESpellStateManager = new SpellStateMachine();
});

//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
  setupASESocket();
  versionMigration.MigrateV1();
});

Hooks.once('ready', async function () {
  
  
  Object.values(aseModules).forEach(cl => cl.registerHooks());

  Hooks.on('sequencerReady', () => {
    spellStore.initialize();
    //effectOptionsStore.initialize();
    //);
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




  if (!game.user.isGM) return;

  Hooks.on(`renderItemSheet`, async (app, html, data) => {
    //console.log("ASE: Caught actor sheet render hook!", data);
    //console.log('ASE Spell List: ', aseSpellList);
    if (app.document.getFlag("advancedspelleffects", "disableSettings")) {
      return;
    }
    const aseBtn = $(`<a class="ase-item-settings" title="Advanced Spell Effects"><i class="fas fa-magic"></i>ASE</a>`);
    aseBtn.click(async ev => {
      //await versionMigration.handle(app.document);
      new ASESettings(app.document, {}).render(true);
    });
    html.closest('.app').find('.ase-item-settings').remove();
    let titleElement = html.closest('.app').find('.window-title');
    aseBtn.insertAfter(titleElement);
  });
});

