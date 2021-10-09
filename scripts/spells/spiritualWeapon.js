import * as utilFunctions from "../utilityFunctions.js";

export async function spiritualWeapon(midiData) {
    const casterActor = midiData.actor;
    const casterToken = canvas.tokens.get(midiData.tokenId);
    const level = midiData.spellLevel;
    let summonType = "Spiritual Weapon";
    const summonerDc = casterActor.data.data.attributes.spelldc;
    const summonerAttack = summonerDc - 8;
    const summonerMod = getProperty(casterActor, `data.data.abilities.${getProperty(casterActor, 'data.data.attributes.spellcasting')}.mod`);
    let damageScale = '';

    async function myEffectFunction(template, color, update) {
        let glowColor;
        switch (color) {
            case 'blue':
                glowColor = utilFunctions.rgbToHex(173, 216, 230)
                break;
            case 'green':
                glowColor = utilFunctions.rgbToHex(144, 238, 144)
                break;
            case 'orange':
                glowColor = utilFunctions.rgbToHex(255, 128, 0)
                break;
            case 'pruple':
                glowColor = utilFunctions.rgbToHex(153, 0, 153)
                break;
            case 'red':
                glowColor = utilFunctions.rgbToHex(204, 0, 0)
                break;
            case 'yellow':
                glowColor = utilFunctions.rgbToHex(255, 255, 0)
                break;
            case 'pink':
                glowColor = utilFunctions.rgbToHex(255, 102, 255)
                break;
            default:
                glowColor = utilFunctions.rgbToHex(153, 204, 255)
        }
        let effectFile;
        if (Sequencer.Database.entryExists(`jb2a.eldritch_blast.${color}`)) {
            effectFile = `jb2a.eldritch_blast.${color}.05ft`
        }
        else {
            effectFile = `jb2a.eldritch_blast.lightblue.05ft`
        }
        let effect = `jb2a.bless.400px.intro.${color}`;
        if (Sequencer.Database.entryExists(effect)) {
            effect = effect;
        }
        else {
            effect = `jb2a.bless.400px.intro.blue`;
        }
        new Sequence("Advanced Spell Effects")
            .effect()
            .file(effectFile)
            .atLocation(template)
            .JB2A()
            .waitUntilFinished(-1200)
            .endTime(3300)
            .playbackRate(0.7)
            .scaleOut(0, 250)
            .filter("Glow", { color: glowColor, distance: 35, outerStrength: 2, innerStrength: 0.25 })
            .center()
            .belowTokens()
            .effect()
            .file(effect)
            .atLocation(template)
            .center()
            .JB2A()
            .scale(1.5)
            .belowTokens()
            .play()
    }

    async function postEffects(template, token) {

        new Sequence("Advanced Spell Effects")
            .animation()
            .on(token)
            .fadeIn(500)
            .play()
    }
    let weaponData = [{
        type: "select",
        label: "Weapon",
        options: ["Mace", "Maul", "Scythe", "Sword"]
    }]
    let weaponChoice = await warpgate.dialog(weaponData);
    weaponChoice = weaponChoice[0].toLowerCase();

    let spiritWeapon = `jb2a.spiritual_weapon.${weaponChoice}`;

    let types = Sequencer.Database.getEntry(spiritWeapon);
    types = Object.keys(types);
    let typeOptions = [];

    types.forEach((type) => {
        typeOptions.push(utilFunctions.capitalizeFirstLetter(type));
    });

    let typeData = [{
        type: "select",
        label: "Spirit Type",
        options: typeOptions
    }];
    let typeChoice = await warpgate.dialog(typeData);
    typeChoice = typeChoice[0].toLowerCase();

    spiritWeapon = spiritWeapon + `.${typeChoice}`;

    let colors = Sequencer.Database.getEntry(spiritWeapon);
    colors = Object.keys(colors);
    let colorOptions = [];

    colors.forEach((color) => {
        colorOptions.push(utilFunctions.capitalizeFirstLetter(color));
    });
    let attackColors;

    if(weaponChoice == "sword"){
        attackColors = Sequencer.Database.getEntry(`jb2a.${weaponChoice}.melee.fire`);
        attackColors = Object.keys(attackColors);
    }
    else if (Sequencer.Database.entryExists(`jb2a.${weaponChoice}.melee`)) {
        attackColors = Sequencer.Database.getEntry(`jb2a.${weaponChoice}.melee`);
        attackColors = Object.keys(attackColors);
    }
    else {
        attackColors = Sequencer.Database.getEntry(`jb2a.sword.melee`);
        attackColors = Object.keys(attackColors);
    }
    const templateIndex = attackColors.indexOf("_template");

    if (templateIndex > -1) {
        attackColors.splice(templateIndex, 1);
    }

    let attackColorOptions = [];

    attackColors.forEach((attackColor) => {
        attackColorOptions.push(utilFunctions.capitalizeFirstLetter(attackColor));
    });

    let colorData = [{
        type: "select",
        label: "Spirit Color",
        options: colorOptions
    }, {
        type: "select",
        label: "Spirit Attack Color",
        options: attackColorOptions
    }];

    let colorChoices = await warpgate.dialog(colorData);
    let spiritColorChoice = colorChoices[0].toLowerCase();
    let attackColorChoice = colorChoices[1].toLowerCase();

    spiritWeapon = spiritWeapon + `.${spiritColorChoice}`;
    let spiritAttackAnim
    if(weaponChoice == "sword"){
        spiritAttackAnim = `jb2a.sword.melee.fire.${attackColorChoice}`;
    }
    else if (weaponChoice != "scythe") {
        spiritAttackAnim = `jb2a.${weaponChoice}.melee.${attackColorChoice}`;
    }
    else {
        spiritAttackAnim = `jb2a.sword.melee.${attackColorChoice}`;
    }
    let spiritualWeapon = Sequencer.Database.getEntry(spiritWeapon).file;

    console.log("Spiritual Weapon path: ", spiritualWeapon);
    if ((level - 3) > 0) {
        damageScale = `+ ${Math.floor((level - 2) / 2)}d8[upcast]`;
    }

    let updates = {
        token: {
            'alpha': 0,
            'name': `${summonType} of ${casterActor.name}`,
            'img': spiritualWeapon,
            'scale': 1.5
        },
        actor: {
            'name': `${summonType} of ${casterActor.name}`,
        },
        item: {
            "Attack": {
                'data.attackBonus': `- @mod - @prof + ${summonerAttack}`,
                'data.damage.parts': [[`1d8 ${damageScale} + ${summonerMod}`, 'force']],
                'data.attackBonus': `- @mod - @prof + ${summonerAttack}`,
                'data.damage.parts': [[`1d8 ${damageScale} + ${summonerMod}`, 'force']],
                'flags.midi-qol.onUseMacroName': 'ItemMacro',
                'flags.itemacro.macro.data.name': "Attack",
                'flags.itemacro.macro.data.type': "script",
                'flags.itemacro.macro.data.scope': "global",
                'flags.itemacro.macro.data.command': `let caster = canvas.tokens.get(args[0].tokenId);
        let attackTarget = args[0].targets[0];
        let hitTarget = args[0].hitTargets[0];
        if (caster) {
            let animFile = "${spiritAttackAnim}";
            let missDirection = Math.floor(Math.random() * 10);
            let missRotation = 60;
            if (missDirection > 4) {
                missRotation *= -1;
            }

            if (attackTarget) {
                if (!hitTarget) {
                    let onMissSequence = new Sequence("Advanced Spell Effects")
                        .animation()
                            .on(caster)
                            .opacity(1)
                            .fadeOut(250)
                        .effect()
                            .file(animFile)
                            .fadeIn(750)
                            .atLocation(caster)
                            .JB2A()
                            .rotate(missRotation)
                            .reachTowards(attackTarget)
                            .fadeOut(500)
                            .waitUntilFinished(-500)
                        .animation()
                            .on(caster)
                            .opacity(1)
                            .fadeIn(750)
                    onMissSequence.play();
                }
                else {
                    let onHitSequence = new Sequence("Advanced Spell Effects")
                        .animation()
                            .on(caster)
                            .opacity(1)
                            .fadeOut(250)
                        .effect()
                            .fadeIn(750)
                            .file(animFile)
                            .atLocation(caster)
                            .JB2A()
                            .fadeOut(500)
                            .reachTowards(hitTarget)
                            .waitUntilFinished(-500)
                        .animation()
                            .on(caster)
                            .opacity(1)
                            .fadeIn(750)
                    onHitSequence.play();
                }
            }
        }`
            }
        }
    }

    const options = { controllingActor: game.actors.get(midiData.actor._id) };

    const callbacks = {
        pre: async (template, update) => {
            myEffectFunction(template, spiritColorChoice, update);
            await warpgate.wait(1750);
        },
        post: async (template, token) => {
            postEffects(template, token);
            await warpgate.wait(500);
        }
    };
    warpgate.spawn(summonType, updates, callbacks, options);
}