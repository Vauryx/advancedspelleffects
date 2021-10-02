export class ASESettings extends FormApplication {
    constructor() {
        super(...arguments);
        this.flags = this.object.data.flags.advancedspelleffects
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/ase-settings.html',
            id: 'ase-item-settings',
            title: "Advanced Spell Effects Settings",
            resizable: true,
            width: 600,
            height: "auto",
            closeOnSubmit: true
        });
    }

    getData() {
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        let flags = this.object.data.flags;
        console.log('Advanced Spell Effects Flags: ',flags.advancedspelleffects);

        let item = this.object.name;
        //console.log("Item: ", item);
        let content = "";
        let aseSpellList = ['Darkness', 'Detect Magic', 'Fog Cloud'];
        if (!aseSpellList.includes(item)) {
            item = 'No effect available for this item!'
        }
        
        let detectMagicWaves = `jb2a.detect_magic.circle`;
        let detectMagicWaveColors = Sequencer.Database.getEntry(detectMagicWaves);
        detectMagicWaveColors = Object.keys(detectMagicWaveColors);
        let detectMagicWaveColorOptions = {};
        detectMagicWaveColors.forEach((color) => {
            detectMagicWaveColorOptions[color] = capitalizeFirstLetter(color);
        });
        let detectMagicAuras = `jb2a.magic_signs.circle.02.divination.intro`;
        let detectMagicAuraColors = Sequencer.Database.getEntry(detectMagicAuras);
        detectMagicAuraColors = Object.keys(detectMagicAuraColors);
        let detectMagicAuraColorOptions = {};
        detectMagicAuraColors.forEach((color) => {
            detectMagicAuraColorOptions[color] = capitalizeFirstLetter(color);
        });
        return {
            enableASE: flags.advancedspelleffects?.enableASE ?? false,
            // Detect Magic Sections
            waveColor: flags.advancedspelleffects?.effectOptions?.waveColor ?? 'blue',
            auraColor: flags.advancedspelleffects?.effectOptions?.auraColor ?? 'blue',
            aseSpellList: aseSpellList,
            flags: this.object.data.flags,
            item: item,
            detectMagicAuraColors: detectMagicAuraColorOptions,
            detectMagicWaveColors: detectMagicWaveColorOptions,
            content: content
        };

    }
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.ase-enable-checkbox input[type="checkbox"]').click(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
        html.find('.ase-enable-checkbox select').change(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
    }

    async _updateObject(event, formData) {
        //console.log(formData);
        formData = expandObject(formData);
        if (!formData.changes)
            formData.changes = [];
        formData.changes = Object.values(formData.changes);
        for (let c of formData.changes) {
            //@ts-ignore
            if (Number.isNumeric(c.value))
                c.value = parseFloat(c.value);
        }
        return this.object.update(formData);
    }
}
export default ASESettings;

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


