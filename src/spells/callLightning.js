import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
export class callLightning {

    static registerHooks() {
        Hooks.on("updateCombat", callLightning._updateCombat);
    }

    static async createStormCloud(midiData) {
        console.log("Creating Storm Cloud...", midiData);
        const item = midiData.item;
        const itemUuid = item.uuid;
        const caster = canvas.tokens.get(midiData.tokenId);
        const casterActor = game.actors.get(caster.actor.id);
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
        const placeCrackAsTile = aseFlags?.placeCrackAsTile ?? false;

        let weatherDialogData = {
            buttons: [{ label: game.i18n.localize('ASE.Yes'), value: true }, { label: game.i18n.localize('ASE.No'), value: false }],
            title: game.i18n.localize('ASE.AskStorm')
        };

        let stormyWeather = await warpgate.buttonDialog(weatherDialogData, 'row');

        //console.log('boltDamage: ', boltDamage);

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
            label: game.i18n.localize('ASE.CallLightning'),
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
            itemId: item.id,
            placeCrackAsTile: placeCrackAsTile,
            originalItemUuid: itemUuid
        };
        let stormTileId = await placeCloudAsTile(effectOptions);
        //console.log("StomeTileID: ", stormTileId);
        const updates = {
            embedded: {
                Item: {}
            }
        };
        const activationItemName = game.i18n.localize('ASE.ActivateCallLightning');
        let castItemDamage = item.system.damage;
        //castItemDamage.parts[0] is the damage formula, grab the first number in string
        let newDamageNum = Number(castItemDamage.parts[0][0][0]) + (spellLevel - 3) + (stormyWeather ? 1 : 0);
        //replace the first number in castItemDamage.parts[0] with newDamageNum keeping the rest of the formula
        castItemDamage.parts[0][0] = castItemDamage.parts[0][0].replace(/\d+/, newDamageNum);
        updates.embedded.Item[activationItemName] = {
            "type": "spell",
            "img": item.img,
            "system": {
                "ability": "",
                "actionType": "save",
                "activation": { "type": "action", "cost": 1, "condition": "" },
                "damage": castItemDamage,
                "scaling": item.system.scaling,
                "level": spellLevel,
                "save": item.system.save,
                "preparation": { "mode": 'atwill', "prepared": true },
                "range": { "value": null, "long": null, "units": "" },
                "school": "con",
                "description": {
                    "value": game.i18n.localize('ASE.ActivateCallLightningCastDescription')
                }
            },
            "flags": {
                "advancedspelleffects": {
                    "enableASE": true,
                    "spellEffect": game.i18n.localize('ASE.ActivateCallLightning'),
                    "castItem": true,
                    "savesRequired": true,
                    'effectOptions': {
                        'stormTileId': stormTileId,
                        'allowInitialMidiCall': true
                    }
                }
            }
        }

        await warpgate.mutate(caster.document, updates, {}, { name: `${caster.actor.id}-call-lightning` });
        ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
        await ChatMessage.create({ content: `${game.i18n.format('ASE.CallLightningChatMessage', { name: caster.actor.name })}` });
        //await aseSocket.executeAsGM("updateFlag", stormTileId, "stormDamage", );
        effectOptions.stormTileId = stormTileId;
        effectOptions.concentration = true;
        let castItem = casterActor.items.getName(activationItemName);
        effectOptions.castItem = castItem.uuid;
        game.ASESpellStateManager.addSpell(midiData.itemUuid, effectOptions);


