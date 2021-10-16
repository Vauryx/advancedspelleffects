import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
export class callLightning {

    static registerHooks() {
        Hooks.on("updateCombat", callLightning._updateCombat);
    }
    
    static async createStormCloud(midiData) {
        let item = midiData.item;
        //console.log(midiData);
        let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
        let color = "blue";
        let res = "low";
        let boltStyle = aseFlags?.boltStyle?.toLowerCase() ?? 'chain';

        let weatherDialogData = {
            buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
            title: "Is there a storm?"
        };

        let stormyWeather = await warpgate.buttonDialog(weatherDialogData, 'row');
        let castTemplate = await warpgate.crosshairs.show(25, midiData.item.img, "Call Lightning");
        let effectFile = `jb2a.call_lightning.${res}_res.${color}`
        let effectFilePath = Sequencer.Database.getEntry(effectFile).file;
        let stormTileId = await placeCloudAsTile(castTemplate, midiData.tokenId, stormyWeather);
        console.log("StomeTileID: ", stormTileId);

        //await aseSocket.executeAsGM("updateFlag", stormTileId, "stormDamage", );
        await callLightning.callLightningBolt(canvas.scene.tiles.get(stormTileId));

        async function placeCloudAsTile(castTemplate, casterId, isStorm) {
            let templateData = castTemplate;
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;

            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);
            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);
            data = {
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
                        'spellLevel': midiData.itemLevel,
                        'itemID': midiData.item.data._id,
                        'stormDamage': isStorm
                    }
                }
            }
            let createdTiles = await aseSocket.executeAsGM("placeTiles", [data]);
            let tileId = createdTiles[0].id ?? createdTiles[0]._id;
            return (tileId);
        }
    }

    static async callLightningBolt(stormCloudTile) {
        let confirmData = {
            buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
            title: "Call forth Lightning Bolt?"
        };
        let confirm = await warpgate.buttonDialog(confirmData, 'row');
        if (confirm) {
            let boltTemplate = await warpgate.crosshairs.show(3, "icons/magic/lightning/bolt-strike-blue.webp", "Lightning Bolt");
            let casterID = stormCloudTile.getFlag("advancedspelleffects", "stormCloudTile");
            //console.log("Call Lightning caster id: ", casterID);
            let caster = canvas.tokens.get(casterID);
            let dist = utilFunctions.measureDistance({ x: caster.data.x + (canvas.grid.size / 2), y: caster.data.y + (canvas.grid.size / 2) }, boltTemplate);
            //console.log("Distance to bolt: ", dist);
            if (dist > 60) {
                await warpgate.buttonDialog({
                    buttons: [{ label: "Ok", value: true }],
                    title: "Spell Failed - Out of Range!"
                }, 'row')
                return;
            }
            let casterActor = game.actors.get(caster.data.actorId);
            //console.log("Caster Actor: ", casterActor);
            let saveDC = casterActor.data.data.attributes.spelldc;
            //console.log("Save DC: ", saveDC);
            const boltStyle = stormCloudTile.getFlag("advancedspelleffects", 'boltStyle');
            //console.log("Storm cloud tile:", stormCloudTile);

            playEffect(boltTemplate, stormCloudTile, boltStyle);

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
                let saveResult = await currentTargetActor.rollAbilitySave("dex", { fastForward: true, flavor: "Thunder Step Saving Throw" });

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
            let fullDamageRoll = new Roll(`${spellLevel}d10`).evaluate();
            if (game.modules.get("dice-so-nice")?.active) {
                game.dice3d?.showForRoll(fullDamageRoll);
            }
            //console.log("Thunder Step Full Damage roll: ", fullDamageRoll);
            let halfdamageroll = new Roll(`${fullDamageRoll.total}/2`).evaluate({ async: false });
            if (failedSaves.length > 0) {
                new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, fullDamageRoll.total, "lightning", failedSaves, fullDamageRoll, { flavor: `Lightning Bolt Full Damage - Damage Roll (${spellLevel}d10 Lightning)`, itemCardId: "new", itemData: itemData });
            }
            if (passedSaves.length > 0) {
                new MidiQOL.DamageOnlyWorkflow(casterActor, caster.document, halfdamageroll.total, "lightning", passedSaves, halfdamageroll, { flavor: `Lightning Bolt Half Damage - Damage Roll (${spellLevel}d10 Lightning)`, itemCardId: "new", itemData: itemData });
            }
        }

        async function playEffect(boltTemplate, cloud, boltStyle) {
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
                data = [{
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
            let boltSeq = new Sequence("Advanced Spell Effects")
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
                    placeCracksAsTile(boltTemplate, Sequencer.Database.getEntry(groundCrackImg).file);
                })
            await boltSeq.play();
        }

    }

    static async _updateCombat(combat) {
        let currentCombatantId = combat.current.tokenId;
        let caster = canvas.tokens.get(currentCombatantId);
        if (!caster.actor.isOwner || game.user.isGM) return;
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == currentCombatantId);
        //console.log("update hook fired...", stormCloudTiles);
        if (stormCloudTiles.length > 0) {
            //console.log("Detected Storm Cloud! Prompting for Bolt...");
            await callLightning.callLightningBolt(stormCloudTiles[0]);
        }
    }
}
