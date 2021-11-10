import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
export class callLightning {

    static registerHooks() {
        Hooks.on("updateCombat", callLightning._updateCombat);
    }

    static async createStormCloud(midiData) {
        const item = midiData.item;
        const caster = canvas.tokens.get(midiData.tokenId);
        const spellLevel = midiData.itemLevel;
        //console.log(midiData);
        let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
        let color = "blue";
        let res = "low";
        let boltStyle = aseFlags?.boltStyle?.toLowerCase() ?? 'chain';

        const boltSound = aseFlags?.boltSound ?? "";
        const boltVolume = aseFlags?.boltVolume ?? 1;
        const boltSoundDelay = aseFlags?.boltSoundDelay ?? 0;

        const stormCloudSound = aseFlags?.stormCloudSound ?? "";
        const stormCloudVolume = aseFlags?.stormCloudVolume ?? 1;
        const stormCloudSoundDelay = aseFlags?.stormCloudSoundDelay ?? 0;


        let weatherDialogData = {
            buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
            title: "Is there a storm?"
        };

        let stormyWeather = await warpgate.buttonDialog(weatherDialogData, 'row');
        const displayCrosshairs = async (crosshairs) => {
            new Sequence("Advanced Spell Effects")
                .effect()
                .file("jb2a.call_lightning.low_res.blue")
                .attachTo(crosshairs)
                .persist()
                .scaleToObject()
                .opacity(0.5)
                .play()

        }
        let crosshairsConfig = {
            size: 25,
            icon: item.img,
            label: "Call Lightning",
            tag: 'call-lightning-crosshairs',
            drawIcon: true,
            drawOutline: false,
            interval: 1
        }
        let castTemplate = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
        let effectFile = `jb2a.call_lightning.${res}_res.${color}`;
        //console.log(effectFile);
        const effectFilePath = Sequencer.Database.getEntry(effectFile).file;
        const effectOptions = {
            castTemplate: castTemplate,
            casterId: midiData.tokenId,
            isStorm: stormyWeather,
            effectFilePath: effectFilePath,
            stormCloudSound: stormCloudSound,
            stormCloudVolume: stormCloudVolume,
            stormCloudSoundDelay: stormCloudSoundDelay,
            boltSound: boltSound,
            boltVolume: boltVolume,
            boltSoundDelay: boltSoundDelay,
            boltStyle: boltStyle,
            spellLevel: spellLevel,
            itemId: item.id
        };
        let stormTileId = await placeCloudAsTile(effectOptions);
        //console.log("StomeTileID: ", stormTileId);
        const updates = {
            embedded: {
                Item: {
                    "Call Lightning Bolt": {
                        "type": "spell",
                        "img": item.img,
                        "data": {
                            "ability": "",
                            "actionType": "other",
                            "activation": { "type": "action", "cost": 1, "condition": "" },
                            "damage": { "parts": [], "versatile": "" },
                            "level": spellLevel,
                            "preparation": { "mode": 'atwill', "prepared": true },
                            "range": { "value": null, "long": null, "units": "" },
                            "school": "con",
                            "description": {
                                "value": "Call forth a bolt of lightning from the storm cloud above."
                            }
                        },
                        "flags": {
                            "advancedspelleffects": {
                                "enableASE": true,
                                'effectOptions': {
                                    'stormTileId': stormTileId
                                }
                            }
                        }
                    }
                }
            }
        }
        await warpgate.mutate(caster.document, updates, {}, { name: `${caster.actor.id}-call-lightning` });
        ui.notifications.info(`Call Lightning Bolt has been added to your At-Will spells.`);
        ChatMessage.create({ content: `${caster.actor.name} darkens the sky with a storm cloud...` });
        //await aseSocket.executeAsGM("updateFlag", stormTileId, "stormDamage", );
        await callLightning.callLightningBolt(stormTileId);

        async function placeCloudAsTile(effectOptions) {
            const castTemplate = effectOptions.castTemplate;
            const casterId = effectOptions.casterId;
            const effectFilePath = effectOptions.effectFilePath;
            const isStorm = effectOptions.isStorm;
            const stormCloudSound = effectOptions.stormCloudSound;
            const stormCloudVolume = effectOptions.stormCloudVolume;
            const stormCloudSoundDelay = effectOptions.stormCloudSoundDelay;
            const boltSound = effectOptions.boltSound;
            const boltVolume = effectOptions.boltVolume;
            const boltSoundDelay = effectOptions.boltSoundDelay;
            const boltStyle = effectOptions.boltStyle;
            const spellLevel = effectOptions.spellLevel;
            const itemId = effectOptions.itemId;

            let templateData = castTemplate;
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;

            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);
            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);
            let data = {
                alpha: 0.5,
                width: tileWidth,
                height: tileHeight,
                img: effectFilePath,
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
                    advancedspelleffects: {
                        'stormCloudTile': casterId,
                        'boltStyle': boltStyle,
                        'spellLevel': spellLevel,
                        'itemID': itemId,
                        'stormDamage': isStorm,
                        'boltSound': boltSound,
                        'boltVolume': boltVolume,
                        'boltSoundDelay': boltSoundDelay
                    }
                }
            }
            let createdTiles = await aseSocket.executeAsGM("placeTiles", [data]);
            const tileId = createdTiles[0].id ?? createdTiles[0]._id;

            new Sequence("Advanced Spell Effects")
                .sound()
                .file(stormCloudSound)
                .volume(stormCloudVolume)
                .delay(stormCloudSoundDelay)
                .playIf(stormCloudSound !== "")
                .play()
            return (tileId);
        }
    }

    static async callLightningBolt(stormTileId) {
        let stormCloudTile = canvas.scene.tiles.get(stormTileId);
        let confirmData = {
            buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
            title: `Call forth Level ${stormCloudTile.getFlag("advancedspelleffects", "spellLevel")} Lightning Bolt?`
        };
        let confirm = await warpgate.buttonDialog(confirmData, 'row');
        if (confirm) {
            let crosshairsConfig = {
                size: 3,
                icon: "icons/magic/lightning/bolt-strike-blue.webp",
                label: "Lightning Bolt",
                tag: 'lightning-bolt-crosshairs',
                drawIcon: true,
                drawOutline: true,
                interval: 1
            }
            let boltTemplate = await warpgate.crosshairs.show(crosshairsConfig);
            let casterID = stormCloudTile.getFlag("advancedspelleffects", "stormCloudTile");
            //console.log("Call Lightning caster id: ", casterID);
            let caster = canvas.tokens.get(casterID);
            let casterActor = caster.document.actor;
            //console.log(caster);
            let dist = utilFunctions.measureDistance({ x: caster.data.x + (canvas.grid.size / 2), y: caster.data.y + (canvas.grid.size / 2) }, boltTemplate);
            //console.log("Distance to bolt: ", dist);
            if (dist > 60) {
                await warpgate.buttonDialog({
                    buttons: [{ label: "Ok", value: true }],
                    title: "Spell Failed - Out of Range!"
                }, 'row')
                return;
            }

            //console.log("Caster Actor: ", casterActor);
            let saveDC = casterActor.data.data.attributes.spelldc;
            //console.log("Save DC: ", saveDC);
            const boltOptions = {
                boltStyle: stormCloudTile.getFlag("advancedspelleffects", "boltStyle"),
                boltSound: stormCloudTile.getFlag("advancedspelleffects", "boltSound") ?? "",
                boltVolume: stormCloudTile.getFlag("advancedspelleffects", "boltVolume") ?? 0,
                boltSoundDelay: Number(stormCloudTile.getFlag("advancedspelleffects", "boltSoundDelay")) ?? 0,
            }
            //console.log("Storm cloud tile:", stormCloudTile);

            playEffect(boltTemplate, stormCloudTile, boltOptions);

            if (game.modules.get("midi-qol")?.active) {
                let tokens = canvas.tokens.placeables.map(t => {
                    let distance = canvas.grid.measureDistance({ x: boltTemplate.x, y: boltTemplate.y }, { x: t.data.x + (canvas.grid.size / 2), y: t.data.y + (canvas.grid.size / 2) });
                    // console.log("bolt Loc", { x: template.x, y: template.y });
                    let returnObj = { token: t, distance: distance };
                    //console.log("Returning object: ", returnObj);
                    return (returnObj);
                }).filter(t => t.distance <= 7.5);
                //console.log("Tokens in range: ", tokens);
                let failedSaves = [];
                let passedSaves = [];

                for (const currentTarget of tokens) {
                    let currentTargetActor = currentTarget.token.actor;
                    let saveResult = await currentTargetActor.rollAbilitySave("dex", { fastForward: true, flavor: "Call Lightning Saving Throw" });

                    if (saveResult.total < saveDC) {
                        failedSaves.push(currentTarget.token);
                    }
                    else if (saveResult.total >= saveDC) {
                        passedSaves.push(currentTarget.token);
                    }
                }
                //console.log("Failed Saves - ", failedSaves);
                // console.log("Passed Saves - ", passedSaves);
                let spellLevel = stormCloudTile.getFlag("advancedspelleffects", "spellLevel");
                if (stormCloudTile.getFlag("advancedspelleffects", "stormDamage")) {
                    spellLevel += 1;
                }
                let item = casterActor.items.get(stormCloudTile.getFlag("advancedspelleffects", "itemID"));
                let itemData = item.data;
                itemData.data.components.concentration = false;
                // console.log("ItemData: ", itemData);
                // console.log("Item: ", item);
                let fullDamageRoll = await new Roll(`${spellLevel}d10`).evaluate({ async: true });
                if (game.modules.get("dice-so-nice")?.active) {
                    game.dice3d?.showForRoll(fullDamageRoll);
                }
                //console.log("Lightning Bolt Full Damage roll: ", fullDamageRoll);
                let halfdamageroll = await new Roll(`${fullDamageRoll.total}/2`).evaluate({ async: true });

                if (failedSaves.length > 0) {
                    new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, fullDamageRoll.total, "lightning", failedSaves, fullDamageRoll, { flavor: `Lightning Bolt Full Damage - Damage Roll (${spellLevel}d10 Lightning)`, itemCardId: "new", itemData: itemData });
                }
                if (passedSaves.length > 0) {
                    new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, halfdamageroll.total, "lightning", passedSaves, halfdamageroll, { flavor: `Lightning Bolt Half Damage - Damage Roll (${spellLevel}d10 Lightning)`, itemCardId: "new", itemData: itemData });
                }
            }

        }

        async function playEffect(boltTemplate, cloud, boltOptions) {
            const boltStyle = boltOptions.boltStyle;
            const boltSound = boltOptions.boltSound;
            const boltVolume = boltOptions.boltVolume;
            const boltSoundDelay = boltOptions.boltSoundDelay;

            let boltEffect;
            switch (boltStyle) {
                case 'chain':
                    boltEffect = 'jb2a.chain_lightning.primary.blue'
                    break;
                case 'strike':
                    boltEffect = 'jb2a.lightning_strike'
                    break;
                default:
                    boltEffect = 'jb2a.chain_lightning.primary.blue'
            }

            async function placeCracksAsTile(boltTemplate, effectFilePath) {
                //console.log("Template Data: ", template);
                let templateData = boltTemplate;
                let tileWidth;
                let tileHeight;
                let tileX;
                let tileY;

                tileWidth = templateData.width * (canvas.grid.size);
                tileHeight = templateData.width * (canvas.grid.size);
                tileX = templateData.x - (tileWidth / 2);
                tileY = templateData.y - (tileHeight / 2);
                let data = [{
                    alpha: 1,
                    width: tileWidth,
                    height: tileHeight,
                    img: effectFilePath,
                    overhead: false,
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
                }];
                let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
            }

            let cloudCenter = { x: cloud.data.x + (cloud.data.width / 2), y: cloud.data.y + (cloud.data.width / 2) };
            let strikeRay = new Ray(boltTemplate, cloudCenter);
            let strikeAngle = strikeRay.angle * (180 / Math.PI)
            let strikeRotation = (-strikeAngle) - 90;
            let groundCrackVersion = utilFunctions.getRandomInt(1, 3);
            let groundCrackAnim = `jb2a.impact.ground_crack.blue.0${groundCrackVersion}`;
            let groundCrackImg = `jb2a.impact.ground_crack.still_frame.0${groundCrackVersion}`;
            let groundCrackImgPath = Sequencer.Database.getEntry(groundCrackImg).file;
            let boltSeq = new Sequence("Advanced Spell Effects")
                .sound()
                .file(boltSound)
                .volume(boltVolume)
                .delay(boltSoundDelay)
                .playIf(boltSound != "")
                .effect()
                .file(boltEffect)
                .JB2A()
                .atLocation(cloud)
                .reachTowards(boltTemplate)
                .waitUntilFinished(-1500)
                .playIf(boltStyle == "chain")
                .effect()
                .file(boltEffect)
                .atLocation({ x: boltTemplate.x, y: boltTemplate.y })
                .playIf(boltStyle == "strike")
                .rotate(strikeRotation)
                .randomizeMirrorX()
                .scale(2)
                .effect()
                .file(groundCrackAnim)
                .atLocation(boltTemplate)
                .belowTokens()
                .scale(0.5)
                .waitUntilFinished(-3000)
                .thenDo(async () => {
                    placeCracksAsTile(boltTemplate, groundCrackImgPath);
                })
            await boltSeq.play();
        }

    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == casterToken.id);
        //console.log(casterToken);
        //console.log("tiles to delete: ", [tiles[0].id]);
        if (stormCloudTiles.length > 0) {
            //console.log("Removing Storm Cloud Tile...", stormCloudTiles[0].id);
            await aseSocket.executeAsGM("deleteTiles", [stormCloudTiles[0].id]);
            await warpgate.revert(casterToken.document, `${casterActor.id}-call-lightning`);
            ui.notifications.info(`Call Lightning Bolt has been removed from your At-Will spells.`);
            ChatMessage.create({ content: `The storm cloud dissipates...` });
        }

    }

    static async _updateCombat(combat) {
        let currentCombatantId = combat.current.tokenId;
        let caster = canvas.tokens.get(currentCombatantId);
        if (!caster.actor.isOwner || (game.user.isGM && caster.actor.hasPlayerOwner)) return;
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == currentCombatantId);
        //console.log("update hook fired...", stormCloudTiles);
        if (stormCloudTiles.length > 0) {
            //console.log("Detected Storm Cloud! Prompting for Bolt...");
            await callLightning.callLightningBolt(stormCloudTiles[0].id);
        }
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];
        const boltOptions = {
            "chain": "Chain",
            "strike": "Strike",
        }
        animOptions.push({
            label: "Select Bolt Style: ",
            type: "dropdown",
            options: boltOptions,
            name: "flags.advancedspelleffects.effectOptions.boltStyle",
            flagName: "boltStyle",
            flagValue: currFlags.boltStyle,
        });
        soundOptions.push({
            label: 'Bolt Sound:',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.boltSound',
            flagName: 'boltSound',
            flagValue: currFlags.boltSound,
        });
        soundOptions.push({
            label: 'Bolt Sound Delay:',
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.boltSoundDelay',
            flagName: 'boltSoundDelay',
            flagValue: currFlags.boltSoundDelay,
        });
        soundOptions.push({
            label: 'Bolt Volume:',
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.boltVolume',
            flagName: 'boltVolume',
            flagValue: currFlags.boltVolume,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
        }
    }

}
