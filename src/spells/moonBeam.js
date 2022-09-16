import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";


export class moonBeam {
    static registerHooks() {
        Hooks.on("updateToken", moonBeam._updateToken);
        Hooks.on("updateCombat", moonBeam._updateCombat);
        Hooks.on("deleteTile", moonBeam._deleteTile);
        return;
    }

    static async _deleteTile(tileD) {
        const isGM = utilFunctions.isFirstGM();
        //console.log("Is first GM: ", isGM);
        if (!isGM) return;
        const attachedSounds = (await Tagger.getByTag([`ase-source-${tileD.id}`]));
        if (!attachedSounds.length > 0) {
            return;
        }
        await canvas.scene.deleteEmbeddedDocuments("AmbientSound", attachedSounds.map(s => s.id));
    }

    static async _updateToken(tokenDocument, updateData) {
        const isGM = utilFunctions.isFirstGM();
        //console.log("Is first GM: ", isGM);
        //console.log('Update Token tokenDocument: ', tokenDocument);
        //console.log('Update Token updateData: ', updateData);
        if (!isGM) return;
        if ((!updateData.x && !updateData.y)) return;

        const moonbeamTiles = await Tagger.getByTag(`*-moonbeam`);
        if (moonbeamTiles.length == 0) return;

        const token = canvas.tokens.get(tokenDocument.id);
        let newTokenPosition = { x: 0, y: 0 };
        newTokenPosition.x = (updateData.x) ? updateData.x : token.data.x;
        newTokenPosition.y = (updateData.y) ? updateData.y : token.data.y;
        newTokenPosition = utilFunctions.getCenter(newTokenPosition, tokenDocument.data.width);

        let inTiles = token.document.getFlag("advancedspelleffects", "moonbeam.inTiles") ?? [];
        //console.log('inTiles: ', inTiles);
        //console.log('moonbeamTiles: ', moonbeamTiles);
        //console.log('token: ', token);
        //console.log('New Token Position: ', newTokenPosition);
        //iterate over every moonbeam tile
        for (let i = 0; i < moonbeamTiles.length; i++) {
            let moonbeamTile = moonbeamTiles[i];
            let moonbeamTileCenter = utilFunctions.getTileCenter(moonbeamTile.data);
            //console.log('Moonbeam tile center: ', moonbeamTileCenter);
            let targetToBeamDist = utilFunctions.getDistanceClassic(newTokenPosition, moonbeamTileCenter);
            //console.log('target to beam dist: ', targetToBeamDist);
            //console.log('Required Distance: ', (((tokenDocument.data.width * canvas.grid.size) / 2) + (moonbeamTile.data.width / 2)));
            if (targetToBeamDist < (((tokenDocument.data.width * canvas.grid.size) / 2) + (moonbeamTile.data.width / 2))) {
                //check if tile exists in inTiles which is an array of tiles
                if (inTiles.includes(moonbeamTile.id)) {

                    console.log(`${token.name} has already entered this tile this turn - ${moonbeamTile.id}`);
                    ui.notifications.info(game.i18n.format("ASE.MoonbeamAlreadyEnteredTile", { name: token.name }));
                    //do nothing
                }
                else {
                    console.log(`${token.name} is entering the space of a moonbeam tile - ${moonbeamTile.id}`);
                    ui.notifications.info(game.i18n.format("ASE.MoonbeamEnteringTile", { name: token.name }));
                    //add the tile to the inTiles array
                    inTiles.push(moonbeamTile.id);
                    let effectOptions = moonbeamTile.getFlag("advancedspelleffects", "effectOptions") ?? {};
                    await moonBeam.activateBeam(token, effectOptions);
                }
            }
        }
        await token.document.setFlag("advancedspelleffects", "moonbeam.inTiles", inTiles);
    }

