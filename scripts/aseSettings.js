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
            "level": 1,
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
            }
        let updates = { data };
        await item.update(updates);
    }

    async setEffectData(item) {
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        let flags = this.object.data.flags;
        let itemName = item.name;
        let newItemMacro = "";
        let returnOBJ = {};
        await this.setItemDetails(item);
        switch (itemName) {
            case 'Detect Magic':
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
                let currentAuraColor = flags.advancedspelleffects?.effectOptions?.auraColor ?? `blue`;
                let currentWaveColor = flags.advancedspelleffects?.effectOptions?.waveColor ?? `blue`;
                //console.log("Current ItemMacro: ", item.getFlag("itemacro", "macro.data.command"));

                //console.log("Replacing current item macro...");
                newItemMacro = `/*ASE_REPLACED*/if(args[0] === "off"){
let midiData = args[args.length-1];
let caster = canvas.tokens.get(midiData.tokenId);
let users = [];
for (const user in game.actors.get(midiData.actorId).data.permission) {
if (user == "default") continue;
users.push(user);
}
let objects = await Tagger.getByTag("magical", { ignore: [caster] });
let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
let magicalObjects = [];

magicalObjects = objects.map(o => {
            let distance = canvas.grid.measureDistance(caster, o);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        })
        for (let magical of magicalObjects) {
            if (!magical.school) {
                continue;
            }
            await game.AdvancedSpellEffects.updateFlag(magical.obj.id, "magicDetected", false);
            Sequencer.EffectManager.endEffects({name: ` + "`${magical.obj.document.id}-magicRune`" + `, object: magical.obj});
            Sequencer.EffectManager.endEffects({name: ` + "`${caster.id}-detectMagicAura`" + `, object: caster});
            new Sequence("Advanced Spell Effects")
                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .setMustache(magical)
                .zIndex(0)
                .effect()
                .file("jb2a.magic_signs.circle.02.divination.outro.` + currentAuraColor + `")
                .scale(0.2)
                .belowTokens()
                .attachTo(caster)
            .play()
        }
}
else if(args[0] != "on" && args[0] != "off"){
let options = {version: "MIDI", args: args, waveColor: "`+ currentWaveColor + `", auraColor: "` + currentAuraColor + `"};
game.AdvancedSpellEffects.detectMagic(options);
}`;
                //console.log(newItemMacro);
                returnOBJ = {
                    dmWaveColors: detectMagicWaveColorOptions,
                    dmAuraColors: detectMagicAuraColorOptions
                };
                break;
            case 'Darkness':
                newItemMacro = `/*ASE_REPLACED*/if(args[0] === "off"){
                            //console.log("token: ", token)
                            let darknessTiles = Tagger.getByTag(`+ "`DarknessTile-${args[1].tokenId}`" + `);
                            darknessTiles.then(async (tiles) => {
                                //console.log("tiles to delete: ", [tiles[0].id]);
                                if(tiles.length>0){
                                game.AdvancedSpellEffects.removeTiles([tiles[0].id]);
                            }
                            })
                        }
                    else
                    {
                        let options = {version: "MIDI", args: args};
                        game.AdvancedSpellEffects.darkness(options);
                    }`;
                break;
            case 'Fog Cloud':
                let currentWallNumber = flags.advancedspelleffects?.effectOptions?.wallNumber ?? 12;
                newItemMacro = `/*ASE_REPLACED*/
if(args[0] === "off"){
    console.log("token: ", token)
    let fogCloudTiles = Tagger.getByTag(`+ "`FogCloudTile-${args[1].tokenId}`" + `);
        fogCloudTiles.then(async (tiles) => {
            console.log("tiles to delete: ", tiles);
            if(tiles.length>0){
            game.AdvancedSpellEffects.removeTiles([tiles[0].id]);
            }
        })
        }
    else if(args[0] != "on" && args[0] != "off"){
        let options = {version: "MIDI", args: args, numberWalls: ${currentWallNumber}};
        game.AdvancedSpellEffects.fogCloud(options);
    }`;
                returnOBJ = { wallNumber: currentWallNumber };
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
                    let availColors = Object.keys(Sequencer.Database.getEntry(`jb2a.${weapon}.${weaponsPathMap[weapon]}`));
                    let templateIndex = availColors.indexOf("_template");
                    if (templateIndex > -1) {
                        availColors.splice(templateIndex, 1);
                    }
                    weaponsColors[weapon] = availColors;
                });
                let currentWeapon = flags.advancedspelleffects?.effectOptions?.weapon ?? `sword`;
                weaponsColors[currentWeapon].forEach((color) => {
                    colorOptions[color] = capitalizeFirstLetter(color);
                });
                newItemMacro = `/*ASE_REPLACED*/let options = {version: "MIDI", args: args};
game.AdvancedSpellEffects.steelWindStrike(options);`;
                returnOBJ = {
                    swsWeapons: weaponOptions,
                    weaponColors: colorOptions
                }
                break;
            case 'Thunder Step':
                newItemMacro = `/*ASE_REPLACED*/let options = {version: "MIDI", args: args};
game.AdvancedSpellEffects.thunderStep(options);`;
                break;
            case 'Spiritual Weapon':
                newItemMacro = `/*ASE_REPLACED*/let options = {version: "MIDI", args: args, type: "Spiritual Weapon"};
game.AdvancedSpellEffects.summon(options);`;
                break;
            case 'Call Lightning':
                let currentBoltStyle = flags.advancedspelleffects?.effectOptions?.boltStyle ?? "chain";
                newItemMacro = `/*ASE_REPLACED*/
if(args[0] === "off"){
    //console.log("token: ", token)
    let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == args[1].tokenId);
        //console.log("tiles to delete: ", [tiles[0].id]);
        if(stormCloudTiles.length>0){
            game.AdvancedSpellEffects.removeTiles([stormCloudTiles[0].id]);
        }
}
else
{
    let options = {version: "MIDI", args: args, boltStyle: "${currentBoltStyle}"};
game.AdvancedSpellEffects.callLightning(options);
}`; 
                returnOBJ = { boltStyle: currentBoltStyle };
                break;
            }
        await item.setFlag("itemacro", "macro.data.command", newItemMacro);
        await item.setFlag("itemacro", "macro.data.name", itemName);
        await item.setFlag("midi-qol", "onUseMacroName", "ItemMacro");
        return returnOBJ;
    }

    async getData() {
        let flags = this.object.data.flags;
        //console.log('Advanced Spell Effects Flags: ', flags.advancedspelleffects);

        let item = this.object;
        let itemName = item.name;
        //console.log("Item: ", item);
        let content = "";
        let effectData;
        if (flags.advancedspelleffects?.enableASE) {
            effectData = await this.setEffectData(item);
            //console.log("Effect Data: ", effectData);
        }
        return {
            flags: this.object.data.flags,
            itemName: itemName,
            effectData: effectData,
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


