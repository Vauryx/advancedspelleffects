import ASESettings from "./apps/aseSettings.js";
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
    let aseSpellList = [game.i18n.format("ASE.Darkness"),
    game.i18n.format('ASE.DetectMagic'),
    game.i18n.format('ASE.FogCloud'),
      game.i18n.format('ASE.SteelWindStrike'),
      game.i18n.format('ASE.ThunderStep'),
      game.i18n.format('ASE.SpiritualWeapon'),
      game.i18n.format('ASE.CallLightning'),
      game.i18n.format('ASE.AnimateDead'),
      game.i18n.format('ASE.WitchBolt'),
      game.i18n.format('ASE.VampiricTouch'),
      game.i18n.format('ASE.MagicMissile'),
      game.i18n.format('ASE.ScorchingRay'),
      game.i18n.format('ASE.EldritchBlast')];
      console.log("ASE: aseSpellList:", aseSpellList);
    let isSummon = data.item.name.includes(game.i18n.format("ASE.Summon"));
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

