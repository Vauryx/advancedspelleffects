import ASESettings from "./aseSettings.js";
Hooks.on(`renderItemSheet5e`, async (app, html, data) => {
    console.log("ASE: Caught actor sheet render hook!");
    const aseBtn = $(`<a class="ase-item-settings" title="ASE"><i class="fas fa-biohazard"></i>ASE</a>`);
    aseBtn.click(ev => {
      new ASESettings(app.entity, {}).render(true);
    });
      html.closest('.app').find('.ase-item-settings').remove();
      let titleElement = html.closest('.app').find('.window-title');
      aseBtn.insertAfter(titleElement);
  });