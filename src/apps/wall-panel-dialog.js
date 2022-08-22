import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class wallPanelDialog extends FormApplication {
    constructor(options = { aseData: {}, templateData: {}, type: '' }) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        this.data = {};
        this.data.aseData = this.options.aseData;
        this.data.templateData = this.options.templateData;
        this.data.type = this.options.type;
        //console.log('Wall Panel Dialog Data: ', this.data);
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/src/templates/wall-panel-dialog.html',
            id: 'wall-panel-dialog',
            title: game.i18n.localize("ASE.WallPanelTitle"),
            resizable: true,
            width: "auto",
            height: "auto",
            left: game.user?.getFlag("advancedspelleffects", "wallPanelDialogPos.left") ?? "auto",
            top: game.user?.getFlag("advancedspelleffects", "wallPanelDialogPos.top") ?? "auto",
            submitOnClose: true,
            close: () => { ui.notify }
        });
    }
    async getData() {
        return { data: this.data };
    }
    async _updateObject(event, formData) {
        await aseSocket.executeAsGM("updateFlag", game.user.id, "wallPanelDialogPos", { left: this.position.left, top: this.position.top });
    }
}
export default wallPanelDialog;