        async function placeCloudAsTile(effectOptions) {
            console.log("Placing Cloud as Tile...", effectOptions);
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
            const placeCrackAsTile = effectOptions.placeCrackAsTile;
            const itemUuid = effectOptions.originalItemUuid;
            console.log('itemUuid: ', itemUuid);
            let templateData = castTemplate;

            const tileWidth = (templateData.size * canvas.grid.size);
            const tileHeight = (templateData.size * canvas.grid.size);
            const tileX = templateData.x - (tileWidth / 2);
            const tileY = templateData.y - (tileHeight / 2);

            const data = {
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
                        'itemUuid': itemUuid,
                        'stormDamage': isStorm,
                        'boltSound': boltSound,
                        'boltVolume': boltVolume,
                        'boltSoundDelay': boltSoundDelay,
                        'placeCrackAsTile': placeCrackAsTile,
                    }
                }
            }

            const createdTiles = await aseSocket.executeAsGM("placeTiles", [data]);
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

    static async getBoltTargets(stormTileId) {
        //console.log("Getting Bolt Targets...", stormTileId);
        let stormCloudTile = canvas.scene.tiles.get(stormTileId);
        //console.log("StormCloudTile: ", stormCloudTile);
        let crosshairsConfig = {
            size: 3,
            icon: "icons/magic/lightning/bolt-strike-blue.webp",
            label: game.i18n.localize('ASE.LightningBolt'),
            tag: 'lightning-bolt-crosshairs',
            drawIcon: true,
            drawOutline: true,
            interval: 1
        }
        let boltTemplate = await warpgate.crosshairs.show(crosshairsConfig, { show: utilFunctions.checkCrosshairs });
        //console.log("BoltTemplate: ", boltTemplate);
        const targetsInCrosshairs = warpgate.crosshairs.collect(boltTemplate, ['Token'], utilFunctions.getContainedCustom)['Token'];
        for await (let target of targetsInCrosshairs) {
            let markerApplied = Sequencer.EffectManager.getEffects({ name: `ase-crosshairs-marker-${target.id}` });
            if (markerApplied.length > 0) {
                Sequencer.EffectManager.endEffects({ name: `ase-crosshairs-marker-${target.id}` });
            }
        }
        let dist = utilFunctions.measureDistance({ x: stormCloudTile.x + (stormCloudTile.width / 2), y: stormCloudTile.y + (stormCloudTile.width / 2) }, boltTemplate);
        //console.log("Distance to bolt: ", dist);
        if (dist > 60) {
            await warpgate.buttonDialog({
                buttons: [{ label: "Ok", value: true }],
                title: `${game.i18n.localize('ASE.SpellFailed')} - ${game.i18n.localize('ASE.OutOfRange')}`
            }, 'row')
            return [];
        }
        const boltOptions = {
            boltStyle: stormCloudTile.getFlag("advancedspelleffects", "boltStyle"),
            boltSound: stormCloudTile.getFlag("advancedspelleffects", "boltSound") ?? "",
            boltVolume: stormCloudTile.getFlag("advancedspelleffects", "boltVolume") ?? 0,
            boltSoundDelay: Number(stormCloudTile.getFlag("advancedspelleffects", "boltSoundDelay")) ?? 0,
            placeCrackAsTile: stormCloudTile.getFlag("advancedspelleffects", "placeCrackAsTile") ?? true,
        }
        //console.log("Storm cloud tile:", stormCloudTile);

        playEffect(boltTemplate, stormCloudTile, boltOptions);

        async function playEffect(boltTemplate, cloud, boltOptions) {
            const boltStyle = boltOptions.boltStyle;
            const boltSound = boltOptions.boltSound;
            const boltVolume = boltOptions.boltVolume;
            const boltSoundDelay = boltOptions.boltSoundDelay;
            const placeCrackAsTile = boltOptions.placeCrackAsTile;
            //console.log("Place crack as tile: ", placeCrackAsTile);
            let boltEffect;
            switch (boltStyle) {
                case 'chain':
                    boltEffect = 'jb2a.chain_lightning.primary.blue'
                    break;
                case 'strike':
                    boltEffect = 'jb2a.lightning_strike.blue'
                    break;
                default:
                    boltEffect = 'jb2a.chain_lightning.primary.blue'
            }

            async function placeCracksAsTile(boltTemplate, effectFilePath) {
                //console.log("Template Data: ", template);
                let templateData = boltTemplate;

                const tileWidth = templateData.width * (canvas.grid.size);
                const tileHeight = templateData.width * (canvas.grid.size);
                const tileX = templateData.x - (tileWidth / 2);
                const tileY = templateData.y - (tileHeight / 2);
                const data = [{
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

                return aseSocket.executeAsGM("placeTiles", data);
            }

            let cloudCenter = { x: cloud.x + (cloud.width / 2), y: cloud.y + (cloud.width / 2) };
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
                .playIf(boltSound !== "")
                .effect()
                .file(boltEffect)
                .atLocation(cloud)
                .stretchTo(boltTemplate)
                .waitUntilFinished(-1500)
                .playIf(boltStyle === "chain")
                .effect()
                .file(boltEffect)
                .atLocation({ x: boltTemplate.x, y: boltTemplate.y })
                .playIf(boltStyle === "strike")
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
                    if (placeCrackAsTile) {
                        placeCracksAsTile(boltTemplate, groundCrackImgPath);
                    }
                })
            await boltSeq.play();
        }

        return targetsInCrosshairs;
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.flags.advancedspelleffects?.stormCloudTile === casterToken.id);
        const isGM = utilFunctions.isFirstGM();
        //console.log(casterToken);
        //console.log("tiles to delete: ", [tiles[0].id]);
        if (stormCloudTiles.length > 0) {
            console.log("Removing Storm Cloud Tile...", stormCloudTiles[0].id);
            const itemUuid = stormCloudTiles[0].getFlag("advancedspelleffects", "itemUuid");
            let spellState = game.ASESpellStateManager.getSpell(itemUuid);
            console.log("Spell State: ", spellState);
            if(spellState) {
                game.ASESpellStateManager.removeSpell(itemUuid);
            }
            if(isGM) {
                await aseSocket.executeAsGM("deleteTiles", [stormCloudTiles[0].id]);
                await warpgate.revert(casterToken.document, `${casterActor.id}-call-lightning`);
                ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
                await ChatMessage.create({ content: game.i18n.localize('ASE.ActivateCallLightningDissipate') });
            }
            
        }

    }

    static async _updateCombat(combat) {
        let currentCombatantId = combat.current.tokenId;
        let caster = canvas.tokens.get(currentCombatantId);
        if (!caster) return;
        if (!caster.actor.isOwner || (game.user.isGM && caster.actor.hasPlayerOwner)) return;
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.flags.advancedspelleffects?.stormCloudTile === currentCombatantId);
        //console.log("update hook fired...", stormCloudTiles);
        if (stormCloudTiles.length > 0) {
            //console.log("Detected Storm Cloud! Prompting for Bolt...");
            let confirmData = {
                buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
                title: game.i18n.format('ASE.ActivateCallLightningDialog', { spellLevel: stormCloudTiles[0].getFlag("advancedspelleffects", "spellLevel") })
            };
            let confirm = await warpgate.buttonDialog(confirmData, 'row');
            if (confirm) {
                let item = caster.actor.items.filter(i => i.name === game.i18n.localize('ASE.ActivateCallLightning'))[0];
                if (item) {
                    await item.roll();
                }
                else {
                    ui.notifications.error(game.i18n.format("ASE.NoSpellItem", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
                }
            }
        }
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];
        const boltOptions = [{
            "chain": game.i18n.localize('ASE.Chain')},
            {"strike": game.i18n.localize('ASE.Strike')
        }];
        /*const dieOptions = {
            'd4': 'd4',
            'd6': 'd6',
            'd8': 'd8',
            'd10': 'd10',
            'd12': 'd12',
            'd20': 'd20',
        };*/
        const dieOptions = [
            {'d4': 'd4'},
            {'d6': 'd6'},
            {'d8': 'd8'},
            {'d10': 'd10'},
            {'d12': 'd12'},
            {'d20': 'd20'}
        ];

        const spellDetails = {
            actionType: "save",
            target : {
                type: "",
                units: "",
                value: null,
                width: null,
            }
        };
        animOptions.push({
            label: game.i18n.localize('ASE.SelectBoltStyleLabel'),
            type: "dropdown",
            options: boltOptions,
            name: "flags.advancedspelleffects.effectOptions.boltStyle",
            flagName: "boltStyle",
            flagValue: currFlags.boltStyle ?? 'chain',
        });
        animOptions.push({
            label: game.i18n.localize('ASE.PlaceCrackAsTileLabel'),
            tooltip: game.i18n.localize('ASE.PlaceCrackAsTileTooltip'),
            type: "checkbox",
            name: "flags.advancedspelleffects.effectOptions.placeCrackAsTile",
            flagName: "placeCrackAsTile",
            flagValue: currFlags.placeCrackAsTile ?? false,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.BoltSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.boltSound',
            flagName: 'boltSound',
            flagValue: currFlags.boltSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.BoltSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.boltSoundDelay',
            flagName: 'boltSoundDelay',
            flagValue: currFlags.boltSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.BoltVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.boltVolume',
            flagName: 'boltVolume',
            flagValue: currFlags.boltVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: true,
            requireDetails: spellDetails
        }
    }

}