    static async _updateCombat(combat) {
        const isGM = utilFunctions.isFirstGM();
        //console.log("Is first GM: ", isGM);
        if (!isGM) return;
        const moonbeamTiles = await Tagger.getByTag(`*-moonbeam`);
        if (moonbeamTiles.length == 0) return;

        //console.log("Updating Combat for ASE Moonbeam...");
        //console.log(combat);
        const combatantToken = canvas.tokens.get(combat.current.tokenId);
        const combatantActor = combatantToken.actor;
        const combatantPosition = utilFunctions.getCenter(combatantToken.data, combatantToken.data.width);

        let inTiles = [];
        //iterate over every moonbeam tile
        for (let i = 0; i < moonbeamTiles.length; i++) {
            let moonbeamTile = moonbeamTiles[i];
            //console.log('Moonbeam tile found: ', moonbeamTile);
            let effectOptions = moonbeamTile.getFlag("advancedspelleffects", "effectOptions") ?? {};
            //check if token has entered the tile
            let moonbeamTileCenter = utilFunctions.getTileCenter(moonbeamTile.data);
            let targetToBeamDist = utilFunctions.getDistanceClassic(combatantPosition, moonbeamTileCenter);
            //console.log('target to beam dist: ', targetToBeamDist);
            if (targetToBeamDist < (((combatantToken.data.width * canvas.grid.size) / 2) + (moonbeamTile.data.width / 2))) {
                //check if tile exists in inTiles which is an array of tiles
                console.log(`${combatantToken.name} is starting its turn in the space of a moonbeam tile - ${moonbeamTile.id}`);
                ui.notifications.info(game.i18n.format("ASE.StartingTurnInMoonbeam", { name: combatantToken.name }));
                //add the tile to the inTiles array
                await moonBeam.activateBeam(combatantToken, effectOptions);
                inTiles.push(moonbeamTile.id);
            }
        }
        await combatantToken.document.setFlag("advancedspelleffects", "moonbeam.inTiles", inTiles);
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        //console.log("Handling concentration removal for ASE Darknes...");
        let moonbeamTiles = await Tagger.getByTag(`${casterToken.id}-moonbeam`);
        if (moonbeamTiles.length > 0) {
            aseSocket.executeAsGM("deleteTiles", [moonbeamTiles[0].id]);
        }
        await warpgate.revert(casterToken.document, `${casterActor.id}-moonbeam`);
        ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.MoveMoonbeam") }));

        const tokens = canvas.tokens.placeables;
        for await (let token of tokens) {
            if (token.document.getFlag("advancedspelleffects", "moonbeam") != undefined) {
                await token.document.unsetFlag("advancedspelleffects", "moonbeam");
            }
        }

    }

    static async callBeam(data) {
        const casterActor = data.actor;
        const casterToken = canvas.tokens.get(data.tokenId);
        const itemCardId = data.itemCardId;
        const spellItem = data.item;
        const spellItemData = spellItem.data.data;
        const spellLevel = data.itemLevel;
        const spellItemLevel = spellItemData.level;
        console.log("Cast level: ", spellLevel);
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        //console.log(aseEffectOptions);
        const beamIntro = `jb2a.moonbeam.01.intro.${aseEffectOptions.moonbeamColor}`;
        const beamOutro = `jb2a.moonbeam.01.outro.${aseEffectOptions.moonbeamColor}`;
        const beamLoop = `jb2a.moonbeam.01.no_pulse.${aseEffectOptions.moonbeamColor}`;
        const damageColor = aseEffectOptions.moonbeamDmgColor;
        const beamInitialSound = aseEffectOptions.moonbeamSound ?? "";
        const beamLoopSound = aseEffectOptions.moonbeamLoopSound ?? "";
        const beamInitialSoundDelay = Number(aseEffectOptions.moonbeamSoundDelay) ?? 0;
        const beamLoopSoundDelay = Number(aseEffectOptions.moonbeamLoopSoundDelay) ?? 0;
        const beamInitialSoundVolume = aseEffectOptions.moonbeamVolume ?? 1;
        const beamLoopSoundVolume = aseEffectOptions.moonbeamLoopVolume ?? 1;
        const beamLoopSoundEasing = aseEffectOptions.moonbeamLoopEasing ?? true;
        const beamLoopSoundRadius = aseEffectOptions.moonbeamLoopRadius ?? 20;
        let damage = data.item.data.data.damage;
        if(spellItemData.scaling.mode == "level" && (spellLevel - spellItemLevel > 0)) {
            const scalingDamageType = damage.parts[0][1];
            const scalingDieValue = spellItemData.scaling.formula.split("d")[0];
            const scalingDieType = spellItemData.scaling.formula.split("d")[1];
            const newDieValue = scalingDieValue * (spellLevel - spellItemLevel);
            const newFormula = `${newDieValue}d${scalingDieType}[${scalingDamageType}]`;
            damage.parts[0][0] += ' + ' + newFormula;
        }
        aseEffectOptions["rollInfo"] = {
            casterTokenId: casterToken.id,
            itemUUID: '',
            itemCardId: data.itemCardId,
            spellSaveDc: casterActor.data.data.attributes.spelldc,
            damageFormula: damage,
        };
        aseEffectOptions['allowInitialMidiCall'] = false;
        const updates = {
            embedded: {
                Item: {}
            }
        };
        const activationItemName = game.i18n.localize('ASE.MoveMoonbeam');

        updates.embedded.Item[activationItemName] = {
            "type": "spell",
            "img": spellItem.img,
            "data": {
                "ability": "",
                "actionType": "save",
                "save": spellItem.data.data.save,
                "activation": { "type": 'action', "cost": 1 },
                "damage": damage,
                "level": data.itemLevel,
                "preparation": { "mode": 'atwill', "prepared": true },
                "range": { "value": null, "long": null, "units": "" },
                "school": "evo",
                "target": { "value": 1, "width": null, "units": "", "type": "creature" },
                "description": {
                    "value": game.i18n.localize("ASE.MoveMoonbeamDescription")
                }
            },
            "flags": {
                "advancedspelleffects": {
                    "enableASE": true,
                    "spellEffect": game.i18n.localize('ASE.MoveMoonbeam'),
                    "castItem": true,
                    'effectOptions': aseEffectOptions
                }
            }
        }


        let moonbeamLoc = await moonBeam.chooseBeamLocation(beamLoop);

        await warpgate.mutate(casterToken.document, updates, {}, { name: `${casterActor.id}-moonbeam` });
        //get newly created item by actor.items.getName()
        let moonbeamCastItem = casterActor.items.getName(activationItemName);
        if(moonbeamCastItem){
            aseEffectOptions['rollInfo']['itemUUID'] = moonbeamCastItem.uuid;
        }
        ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.MoveMoonbeam") }));

        const moonbeamTile = await placeBeam(moonbeamLoc, casterToken.id, beamLoop, aseEffectOptions);
        //console.log(moonbeamTile);
        const moonbeamTileId = moonbeamTile.id ?? moonbeamTile._id;
        let beamSeq = new Sequence("Advanced Spell Effects")
            .sound()
            .file(beamInitialSound)
            .delay(beamInitialSoundDelay)
            .volume(beamInitialSoundVolume)
            .playIf(beamInitialSound != "")
            .effect()
            .file(beamIntro)
            .atLocation(moonbeamLoc)
            .endTimePerc(0.50)
            .scale(0.5)
            .waitUntilFinished(-500)
            .thenDo(async () => {
                await aseSocket.executeAsGM("fadeTile", { type: "fadeIn", duration: 500 }, moonbeamTileId);
            })
        await beamSeq.play();
        const soundOptions = {
            volume: beamLoopSoundVolume,
            delay: beamLoopSoundDelay,
            sound: beamLoopSound,
            easing: beamLoopSoundEasing,
            radius: beamLoopSoundRadius,
        };
        if (beamLoopSound != "") {
            const sourceSound = await placeSound(moonbeamLoc, soundOptions, moonbeamTileId);
            console.log('Sound Created...', sourceSound);
        }

        async function placeBeam(templateData, tokenId, beamAnim, effectOptions) {
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;

            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);

            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);

