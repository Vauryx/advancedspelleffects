import ASESettings from "./svelteApps/aseSettings.js";
import { versionMigration } from "./versionMigration.js"
import * as utilFunctions from "./utilityFunctions.js";
import { setupASESocket } from "./aseSockets.js";
import { concentrationHandler } from "./concentrationHandler.js";
import { midiHandler } from "./midiHandler.js";
import { noMidiHandler } from "./noMidiHandler.js";
import { MissileDialog } from "./apps/missile-dialog.js";

import { spellStore } from "./stores/spellStore.js";

//Take care of Setup
const aseModules = {
  concentrationHandler,
  midiHandler,
  noMidiHandler,
  MissileDialog
}

Hooks.once('init', async function () {
  console.log("Registering ASE game settings...");
  const debouncedReload = foundry.utils.debounce(() => { window.location.reload(); }, 100);
  game.settings.register("advancedspelleffects", "overrideGridHighlight", {
    name: "Enable ASE Grid Highlight Override",
    hint: "This overrides the foundry default template behaviour and removes the grid highlighting for templates specifically placed by ASE spells. Other templates should function as normal.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload
  });
  game.settings.register("advancedspelleffects", "overrideTemplateBorder", {
    name: "Enable ASE Template Border Override",
    hint: "This overrides the foundry default template behaviour and removes the border for templates specifically placed by ASE spells. Other templates should function as normal.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload
  });
});

//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
  setupASESocket();
});

Hooks.once('ready', async function () {
  spellStore.initialize();

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
  if (game.settings.get("advancedspelleffects", "overrideGridHighlight")) {
    libWrapper.register('advancedspelleffects', "MeasuredTemplate.prototype.highlightGrid", _ASEGridHighlightWrapper, "WRAPPER");
    utilFunctions.cleanUpTemplateGridHighlights();
  }
  if (game.settings.get("advancedspelleffects", "overrideTemplateBorder")) {
    if (!game.modules.get("tokenmagic")?.active) {
      libWrapper.register("advancedspelleffects", "MeasuredTemplate.prototype.render", _ASERemoveTemplateBorder, "WRAPPER");
    } else {
      ui.notifications.info("ASE Template Border Override disabled due to conflict with TokenMagicFX Module");
    }
  }

  function _ASERemoveTemplateBorder(wrapped, ...args) {
    wrapped(...args);
    if (this.data?.flags?.advancedspelleffects) {
      if (this.data?.flags?.advancedspelleffects?.placed) {
        this.template.alpha = 0;
      } else {
        return;
      }
    }
  }

  function _ASEGridHighlightWrapper(wrapped, ...args) {
    wrapped(...args);
    if (!this.data?.flags?.advancedspelleffects) return;
    const highlight = canvas.grid.getHighlightLayer(`Template.${this.id}`);
    if (highlight) {
      highlight.clear();
    }
  }

  if (!game.user.isGM) return;

  Hooks.on(`renderItemSheet`, async (app, html, data) => {
    //console.log("ASE: Caught actor sheet render hook!", data);
    //console.log('ASE Spell List: ', aseSpellList);
    if (app.document.getFlag("advancedspelleffects", "disableSettings")) {
      return;
    }
    const aseBtn = $(`<a class="ase-item-settings" title="Advanced Spell Effects"><i class="fas fa-magic"></i>ASE</a>`);
    aseBtn.click(async ev => {
      await versionMigration.handle(app.document);
      new ASESettings(app.document, {}).render(true);
    });
    html.closest('.app').find('.ase-item-settings').remove();
    let titleElement = html.closest('.app').find('.window-title');
    aseBtn.insertAfter(titleElement);
  });
});

