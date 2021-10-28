export class chaosBoltDialog extends FormApplication {
    constructor (options = {}) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        //console.log(this);
        this.data = {};
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/chaos-bolt-dialog.html',
            id: 'chaos-bolt-dialog',
            title: "Chaos Bolt",
            resizable: true,
            width: "auto",
            height: "auto",
            close: () => { ui.notify }
        });
    }
    async getData() {
        return {
            data: this.data
        };

    }
    async _updateObject(event, formData) {
        console.log(formData);

    }
}