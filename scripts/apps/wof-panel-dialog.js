import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class wofPanelDialog extends FormApplication {
    constructor(panelCount = 10, options = { aseData: {}, templateData: {}, type: '' }) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        this.data = {};
        this.data.aseData = this.options.aseData;
        this.data.templateData = this.options.templateData;
        this.data.type = this.options.type;
        this.data.count = panelCount;
        console.log('WOF Panel Dialog Data: ', this.data);
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/wof-panel-dialog.html',
            id: 'wof-panel-dialog',
            title: game.i18n.localize("ASE.WallOfForce"),
            resizable: true,
            width: "auto",
            height: "auto",
            close: () => { ui.notify }
        });
    }
    async getData() {
        let data = super.getData;
        data = foundry.utils.mergeObject(data, this.data);
        return data;
    }
    async _updateObject(event, formData) { }
}
export default wofPanelDialog;