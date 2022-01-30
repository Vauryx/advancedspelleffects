import ASESettings from "./apps/aseSettings.js";
import { versionMigration } from "./versionMigration.js"
import * as utilFunctions from "./utilityFunctions.js";

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
});

Hooks.once('ready', async function () {
  if (game.settings.get("advancedspelleffects", "overrideGridHighlight")) {
    libWrapper.register('advancedspelleffects', "MeasuredTemplate.prototype.highlightGrid", _ASEGridHighlight, "OVERRIDE");
    libWrapper.register("advancedspelleffects", "MeasuredTemplate.prototype.render", _ASERemoveTemplateBorder, "WRAPPER");
    utilFunctions.cleanUpTemplateGridHighlights();
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

  function _ASEGridHighlight() {
    if (this.data.flags.advancedspelleffects) return;
    const grid = canvas.grid;
    const d = canvas.dimensions;
    const border = this.borderColor;
    const color = this.fillColor;

    // Only highlight for objects which have a defined shape
    if (!this.id || !this.shape) return;

    // Clear existing highlight
    const hl = grid.getHighlightLayer(`Template.${this.id}`);
    hl.clear();

    // If we are in gridless mode, highlight the shape directly
    if (grid.type === CONST.GRID_TYPES.GRIDLESS) {
      const shape = this.shape.clone();
      if ("points" in shape) {
        shape.points = shape.points.map((p, i) => {
          if (i % 2) return this.y + p;
          else return this.x + p;
        });
      } else {
        shape.x += this.x;
        shape.y += this.y;
      }
      return grid.grid.highlightGridPosition(hl, { border, color, shape });
    }

    // Get number of rows and columns
    const [maxr, maxc] = grid.grid.getGridPositionFromPixels(d.width, d.height);
    let nr = Math.ceil(((this.data.distance * 1.5) / d.distance) / (d.size / grid.h));
    let nc = Math.ceil(((this.data.distance * 1.5) / d.distance) / (d.size / grid.w));
    nr = Math.min(nr, maxr);
    nc = Math.min(nc, maxc);

    // Get the offset of the template origin relative to the top-left grid space
    const [tx, ty] = canvas.grid.getTopLeft(this.data.x, this.data.y);
    const [row0, col0] = grid.grid.getGridPositionFromPixels(tx, ty);
    const hx = Math.ceil(canvas.grid.w / 2);
    const hy = Math.ceil(canvas.grid.h / 2);
    const isCenter = (this.data.x - tx === hx) && (this.data.y - ty === hy);

    // Identify grid coordinates covered by the template Graphics
    for (let r = -nr; r < nr; r++) {
      for (let c = -nc; c < nc; c++) {
        let [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(row0 + r, col0 + c);
        const testX = (gx + hx) - this.data.x;
        const testY = (gy + hy) - this.data.y;
        let contains = ((r === 0) && (c === 0) && isCenter) || this.shape.contains(testX, testY);
        if (!contains) continue;
        grid.grid.highlightGridPosition(hl, { x: gx, y: gy, border, color });
      }
    }
  }

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

