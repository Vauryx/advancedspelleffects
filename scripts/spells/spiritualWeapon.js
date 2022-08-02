import * as utilFunctions from "../utilityFunctions.js";

export class spiritualWeapon {

    static registerHooks() {
        return;
    }

    static async createSpiritualWeapon(midiData) {
        const casterActor = midiData.actor;
        const casterActorRollData = casterActor.getRollData();
        //console.log("Caster Actor Roll Data: ", casterActorRollData);
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const item = midiData.item;
        const effectOptions = item.getFlag('advancedspelleffects', 'effectOptions') ?? {};
        //console.log(effectOptions);
        //console.log("Midi Data: ", midiData);
        const level = midiData.itemLevel;
        let summonType = "Spiritual Weapon";
        const casterActorSpellcastingMod = casterActorRollData.abilities[casterActorRollData.attributes.spellcasting]?.mod ?? 0;
        const summonerDc = casterActor.data.data.attributes.spelldc;
        const summonerAttack = (casterActorRollData.attributes.prof + casterActorSpellcastingMod) + Number(casterActorRollData.bonuses?.msak?.attack ?? 0);

        //console.log("Caster Actor Roll Data: ", casterActorRollData);
        const summonerMod = casterActorSpellcastingMod + Number(casterActorRollData.bonuses?.msak?.damage ?? 0);
        let damageScale = '';

        async function myEffectFunction(template, options, update) {
            let glowColor;
            let color = options.color;
            const sound = options.effectOptions?.summonSound ?? "";
            const soundDelay = Number(options.effectOptions?.summonSoundDelay) ?? 0;
            const volume = options.effectOptions?.summonVolume ?? 1;

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
                .sound()
                .file(sound)
                .delay(soundDelay)
                .volume(volume)
                .playIf(sound !== "")
                .effect()
                .file(effectFile)
                .atLocation(template)
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
            label: game.i18n.localize("ASE.WeaponDialogLabel"),
            options: ["Mace", "Sword"]
        }]
        let weaponChoice = await warpgate.dialog(weaponData);
        weaponChoice = weaponChoice[0].toLowerCase();

        let spiritWeapon = `jb2a.spiritual_weapon.${weaponChoice}`;

        let types = Sequencer.Database.getPathsUnder(spiritWeapon);
        let typeOptions = [];

        types.forEach((type) => {
            typeOptions.push(utilFunctions.capitalizeFirstLetter(type));
        });

        let typeData = [{
            type: "select",
            label: game.i18n.localize("ASE.SpiritTypeDialogLabel"),
            options: typeOptions
        }];
        let typeChoice = await warpgate.dialog(typeData);
        typeChoice = typeChoice[0].toLowerCase();

        spiritWeapon = spiritWeapon + `.${typeChoice}`;

        let colors = Sequencer.Database.getPathsUnder(spiritWeapon);
        let colorOptions = [];

        colors.forEach((color) => {
            colorOptions.push(utilFunctions.capitalizeFirstLetter(color));
        });
        let attackColors;

        if (weaponChoice == "sword" || weaponChoice == "mace") {
            attackColors = Sequencer.Database.getPathsUnder(`jb2a.${weaponChoice}.melee.01`);
        }
        else if (Sequencer.Database.entryExists(`jb2a.${weaponChoice}.melee`)) {
            attackColors = Sequencer.Database.getPathsUnder(`jb2a.${weaponChoice}.melee`);
        }
        else {
            attackColors = Sequencer.Database.getPathsUnder(`jb2a.sword.melee.fire`);
        }
        let attackColorOptions = [];

        attackColors.forEach((attackColor) => {
            attackColorOptions.push(utilFunctions.capitalizeFirstLetter(attackColor));
        });

        let colorData = [{
            type: "select",
            label: game.i18n.localize("ASE.SpiritColorDialogLabel"),
            options: colorOptions
        }, {
            type: "select",
            label: game.i18n.localize("ASE.SpiritAttackColorDialogLabel"),
            options: attackColorOptions
        }];

        let colorChoices = await warpgate.dialog(colorData);
        let spiritColorChoice = colorChoices[0].toLowerCase();
        let attackColorChoice = colorChoices[1].toLowerCase();

