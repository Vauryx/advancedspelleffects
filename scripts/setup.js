import ASESettings from "./apps/aseSettings.js";
Hooks.once('ready', async function () {
  if (!game.user.isGM) return;
  Hooks.on(`renderItemSheet5e`, async (app, html, data) => {
    //console.log("ASE: Caught actor sheet render hook!", data);
    let aseSpellList = ['Darkness',
      'Detect Magic',
      'Fog Cloud',
      'Steel Wind Strike',
      'Thunder Step',
      'Spiritual Weapon',
      'Call Lightning',
      'Animate Dead',
      'Witch Bolt',
      'Vampiric Touch',
      'Magic Missile',
      'Scorching Ray',
      'Eldritch Blast'];
    let isSummon = data.item.name.includes("Summon");
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

