import * as utilFunctions from "../utilityFunctions.js";
export class ASESettings extends FormApplication {
    constructor() {
        super(...arguments);
        this.flags = this.object.data.flags.advancedspelleffects;
        if (this.flags) {
            if (!this.flags.effectOptions) {
                this.flags.effectOptions = {};
            }
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/ase-settings.html',
            id: 'ase-item-settings',
            title: "Advanced Spell Effects Settings",
            resizable: true,
            width: "auto",
            height: "auto",
            closeOnSubmit: true
        });
    }

    async setItemDetails(item) {
        let data = {
            "activation": { "type": "action", "cost": 1, "condition": "" },
            "duration": { "value": null, "units": "" },
            "target": { "value": null, "width": null, "units": "", "type": "" },
            "range": { "value": null, "long": null, "units": "" },
            "uses": { "value": 0, "max": 0, "per": null },
            "consume": { "type": "", "target": null, "amount": null },
            "ability": null,
            "actionType": "other",
            "attackBonus": 0,
            "critical": null,
            "damage": { "parts": [], "versatile": "" },
            "formula": "",
            "save": { "ability": "", "dc": null, "scaling": "spell" },
            "materials": { "value": "", "consumed": false, "cost": 0, "supply": 0 },
            "scaling": { "mode": "none", "formula": "" }
        };
        switch (item.name) {
            case "Detect Magic":
                data.duration = { "value": 10, "units": "minute" };
                break;
            case "Darkness":
                data.level = 2;
                data.duration = { "value": 10, "units": "minute" };
                break;
            case "Fog Cloud":
                data.level = 1;
                data.duration = { "value": 10, "units": "minute" };
                break;
            case 'Steel Wind Strike':
                data.level = 5;
                break;
            case 'Thunder Step':
                data.level = 3;
                break;
            case 'Spiritual Weapon':
                data.level = 2;
                break;
            case 'Call Lightning':
                data.level = 3;
                data.duration = { "value": 10, "units": "minute" };
                break;
            case 'Witch Bolt':
                data.level = 1;
                data.actionType = "rsak"
                data.damage.parts.push(["1d12", "lightning"])
                data.duration = { "value": 10, "units": "minute" };
                data.scaling.formula = "1d12";
                data.scaling.mode = "level";
                break;
            case 'Vampiric Touch':
                data.level = 3;
                data.actionType = "msak"
                data.damage.parts.push(["3d6", "necrotic"])
                data.duration = { "value": 1, "units": "minute" };
                data.scaling.formula = "1d6";
                data.scaling.mode = "level";
        }
        let updates = { data };
        await item.update(updates);
    }

    async setEffectData(item) {
        //console.log(item);
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        let flags = this.object.data.flags;
        let itemName = item.name;
        let returnOBJ = {};
        //console.log("Detected item name: ", itemName);
        await this.setItemDetails(item);
        switch (itemName) {
            case 'Detect Magic':
                let detectMagicWaves = `jb2a.detect_magic.circle`;
                let detectMagicWaveColorOptions = utilFunctions.getDBOptions(detectMagicWaves);

                let detectMagicAuras = `jb2a.magic_signs.circle.02.divination.intro`;
                let detectMagicAuraColorOptions = utilFunctions.getDBOptions(detectMagicAuras);

                returnOBJ = {
                    dmWaveColors: detectMagicWaveColorOptions,
                    dmAuraColors: detectMagicAuraColorOptions
                };
                break;
            case 'Steel Wind Strike':
                let weaponsPathMap = {
                    "sword": "melee.01"/*,
                    "mace": "melee",
                    "greataxe": "melee",
                    "greatsword": "melee",
                    "handaxe": "melee",
                    "spear": "melee.01"*/
                };
                let availWeapons = Object.keys(weaponsPathMap);
                let weaponOptions = {};
                availWeapons.forEach((weapon) => {
                    weaponOptions[weapon] = capitalizeFirstLetter(weapon);
                })
                let weaponsColors = {};
                let colorOptions = {};
                availWeapons.forEach(async (weapon) => {
                    let availColors = Sequencer.Database.getPathsUnder(`jb2a.${weapon}.${weaponsPathMap[weapon]}`);
                    weaponsColors[weapon] = availColors;
                });
                let currentWeapon = flags.advancedspelleffects?.effectOptions?.weapon ?? `sword`;
                weaponsColors[currentWeapon].forEach((color) => {
                    console.log(color);
                    colorOptions[color] = capitalizeFirstLetter(color);
                });
                returnOBJ = {
                    swsWeapons: weaponOptions,
                    weaponColors: colorOptions
                }
                break;
            case 'Witch Bolt':
                let initialBoltAnim = 'jb2a.chain_lightning.primary';
                let initialBoltColorOptions = utilFunctions.getDBOptions(initialBoltAnim);

                let streamAnim = 'jb2a.witch_bolt';
                let streamColorOptions = utilFunctions.getDBOptions(streamAnim);

                returnOBJ = {
                    initialBoltColors: initialBoltColorOptions,
                    streamColors: streamColorOptions
                }
                break;
            case 'Vampiric Touch':
                let vampiricTouchCasterAnim = 'jb2a.energy_strands.overlay';
                let vampiricTouchStrandAnim = `jb2a.energy_strands.range.standard`;
                let vampiricTouchImpactAnim = `jb2a.impact.004`;

                let vampiricTouchCasterColorOptions = utilFunctions.getDBOptions(vampiricTouchCasterAnim);
                let vampiricTouchStrandColorOptions = utilFunctions.getDBOptions(vampiricTouchStrandAnim);
                let vampiricTouchImpactColorOptions = utilFunctions.getDBOptions(vampiricTouchImpactAnim);

                returnOBJ = {
                    vtCasterColors: vampiricTouchCasterColorOptions,
                    vtStrandColors: vampiricTouchStrandColorOptions,
                    vtImpactColors: vampiricTouchImpactColorOptions
                }
                break;
            case 'Moonbeam':
                let moonbeamAnim = 'jb2a.moonbeam.01.intro';
                let moonbeamColorOptions = getDBOptions(moonbeamAnim);

                returnOBJ = {
                    moonbeamColors: moonbeamColorOptions
                }
                break;
        }
        if (itemName == 'Scorching Ray' || itemName == 'Magic Missile' || itemName == 'Eldritch Blast') {
            let baseAnim;
            let targetMarkerAnim;
            switch (itemName) {
                case 'Scorching Ray':
                    baseAnim = 'jb2a.scorching_ray.02';
                    targetMarkerAnim = 'jb2a.markers.01';
                    break;
                case 'Magic Missile':
                    baseAnim = 'jb2a.magic_missile';
                    targetMarkerAnim = 'jb2a.moonbeam.01.loop';
                    break;
                case 'Eldritch Blast':
                    baseAnim = 'jb2a.eldritch_blast';
                    targetMarkerAnim = 'jb2a.markers.02';
                    break;
            }
            let missileColorOptions = utilFunctions.getDBOptions(baseAnim);
            let targetMarkerColorOptions = utilFunctions.getDBOptions(targetMarkerAnim);
            returnOBJ = {
                missileColors: missileColorOptions,
                targetMarkerColors: targetMarkerColorOptions
            }
            console.log(returnOBJ);
        }
        else if (itemName.includes("Summon") || itemName == "Animate Dead") {
            let magicSignsRaw = `jb2a.magic_signs.circle.02`;
            let magicSchoolOptions = utilFunctions.getDBOptions(magicSignsRaw);

            let magicSchoolColorsRaw = `jb2a.magic_signs.circle.02.${flags.advancedspelleffects?.effectOptions?.magicSchool ?? 'abjuration'}.intro`;
            let magicSchoolColorOptions = utilFunctions.getDBOptions(magicSchoolColorsRaw);

            let effectAColorsRaw = `jb2a.eldritch_blast`;
            let effectAColorOptions = utilFunctions.getDBOptions(effectAColorsRaw);

            let effectBColorsRaw = `jb2a.energy_strands.complete`;
            let effectBColorOptions = utilFunctions.getDBOptions(effectBColorsRaw);

            let portalColorsRaw = `jb2a.portals.vertical.vortex`;
            let portalColorOptions = utilFunctions.getDBOptions(portalColorsRaw);

            let portalImpactColorsRaw = `jb2a.impact.010`;
            let portalImpactColorOptions = utilFunctions.getDBOptions(portalImpactColorsRaw);

            let summonActorsList = game.folders?.getName("ASE-Summons")?.contents ?? [];
            let summonOptions = {};
            let currentSummonTypes = {};

            summonActorsList.forEach((actor) => {
                summonOptions[actor.name] = actor.id;
            });

            returnOBJ = {
                summonOptions: summonOptions,
                summons: currentSummonTypes,
                magicSchoolOptions: magicSchoolOptions,
                magicSchoolColorOptions: magicSchoolColorOptions,
                effectAColorOptions: effectAColorOptions
            };
            if (itemName == "Animate Dead") {
                currentSummonTypes = flags.advancedspelleffects?.effectOptions?.summons ?? { Zombie: { name: "", actor: "" }, Skeleton: { name: "", actor: "" } };
                returnOBJ["effectBColorOptions"] = effectBColorOptions;
            }
            else {
                currentSummonTypes = flags.advancedspelleffects?.effectOptions?.summons ?? [{ name: "", actor: "", qty: 1 }];
                returnOBJ["itemId"] = item.id;
                if (item.parent) {
                    returnOBJ["summonerId"] = item.parent.id;
                }
                else {
                    returnOBJ["summonerId"] = "";
                }
                returnOBJ["portalColorOptions"] = portalColorOptions;
                returnOBJ["portalImpactColorOptions"] = portalImpactColorOptions;
            }
            returnOBJ.summons = currentSummonTypes;
            //console.log(returnOBJ);
        }
        return returnOBJ;
    }

    async getData() {
        let flags = this.object.data.flags;
        let item = this.object;
        let itemName = item.name;
        let content = "";
        let effectData;
        if (flags.advancedspelleffects?.enableASE) {
            effectData = await this.setEffectData(item);
        }
        return {
            flags: this.object.data.flags,
            itemName: itemName,
            effectData: effectData,
            content: content
        };

    }
    activateListeners(html) {
        //console.log(html);
        super.activateListeners(html);
        html.find('.ase-enable-checkbox input[type="checkbox"]').click(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
        html.find('.ase-enable-checkbox select').change(evt => {
            this.submit({ preventClose: true }).then(() => this.render());
        });
        //console.log(this);
        html.find('.addType').click(this._addSummonType.bind(this));
        html.find('.removeType').click(this._removeSummonType.bind(this));
    }

    async _removeSummonType(e) {
        //console.log(e);
        let summonsTable = document.getElementById("summonsTable").getElementsByTagName('tbody')[0];
        let row = summonsTable.rows[summonsTable.rows.length - 1];
        let cells = row.cells;
        //console.log(row, cells);
        let summonTypeIndex = cells[1].children[0].name.match(/\d+/)[0];
        //console.log(summonTypeIndex);
        let itemId = document.getElementById("hdnItemId").value;
        let actorId = document.getElementById("hdnSummonerId").value;
        let item;
        if (actorId != "") {
            let summoner = game.actors.get(actorId);
            item = summoner.items.get(itemId);
            //console.log(summoner, item);
        }
        else {
            item = game.items.get(itemId);
            //console.log(item);
        }
        summonsTable.rows[summonsTable.rows.length - 1].remove();
        await item.unsetFlag("advancedspelleffects", `effectOptions.summons.${summonTypeIndex}`);
        if (this.flags) {
            delete this.flags.effectOptions.summons[summonTypeIndex];
        }

        //console.log(this.flags);
        this.submit({ preventClose: true }).then(() => this.render());
    }

    async _addSummonType(e) {
        //console.log(e);
        let summonsTable = document.getElementById("summonsTable").getElementsByTagName('tbody')[0];
        //console.log(summonsTable);
        //console.log(this);
        let newSummonRow = summonsTable.insertRow(-1);
        let newLabel1 = newSummonRow.insertCell(0);
        let newTextInput = newSummonRow.insertCell(1);
        let newLabel2 = newSummonRow.insertCell(2);
        let newSelect = newSummonRow.insertCell(3);
        let newLabel3 = newSummonRow.insertCell(4);
        let newQtyInput = newSummonRow.insertCell(5);
        newLabel1.innerHTML = `<label><b>Summon Type Name:</b></label>`;
        newTextInput.innerHTML = `<input type="text"
        name="flags.advancedspelleffects.effectOptions.summons.${summonsTable.rows.length - 1}.name"
        value="">`;
        newLabel2.innerHTML = `<label><b>Associated Actor:</b></label>`;
        newSelect.innerHTML = ` <select name="flags.advancedspelleffects.effectOptions.summons.${summonsTable.rows.length - 1}.actor">
        {{#each ../effectData.summonOptions as |id name|}}
        <option value="">{{name}}</option>
        {{/each}}
    </select>`;
        newLabel3.innerHTML = `<label><b>Summon Quantity:</b></label>`;
        newQtyInput.innerHTML = `<input style='width: 3em;' type="text"
    name="flags.advancedspelleffects.effectOptions.summons.${summonsTable.rows.length - 1}.qty"
    value=1>`;
        this.submit({ preventClose: true }).then(() => this.render());
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

Handlebars.registerHelper('ifCondASE', function (v1, operator, v2, options) {
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
        case 'includes':
            return (v1.includes(v2)) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