            const animPath = Sequencer.Database.getEntry(beamAnim).file;

            let data = [{
                alpha: 0,
                width: tileWidth,
                height: tileHeight,
                img: animPath,
                overhead: true,
                occlusion: {
                    alpha: 0,
                    mode: 0,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tileX,
                y: tileY,
                z: 100,
                flags: {
                    tagger: {
                        tags: [`${tokenId}-moonbeam`]
                    },
                    advancedspelleffects: {
                        effectOptions: effectOptions
                    }
                }
            }]
            //console.log("Placing as tile: ", data);
            let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
            //console.log("ASE MOONBEAM: Moonbeam Tile Created: ", createdTiles);
            return createdTiles[0];

        }

        async function placeSound(location, options, sourceId) {
            const soundData = [{
                easing: options.easing,
                path: options.sound,
                radius: options.radius,
                type: "1",
                volume: options.volume,
                x: location.x,
                y: location.y,
                flags: {
                    tagger: {
                        tags: [`ase-source-${sourceId}`]
                    },
                    advancedspelleffects: {
                        sourceId: sourceId
                    }
                }
            }];
            return (await aseSocket.executeAsGM("placeSounds", soundData, options.delay));
        }

    }

    static async activateBeam(target, effectOptions) {

        const rollInfo = effectOptions.rollInfo;
        effectOptions['castItem'] = true;
        const targetUuid = target.document?.uuid ?? target.uuid;
        let state = game.ASESpellStateManager.getSpell(rollInfo.itemUUID);
        if(state){
            game.ASESpellStateManager.removeSpell(rollInfo.itemUUID);
        }
        effectOptions.targets = [targetUuid];
        game.ASESpellStateManager.addSpell(rollInfo.itemUUID, effectOptions);

        new Sequence("Advanced Spell Effects")
            .sound()
            .file(effectOptions.moonbeamDmgSound)
            .delay(Number(effectOptions.moonbeamDmgSoundDelay) ?? 0)
            .volume(effectOptions.moonbeamDmgVolume ?? 1)
            .playIf(effectOptions.moonbeamDmgSound && effectOptions.moonbeamDmgSound != "")
            .effect()
            .file(`jb2a.impact.004.${effectOptions.moonbeamDmgColor}`)
            .attachTo(target)
            .randomRotation()
            .scaleIn(0.5, 200)
            .animateProperty("sprite", "rotation", { duration: 1000, from: 0, to: 45 })
            .randomOffset(0.5)
            .repeats(4, 100, 250)
            .play()
    }

    static async moveBeam(data) {
        const casterActor = data.actor;
        const casterToken = canvas.tokens.get(data.tokenId);
        const spellItem = data.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        //console.log(aseEffectOptions);
        const beamLoop = `jb2a.moonbeam.01.loop.${aseEffectOptions.moonbeamColor}`;

        let moonbeamTiles = await Tagger.getByTag(`${casterToken.id}-moonbeam`);
        if (moonbeamTiles?.length == 0) {
            console.log("Moonbeam not found");
            ui.notifications.error(`Moonbeam not found.`);
            return;
        }
        let moonbeamTile = moonbeamTiles[0];

        let moonbeamLoc = await moonBeam.chooseBeamLocation(beamLoop);
        //console.log(moonbeamLoc);
        //console.log(moonbeamTile);
        //console.log("ASE EFFECT OPTIONS: ", aseEffectOptions);
        await aseSocket.executeAsGM("moveTile", moonbeamLoc, moonbeamTile.id);
        if (aseEffectOptions.moonbeamLoopSound && aseEffectOptions.moonbeamLoopSound != "") {
            await aseSocket.executeAsGM("moveSound", moonbeamTile.id, moonbeamLoc);
        }

    }

    static async chooseBeamLocation(beamAnim) {
        const displayCrosshairs = async (crosshairs) => {
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(beamAnim)
                .attachTo(crosshairs)
                .persist()
                .scale(0.5)
                .opacity(0.5)
                .play()

        }
        let crosshairsConfig = {
            size: 2,
            label: game.i18n.localize("ASE.Moonbeam"),
            tag: 'moonbeam-crosshairs',
            drawIcon: false,
            drawOutline: false,
            interval: 1
        }
        let placedLoc = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
        return placedLoc;
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const beamColorOptions = utilFunctions.getDBOptions('jb2a.moonbeam.01.no_pulse');
        const beamDamageOptions = utilFunctions.getDBOptions('jb2a.impact.004');

        const spellDetails = {
            actionType: "save",
            target : {
                type: "",
                units: "",
                value: null,
                width: null,
            }
        };

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        animOptions.push({
            label: game.i18n.localize("ASE.BeamColorLabel"),
            type: 'dropdown',
            options: beamColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.moonbeamColor',
            flagName: 'moonbeamColor',
            flagValue: currFlags.moonbeamColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamInitialSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamSound',
            flagName: 'moonbeamSound',
            flagValue: currFlags.moonbeamSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamInitialSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamSoundDelay',
            flagName: 'moonbeamSoundDelay',
            flagValue: currFlags.moonbeamSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamInitialVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamVolume',
            flagName: 'moonbeamVolume',
            flagValue: currFlags.moonbeamVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamLoopSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamLoopSound',
            flagName: 'moonbeamLoopSound',
            flagValue: currFlags.moonbeamLoopSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamLoopSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamLoopSoundDelay',
            flagName: 'moonbeamLoopSoundDelay',
            flagValue: currFlags.moonbeamLoopSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamLoopVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamLoopVolume',
            flagName: 'moonbeamLoopVolume',
            flagValue: currFlags.moonbeamLoopVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamLoopVolumeEasingLabel"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamLoopEasing',
            flagName: 'moonbeamLoopEasing',
            flagValue: currFlags.moonbeamLoopEasing ?? true,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MoonbeamLoopSoundRadiusLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamLoopRadius',
            flagName: 'moonbeamLoopRadius',
            flagValue: currFlags.moonbeamLoopRadius ?? 20,
        });
        animOptions.push({
            label: game.i18n.localize("ASE.DamageEffectColorLabel"),
            type: 'dropdown',
            options: beamDamageOptions,
            name: 'flags.advancedspelleffects.effectOptions.moonbeamDmgColor',
            flagName: 'moonbeamDmgColor',
            flagValue: currFlags.moonbeamDmgColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DamageEffectSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamDmgSound',
            flagName: 'moonbeamDmgSound',
            flagValue: currFlags.moonbeamDmgSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DamageEffectSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamDmgSoundDelay',
            flagName: 'moonbeamDmgSoundDelay',
            flagValue: currFlags.moonbeamDmgSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DamageEffectVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.moonbeamDmgVolume',
            flagName: 'moonbeamDmgVolume',
            flagValue: currFlags.moonbeamDmgVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });
        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            'allowInitialMidiCall': true,
            requireDetails: spellDetails
        }

    }
}