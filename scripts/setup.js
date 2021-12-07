import ASESettings from "./apps/aseSettings.js";
import { versionMigration } from "./versionMigration.js"

Hooks.once('init', async function () {
  console.log("Registering ASE game settings...");
  game.settings.register("advancedspelleffects", "preloadFiles", {
    name: "Preload animation files on start-up?",
    hint: "This caches the video files when foundry starts for all users. This will use some extra bandwidth, but animations will play more smoothly the first time.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
});

Hooks.once('ready', async function () {
  if (!game.user.isGM) return;
  Hooks.on(`renderItemSheet5e`, async (app, html, data) => {
    //console.log("ASE: Caught actor sheet render hook!", data);
    //console.log('ASE Spell List: ', aseSpellList);
    if (app.document.getFlag("advancedspelleffects", "disableSettings")) {
      return;
    }
    const aseBtn = $(`<a class="ase-item-settings" title="Advanced Spell Effects"><i class="fas fa-magic"></i>ASE</a>`);
    aseBtn.click(async (ev) => {
      await versionMigration.handle(app.document);
      new ASESettings(app.document, {}).render(true);
    });
    html.closest('.app').find('.ase-item-settings').remove();
    let titleElement = html.closest('.app').find('.window-title');
    aseBtn.insertAfter(titleElement);
  });
});

