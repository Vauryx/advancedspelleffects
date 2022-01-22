import * as utilFunctions from "../utilityFunctions.js";
export class summonCreature {
    static registerHooks() {
        return;
    }
    static async doSummon(midiData) {
        async function myEffectFunction(template, effectInfo, summonQty) {
            //console.log("Color: ", color);

            const portalAnim = `jb2a.portals.vertical.vortex.${effectInfo.portalColor}`;
            const magicSignIntro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.intro.${effectInfo.magicSchoolColor}`;
            const magicSignLoop = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.loop.${effectInfo.magicSchoolColor}`;
            const effectAAnim = `jb2a.eldritch_blast.${effectInfo.effectAColor}.05ft`;
            const portalCloseAnim = `jb2a.impact.010.${effectInfo.portalImpactColor}`;

            const portalSound = effectInfo.portalSound ?? "";
            const portalSoundDelay = Number(effectInfo.portalSoundDelay) ?? 0;
            const portalSoundVolume = effectInfo.portalSoundVolume ?? 1;

            const circleSound = effectInfo.circleSound ?? "";
            const circleSoundDelay = Number(effectInfo.circleSoundDelay) ?? 0;
            const circleSoundVolume = effectInfo.circleSoundVolume ?? 1;

            const effectASound = effectInfo.effectASound ?? "";
            const effectASoundDelay = Number(effectInfo.effectASoundDelay) ?? 0;
            const effectASoundVolume = effectInfo.effectASoundVolume ?? 1;

            const portalCloseSound = effectInfo.portalCloseSound ?? "";
            const portalCloseSoundDelay = Number(effectInfo.portalCloseSoundDelay) ?? 0;
            const portalCloseSoundVolume = effectInfo.portalCloseSoundVolume ?? 1;


            let baseScale = 0.75;
            let adjustedScale = baseScale * summonQty;
            new Sequence("Advanced Spell Effects")
                .sound()
                .file(circleSound)
                .delay(circleSoundDelay)
                .volume(circleSoundVolume)
                .playIf(circleSound != "")
                .effect()
                .file(magicSignIntro)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .waitUntilFinished(-2000)
                .effect()
                .file(magicSignLoop)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .persist()
                .fadeOut(750, { ease: "easeInQuint" })
                .name("magicSignLoop")
                .sound()
                .file(effectASound)
                .delay(effectASoundDelay)
                .volume(effectASoundVolume)
                .playIf(effectASound != "")
                .effect()
                .file(effectAAnim)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .waitUntilFinished(-1000)
                .endTime(3300)
                .playbackRate(0.7)
                .scaleOut(0, 500)
                .scale(1.5)
                .zIndex(1)
                .center()
                .belowTokens()
                .sound()
                .file(portalSound)
                .delay(portalSoundDelay)
                .volume(portalSoundVolume)
                .playIf(portalSound != "")
                .effect()
                .belowTokens()
                .zIndex(2)
                .atLocation(template)
                .file(portalAnim)
                .fadeIn(500)
                .offset({ x: 0, y: canvas.grid.size })
                .scale(0)
                .animateProperty("sprite", "scale.x", { from: 0, to: baseScale, delay: 200, duration: 500, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.y", { from: 0, to: baseScale, delay: 200, duration: 700, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.x", { from: baseScale, to: 0, delay: 2500, duration: 500, ease: "easeInElastic" })
                .animateProperty("sprite", "scale.y", { from: baseScale, to: 0, delay: 2500, duration: 700, ease: "easeInElastic" })
                .wait(3000)
                .sound()
                .file(portalCloseSound)
                .delay(portalCloseSoundDelay)
                .volume(portalCloseSoundVolume)
                .playIf(portalCloseSound != "")
                .effect()
                .file(portalCloseAnim)
                .atLocation(template)
                .offset({ x: 0, y: canvas.grid.size })
                .play()
        }

        async function postEffects(template, token, effectInfo) {
            let magicSignOutro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.outro.${effectInfo.magicSchoolColor}`;
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(magicSignOutro)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .thenDo(async () => {
                    await Sequencer.EffectManager.endEffects({ name: "magicSignLoop" });
                })
                .wait(1500)
                .effect()
                .atLocation(token)
                .scaleToObject()
                .file(token.data.img)
                .fadeIn(400)
                .offset({ x: 0, y: canvas.grid.size })
                .animateProperty("sprite", "position.y", { from: 0, to: canvas.grid.size, duration: 400, ease: "easeInOutCubic" })
                .duration(500)
                .fadeOut(50)
                .wait(400)
                .animation()
                .on(token)
                .fadeIn(100, { ease: "easeInQuint" })
                .play()
        }
        //console.log("MIDI Data: ", midiData);
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        let item = midiData.item;
        let summonInfo = item.getFlag("advancedspelleffects", "effectOptions.summons");
        let effectInfo = item.getFlag("advancedspelleffects", "effectOptions");
        //console.log("Summon Info: ", summonInfo);
        //console.log("Effect Info: ", effectInfo);
        let summonOptionsData = { buttons: [] };
        for (let [type, info] of Object.entries(summonInfo)) {
            //console.log(`${type},:`, info);
            let buttonData = { label: info.name, value: [game.actors.get(info.actor).name, info.qty] };
            summonOptionsData.buttons.push(buttonData);
        }
        let chosenSummon = await warpgate.buttonDialog(summonOptionsData, 'row');
        const displayCrosshairs = async (crosshairs) => {
            const loadImage = src =>
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = src;
                });
            let summonTokenData = (await game.actors.getName(chosenSummon[0]).getTokenData());
            loadImage(summonTokenData.img).then(async (image) => {
                const summonImageScale = (summonTokenData.width * canvas.grid.size) / image.width;
                new Sequence("Advanced Spell Effects")
                    .effect()
                    .file(image.src)
                    .attachTo(crosshairs)
                    .persist()
                    .scale(summonImageScale)
                    .loopProperty("sprite", "rotation", { duration: 10000, from: 0, to: 360 })
                    .opacity(0.5)
                    .play()
            });
        };
        let summonEffectCallbacks = {
            pre: async (template, update) => {
                myEffectFunction(template, effectInfo, chosenSummon[1]);
                await warpgate.wait(1750);
            },
            post: async (template, token) => {
                postEffects(template, token, effectInfo);
                await warpgate.wait(500);
            },
            show: displayCrosshairs
        };
        let summonData = await game.actors.getName(chosenSummon[0]).getTokenData();
        let crosshairsConfig = {
            size: summonData.width,
            label: chosenSummon[0],
            tag: `summon-${chosenSummon[0]}-crosshairs`,
            drawIcon: false,
            drawOutline: false,
            interval: 2
        };

        let updates = {
            token: {
                'alpha': 0,
                'flags': { "advancedspelleffects": { "summoner": casterActor.id } }
            },
            actor: {},
            embedded: {}
        };
        if (effectInfo.isTashas) {
            console.log(`Scaling ${chosenSummon[0]} with spell level...`);
            let spellLevel = midiData.itemLevel;
            let hpBonus = 0;
            let acBonus = spellLevel;
            let multiAttack = Math.floor(spellLevel / 2);
            let damageBonus = spellLevel;
            //let summonActor = game.actors.getName(chosenSummon[0]);
            let attackBonus = casterActor.data.data.attributes.spelldc - 8;
            let summonActor = game.actors.getName(chosenSummon[0]);
            //console.log(summonActor);
            let damageItems = summonActor.data.items.filter((item) => { return item.data.data.damage.parts.length > 0 });
            //console.log(damageItems);
            switch (item.name) {
                case game.i18n.localize("ASE.SummonAberration"):
                    hpBonus = 10 * (spellLevel - 4);
                    break;
                case game.i18n.localize("ASE.SummonBeast"):
                    hpBonus = 5 * (spellLevel - 2);
                    break;
                case game.i18n.localize("ASE.SummonCelestial"):
                    if (chosenSummon[0].includes(game.i18n.localize("ASE.Defender"))) {
                        acBonus += 2;
                    }
                    hpBonus = 10 * (spellLevel - 5);
                    break;
                case game.i18n.localize("ASE.SummonConstruct"):
                    hpBonus = 15 * (spellLevel - 3);
                    break;
                case game.i18n.localize("ASE.SummonElemental"):
                    hpBonus = 10 * (spellLevel - 4);
                    break;
                case game.i18n.localize("ASE.SummonFey"):
                    hpBonus = 10 * (spellLevel - 3);
                    break;
                case game.i18n.localize("ASE.SummonFiend"):
                    hpBonus = 15 * (spellLevel - 6);
                    break;
                case game.i18n.localize("ASE.SummonShadowspawn"):
                    hpBonus = 15 * (spellLevel - 3);
                    break;
                case game.i18n.localize("ASE.SummonUndead"):
                    hpBonus = 10 * (spellLevel - 3);
                    break;
            }
            if (hpBonus < 0) {
                hpBonus = 0;
            }

            updates.actor = {
                'data.attributes.hp': { value: summonActor.data.data.attributes.hp.max + hpBonus, max: summonActor.data.data.attributes.hp.max + hpBonus },
                'data.bonuses.msak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
                'data.bonuses.mwak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
                'data.bonuses.rsak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
                'data.bonuses.rwak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` }
            }
            updates.embedded = {
                ActiveEffect: {
                    "Spell Level Bonus - AC": {
                        icon: 'icons/magic/defensive/shield-barrier-blue.webp',
                        label: game.i18n.localize("ASE.SpellLevelBonusACEffectLabel"),
                        changes: [{
                            "key": "data.attributes.ac.bonus",
                            "mode": 2,
                            "value": acBonus,
                            "priority": 0
                        }]
                    }
                }
            };
        }
        const warpgateOptions = { controllingActor: game.actors.get(midiData.actor.id), duplicates: chosenSummon[1], crosshairs: crosshairsConfig };
        await warpgate.spawn(chosenSummon[0], updates, summonEffectCallbacks, warpgateOptions);
    }
    static async handleConcentration(casterActor, casterToken, effectOptions) {
        console.log("Detected summon concentration removal...");
        let summonedTokens = canvas.tokens.placeables.filter((token) => { return token.document.getFlag("advancedspelleffects", "summoner") == casterActor.id });
        for (const summonedToken of summonedTokens) {
            await warpgate.dismiss(summonedToken.id);
        }
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const magicSignsRaw = `jb2a.magic_signs.circle.02`;
        const magicSchoolOptions = utilFunctions.getDBOptions(magicSignsRaw);

        const magicSchoolColorsRaw = `jb2a.magic_signs.circle.02.${currFlags.advancedspelleffects?.effectOptions?.magicSchool ?? 'abjuration'}.intro`;
        const magicSchoolColorOptions = utilFunctions.getDBOptions(magicSchoolColorsRaw);

        const effectAColorsRaw = `jb2a.eldritch_blast`;
        const effectAColorOptions = utilFunctions.getDBOptions(effectAColorsRaw);

        const portalColorsRaw = `jb2a.portals.vertical.vortex`;
        const portalColorOptions = utilFunctions.getDBOptions(portalColorsRaw);

        const portalImpactColorsRaw = `jb2a.impact.010`;
        const portalImpactColorOptions = utilFunctions.getDBOptions(portalImpactColorsRaw);

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];


        animOptions.push({
            label: game.i18n.localize("ASE.MagicSchoolLabel"),
            type: 'dropdown',
            name: 'flags.advancedspelleffects.effectOptions.magicSchool',
            options: magicSchoolOptions,
            flagName: 'magicSchool',
            flagValue: currFlags.magicSchool ?? 'abjuration',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.MagicSchoolColorLabel"),
            type: 'dropdown',
            name: 'flags.advancedspelleffects.effectOptions.magicSchoolColor',
            flagName: 'magicSchoolColor',
            options: magicSchoolColorOptions,
            flagValue: currFlags.magicSchoolColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MagicCircleSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.circleSound',
            flagName: 'circleSound',
            flagValue: currFlags.circleSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MagicCircleSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.circleSoundDelay',
            flagName: 'circleSoundDelay',
            flagValue: currFlags.circleSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MagicCircleVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.circleVolume',
            flagName: 'circleVolume',
            flagValue: currFlags.circleVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectAColorLabel"),
            type: 'dropdown',
            name: 'flags.advancedspelleffects.effectOptions.effectAColor',
            flagName: 'effectAColor',
            options: effectAColorOptions,
            flagValue: currFlags.effectAColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.EffectASoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.effectASound',
            flagName: 'effectASound',
            flagValue: currFlags.effectASound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.EffectASoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.effectASoundDelay',
            flagName: 'effectASoundDelay',
            flagValue: currFlags.effectASoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.EffectASoundVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.effectAVolume',
            flagName: 'effectAVolume',
            flagValue: currFlags.effectAVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.PortalColorLabel"),
            type: 'dropdown',
            name: 'flags.advancedspelleffects.effectOptions.portalColor',
            flagName: 'portalColor',
            options: portalColorOptions,
            flagValue: currFlags.portalColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PortalSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.portalSound',
            flagName: 'portalSound',
            flagValue: currFlags.portalSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PortalSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.portalSoundDelay',
            flagName: 'portalSoundDelay',
            flagValue: currFlags.portalSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PortalVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.portalVolume',
            flagName: 'portalVolume',
            flagValue: currFlags.portalVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.PortalCloseColorLabel"),
            type: 'dropdown',
            name: 'flags.advancedspelleffects.effectOptions.portalImpactColor',
            flagName: 'portalImpactColor',
            options: portalImpactColorOptions,
            flagValue: currFlags.portalImpactColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PortalCloseSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.portalCloseSound',
            flagName: 'portalCloseSound',
            flagValue: currFlags.portalImpactSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PortalCloseSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.portalCloseSoundDelay',
            flagName: 'portalCloseSoundDelay',
            flagValue: currFlags.portalCloseSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.PortalCloseVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.portalCloseVolume',
            flagName: 'portalCloseVolume',
            flagValue: currFlags.portalCloseVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.UseTashasScalingLabel"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.isTashas',
            flagName: 'isTashas',
            flagValue: currFlags.isTashas ?? false,
        });


        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}