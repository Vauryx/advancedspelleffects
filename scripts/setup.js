import ASESettings from "./apps/aseSettings.js";
import { PatrolMenu } from "./apps/ase-settings-new.js";

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
    let aseSpellList = [game.i18n.localize("ASE.Darkness"),
    game.i18n.localize('ASE.DetectMagic'),
    game.i18n.localize('ASE.FogCloud'),
    game.i18n.localize('ASE.SteelWindStrike'),
    game.i18n.localize('ASE.ThunderStep'),
    game.i18n.localize('ASE.SpiritualWeapon'),
    game.i18n.localize('ASE.CallLightning'),
    game.i18n.localize('ASE.AnimateDead'),
    game.i18n.localize('ASE.WitchBolt'),
    game.i18n.localize('ASE.VampiricTouch'),
    game.i18n.localize('ASE.MagicMissile'),
    game.i18n.localize('ASE.ScorchingRay'),
    game.i18n.localize('ASE.EldritchBlast')];

    let isSummon = data.item.name.includes(game.i18n.localize("ASE.Summon"));
    //console.log('ASE Spell List: ', aseSpellList);
    if (!aseSpellList.includes(data.item.name) && !isSummon) {
      return;
    }
    const aseBtn = $(`<a class="ase-item-settings" title="ASE"><i class="fas fa-biohazard"></i>ASE</a>`);
    aseBtn.click(ev => {
      new ASESettings(app.document, {}).render(true);
    });
    html.closest('.app').find('.ase-item-settings').remove();
    let titleElement = html.closest('.app').find('.window-title');
    aseBtn.insertAfter(titleElement);
  });
});