        spiritWeapon = spiritWeapon + `.${spiritColorChoice}`;
        //console.log("Spirit Weapon: " + spiritWeapon);
        let spiritAttackAnim;
        if (weaponChoice == "sword") {
            spiritAttackAnim = `jb2a.sword.melee.01.${attackColorChoice}`;
        }
        else if (weaponChoice == "mace") {
            spiritAttackAnim = `jb2a.mace.melee.01.${attackColorChoice}`;
        }
        else if (weaponChoice != "scythe") {
            spiritAttackAnim = `jb2a.${weaponChoice}.melee.${attackColorChoice}`;
        }
        else {
            spiritAttackAnim = `jb2a.sword.melee.fire.${attackColorChoice}`;
        }
        //console.log("Spirit Attack Anim: " + spiritAttackAnim);
        let spiritualWeapon = Sequencer.Database.getEntry(spiritWeapon).file;
        //console.log("Spiritual Weapon path: ", spiritualWeapon);
        let spiritualWeaponAttackImg = Sequencer.Database.getEntry(spiritAttackAnim + '.0').file;
        spiritualWeaponAttackImg = spiritualWeaponAttackImg.replace("800x600.webm", "Thumb.webp");
        if (spiritualWeaponAttackImg.includes("Sword01") && spiritualWeaponAttackImg.includes("Dark_OrangePurple")) {
            spiritualWeaponAttackImg = spiritualWeaponAttackImg.replace("Dark_OrangePurple", "Dark_PurpleOrange");
        }
        //console.log("Spiritual Weapon Attack path: ", spiritualWeaponAttackImg);
        const spiritualWeaponActorImg = spiritualWeapon.replace("200x200.webm", "Thumb.webp");
        //console.log("Level: ", level);
        if ((level - 3) > 0) {
            damageScale = `+ ${Math.floor((level - 2) / 2)}d8`;
        }
        //console.log("Damage Scale: ", damageScale);
        const attackItemName = game.i18n.localize('ASE.SpiritAttackItemName');
        let updates = {
            token: {
                'alpha': 0,
                'name': `${summonType} of ${casterActor.name}`,
                'img': spiritualWeapon,
                'scale': 1.5,
                'actorLink': false
            },
            actor: {
                'name': `${summonType} of ${casterActor.name}`,
                'img': spiritualWeaponActorImg,
            },
            embedded: {
                Item: {}
            }
        };
        updates.embedded.Item[attackItemName] = {
            'type': 'weapon',
            img: spiritualWeaponAttackImg,
            "data": {
                "ability": "",
                "actionType": "mwak",
                "activation": { "type": "action", "cost": 1, "condition": "" },
                "attackBonus": `- @mod - @prof + ${summonerAttack}`,
                "damage": { "parts": [[`1d8 ${damageScale} + ${summonerMod}`, 'force']], "versatile": "" },
                "range": { "value": null, "long": null, "units": "" },
                "description": {
                    "value": game.i18n.localize('ASE.SpiritAttackItemDescription'),
                }
            },
            "flags": {
                "advancedspelleffects": {
                    "enableASE": true,
                    "disableSettings": true,
                    "spellEffect": game.i18n.localize('ASE.SpiritAttackItemName'),
                    'castItem': true,
                    'castStage': 'preDamage',
                    'effectOptions': {
                        'attackAnimFile': spiritAttackAnim
                    }
                }
            }
        };
        let crosshairsConfig = {
            size: 1,
            label: `${summonType} of ${casterActor.name}`,
            tag: 'spiritual-weapon-crosshairs',
            drawIcon: false,
            drawOutline: false,
            interval: 2
        };

        const options = { controllingActor: game.actors.get(casterActor.id), crosshairs: crosshairsConfig };
        const displayCrosshairs = async (crosshairs) => {
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(spiritualWeapon)
                .attachTo(crosshairs)
                .persist()
                .name('ASE-spiritual-weapon-crosshairs')
                .opacity(0.5)
                .play()

        };
        const callbacks = {
            pre: async (template, update) => {
                myEffectFunction(template, { color: spiritColorChoice, effectOptions: effectOptions }, update);
                await warpgate.wait(1750);
            },
            post: async (template, token) => {
                postEffects(template, token);
                await warpgate.wait(500);
                await Sequencer.EffectManager.endEffects({ name: 'ASE-spiritual-weapon-crosshairs' });
            },
            show: displayCrosshairs
        };

        warpgate.spawn(summonType, updates, callbacks, options);
    }

    static async spiritualWeaponAttack(data) {
        console.log("ASE Spiritual Weapon Attacking...", data);
        const casterActor = data.actor;
        const casterToken = canvas.tokens.get(data.tokenId);
        const spellItem = data.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        const attackAnimFile = aseEffectOptions?.attackAnimFile;

        const target = Array.from(data.targets)[0];
        let hitTargets = Array.from(data.hitTargets);
        console.log("Hit Targets: ", hitTargets);
        const missed = hitTargets.length == 0;
        console.log("ASE Spiritual Weapon Attack Missed: ", missed);
        //console.log("Caster: ", casterActor);
        //console.log("Target: ", target);
        //console.log("Anim File: ", attackAnimFile);
        //console.log("ASE Effect Options: ", aseEffectOptions);

        new Sequence("Advanced Spell Effects")
            .animation()
            .on(casterToken)
            .opacity(1)
            .fadeOut(250)
            .effect()
            .fadeIn(750)
            .startTime(500)
            .endTime(1250)
            .file(attackAnimFile)
            .missed(missed)
            .atLocation(casterToken)
            .fadeOut(500)
            .stretchTo(target)
            .waitUntilFinished(-250)
            .animation()
            .on(casterToken)
            .opacity(1)
            .fadeIn(750)
            .play();

    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];



        soundOptions.push({
            label: game.i18n.localize("ASE.SummonSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.summonSound',
            flagName: 'summonSound',
            flagValue: currFlags.summonSound ?? '',
        });

        /*animOptions.push({
            label: game.i18n.localize("ASE.UseSpiritGlowLabel"),
            tooltip: game.i18n.localize("ASE.UseSpiritGlowTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.useGlow',
            flagName: 'useGlow',
            flagValue: currFlags.useGlow ?? false,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.SpiritGlowColorLabel"),
            tooltip: game.i18n.localize("ASE.SpiritGlowColorTooltip"),
            type: 'colorPicker',
            name: 'flags.advancedspelleffects.effectOptions.glowColor',
            flagName: 'glowColor',
            flagValue: currFlags.glowColor ?? '#0000FF',
        });
        */
        soundOptions.push({
            label: game.i18n.localize("ASE.SummonSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.summonSoundDelay',
            flagName: 'summonSoundDelay',
            flagValue: currFlags.summonSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.SummonVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.summonVolume',
            flagName: 'summonVolume',
            flagValue: currFlags.summonVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: false,
        }

    }

}
