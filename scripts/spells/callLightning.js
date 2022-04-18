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
        const placeCrackAsTile = aseFlags?.placeCrackAsTile ?? true;



        let weatherDialogData = {
            buttons: [{ label: game.i18n.localize('ASE.Yes'), value: true }, { label: game.i18n.localize('ASE.No'), value: false }],
            title: game.i18n.localize('ASE.AskStorm')
        };

        let stormyWeather = await warpgate.buttonDialog(weatherDialogData, 'row');

        let boltDamageDieCount;
        let boltDamageDieType;
        let boltDamageDieMod;
        if (aseFlags?.overrideDamage) {
            boltDamageDieCount = Number(aseFlags?.dmgDieCount) || Number(spellLevel);
            boltDamageDieType = aseFlags?.dmgDie ?? 'd10';
            boltDamageDieMod = Number(aseFlags?.dmgMod) || 0;
        } else {
            boltDamageDieCount = Number(spellLevel);
            boltDamageDieType = 'd10';
            boltDamageDieMod = 0;
        }
        boltDamageDieCount = stormyWeather ? boltDamageDieCount + 1 : boltDamageDieCount;

        const boltDamage = `${boltDamageDieCount}${boltDamageDieType}${boltDamageDieMod != 0 ? `+${boltDamageDieMod}` : ''}`;
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
            boltDamage: boltDamage,
            spellLevel: spellLevel,
            itemId: item.id,
            placeCrackAsTile: placeCrackAsTile
        };
        let stormTileId = await placeCloudAsTile(effectOptions);
        //console.log("StomeTileID: ", stormTileId);
        const updates = {
            embedded: {
                Item: {}
            }
        };
        const activationItemName = game.i18n.localize('ASE.ActivateCallLightning');
        updates.embedded.Item[activationItemName] = {
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
                    "value": game.i18n.localize('ASE.ActivateCallLightningCastDescription')
                }
            },
            "flags": {
                "advancedspelleffects": {
                    "enableASE": true,
                    "spellEffect": game.i18n.localize('ASE.ActivateCallLightning'),
                    'effectOptions': {
                        'stormTileId': stormTileId
                    }
                }
            }
        }

        await warpgate.mutate(caster.document, updates, {}, { name: `${caster.actor.id}-call-lightning` });
        ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
        await ChatMessage.create({ content: `${game.i18n.format('ASE.CallLightningChatMessage'), { name: caster.actor.name }}` });
        //await aseSocket.executeAsGM("updateFlag", stormTileId, "stormDamage", );
        await callLightning.callLightningBolt(stormTileId, midiData.itemCardId, midiData.item.id);

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
            const boltDamage = effectOptions.boltDamage;
            const placeCrackAsTile = effectOptions.placeCrackAsTile;
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
                        'boltDamage': boltDamage,
                        'spellLevel': spellLevel,
                        'itemID': itemId,
                        'stormDamage': isStorm,
                        'boltSound': boltSound,
                        'boltVolume': boltVolume,
                        'boltSoundDelay': boltSoundDelay,
                        'placeCrackAsTile': placeCrackAsTile,
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

    static async callLightningBolt(stormTileId, itemCardId, itemId) {
        let stormCloudTile = canvas.scene.tiles.get(stormTileId);
        let getGM = game.users.find(i => i.isGM);
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
        //console.log("TargetsInCrosshairs: ", targetsInCrosshairs);
        let casterID = stormCloudTile.getFlag("advancedspelleffects", "stormCloudTile");
        //console.log("Call Lightning caster id: ", casterID);
        let caster = canvas.tokens.get(casterID);
        let casterActor = caster.document.actor;
        const itemD = casterActor.items.get(itemId);
        //console.log(caster);
        let dist = utilFunctions.measureDistance({ x: stormCloudTile.data.x + (stormCloudTile.data.width / 2), y: stormCloudTile.data.y + (stormCloudTile.data.width / 2) }, boltTemplate);
        //console.log("Distance to bolt: ", dist);
        if (dist > 60) {
            await warpgate.buttonDialog({
                buttons: [{ label: "Ok", value: true }],
                title: `${game.i18n.localize('ASE.SpellFailed')} - ${game.i18n.localize('ASE.OutOfRange')}`
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
            placeCrackAsTile: stormCloudTile.getFlag("advancedspelleffects", "placeCrackAsTile") ?? true,
        }
        //console.log("Storm cloud tile:", stormCloudTile);

        playEffect(boltTemplate, stormCloudTile, boltOptions);

        if (game.modules.get("midi-qol")?.active) {

            //console.log("Tokens in range: ", tokens);

            // console.log("ItemData: ", itemData);
            // console.log("Item: ", item);
            let damage = await new Roll(`${stormCloudTile.getFlag("advancedspelleffects", "boltDamage")}`).evaluate({ async: true });
            if (game.modules.get("dice-so-nice")?.active) {
                game.dice3d?.showForRoll(damage);
            }

            const chatMessage = await game.messages.get(itemCardId);
            let chatMessageContent = await duplicate(chatMessage.data.content);
            let targetTokens = new Set();
            let saves = new Set();
            let saveRolls = [];
            let damageRolls = [];
            let newChatmessageContent = $(chatMessageContent);

            newChatmessageContent.find(".midi-qol-saves-display").empty();
            for await (let targetToken of targetsInCrosshairs) {

                let saveRoll = await new Roll("1d20+@mod", { mod: targetToken.actor.data.data.abilities.dex.save }).evaluate({ async: true });

                let save = saveRoll.total;
                targetTokens.add(targetToken)
                if (save >= saveDC) {
                    saves.add(targetToken);
                    saveRolls.push({ saveRoll: saveRoll, damageRoll: damage, target: targetToken.name, save: true });
                }
                else {
                    saveRolls.push({ saveRoll: saveRoll, damageRoll: damage, target: targetToken.name, save: false });
                }
                //console.log("Adding token to chat card...");
                newChatmessageContent.find(".midi-qol-saves-display").append(
                    $(addTokenToText(targetToken, save, saveDC, damage))
                );

            }
            await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });

            let content = callLightning.buildChatData(saveRolls);
            await ChatMessage.create({ content: content, user: game.user.id, whisper: ChatMessage.getWhisperRecipients(getGM.name) });

            await ui.chat.scrollBottom();

            MidiQOL.applyTokenDamage(
                [{ damage: damage.total, type: "lightning" }],
                damage.total,
                targetTokens,
                itemD,
                saves
            )

            function addTokenToText(token, roll, dc, damageRoll) {
                //console.log(damageRoll);
                let saveResult = roll >= dc ? true : false;

                return `<div class="midi-qol-flex-container">
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
      <div>
      ${saveResult ? game.i18n.format("ASE.SavePassMessage", { saveTotal: roll, damageTotal: Math.floor(damageRoll.total / 2) }) : game.i18n.format("ASE.SaveFailMessage", { saveTotal: roll, damageTotal: damageRoll.total })}
      </div>
      <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
    </div>`;

            }

        }



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
                .atLocation(cloud)
                .stretchTo(boltTemplate)
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
                    if (placeCrackAsTile) {
                        placeCracksAsTile(boltTemplate, groundCrackImgPath);
                    }
                })
            await boltSeq.play();
        }

    }

    static buildChatData(saveRolls) {
        let content = `<table id="callLightningChatTable"><tr><th>${game.i18n.localize("ASE.Target")}</th><th>${game.i18n.localize("ASE.SaveRoll")}</th><th>${game.i18n.localize("ASE.Damage")}</th>`

        //console.log('Building chat data...');
        console.log('ASE CALL LIGHTNING - Save Rolls: ', saveRolls);
        //console.log('Damage Rolls: ', damageRolls);
        //iterate through attackRolls using for in loop

        for (let i = 0; i < saveRolls.length; i++) {
            //console.log("Attack Roll Data: ", attackRolls[i]);
            //console.log("Damage Roll Data: ", damageRolls[i]);
            let currSaveData = saveRolls[i];
            let currTarget = currSaveData.target;
            let currSaveRoll = currSaveData.saveRoll;
            let currDamageRoll = currSaveData.damageRoll;
            let currDamageRollDieTerms = currDamageRoll.terms.filter(term => {
                return term.values?.length > 0;
            });
            let currDamageRollNumericTerms = currDamageRoll.terms.filter(term => {
                return (term.number != undefined) && !(term.values?.length > 0);
            });
            //console.log('Damage Roll Die Terms: ', currDamageRollDieTerms);
            //console.log('Damage Roll Numeric Terms: ', currDamageRollNumericTerms);
            // concatenate the die terms and numeric terms into a single string
            let currDamageFormula = '';
            let currDamageBreakdown = '';
            for (let j = 0; j < currDamageRollDieTerms.length; j++) {
                currDamageFormula += currDamageRollDieTerms[j].formula + (j < currDamageRollDieTerms.length - 1 ? ' + ' : '');
                for (let k = 0; k < currDamageRollDieTerms[j].values.length; k++) {
                    currDamageBreakdown += '[' + (currDamageRollDieTerms[j].values[k]) + ']' + (k < currDamageRollDieTerms[j].values.length - 1 ? ' + ' : '');
                }
            }
            currDamageFormula += currSaveData.save ? '/2: ' : ': ';

            for (let j = 0; j < currDamageRollNumericTerms.length; j++) {
                currDamageBreakdown += ((j == 0) && currDamageRollDieTerms.length > 0 ? ' + ' : '') + currDamageRollNumericTerms[j].number + (j < currDamageRollNumericTerms.length - 1 ? ' + ' : '');
            }
            currDamageBreakdown = currDamageFormula + currDamageBreakdown;

            let currSaveRollResult = currSaveRoll.result.split("+");
            let currSaveBreakDown = '[';
            for (let j = 0; j < currSaveRollResult.length; j++) {
                currSaveBreakDown += `${j == 0 ? currSaveRollResult[j] + ']' : ' + ' + currSaveRollResult[j]}`;
            }
            //console.log("Save Roll Result: ", currSaveRollResult);

            //console.log("Damage Roll: ", damageRoll);
            content += `<tr><td>${currTarget}</td><td title = '${currSaveBreakDown}'>${currSaveRoll._total}</td><td title = '${currDamageBreakdown}'>${currSaveData.save ? Math.floor(currDamageRoll.total / 2) : currDamageRoll.total}</td></tr>`;
        }

        return content;
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == casterToken.id);
        //console.log(casterToken);
        //console.log("tiles to delete: ", [tiles[0].id]);
        if (stormCloudTiles.length > 0) {
            console.log("Removing Storm Cloud Tile...", stormCloudTiles[0].id);
            await aseSocket.executeAsGM("deleteTiles", [stormCloudTiles[0].id]);
            await warpgate.revert(casterToken.document, `${casterActor.id}-call-lightning`);
            ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
            await ChatMessage.create({ content: game.i18n.localize('ASE.ActivateCallLightningDissipate') });
        }

    }

    static async _updateCombat(combat) {
        let currentCombatantId = combat.current.tokenId;
        let caster = canvas.tokens.get(currentCombatantId);
        if (!caster) return;
        if (!caster.actor.isOwner || (game.user.isGM && caster.actor.hasPlayerOwner)) return;
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == currentCombatantId);
        //console.log("update hook fired...", stormCloudTiles);
        if (stormCloudTiles.length > 0) {
            //console.log("Detected Storm Cloud! Prompting for Bolt...");
            let confirmData = {
                buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
                title: game.i18n.format('ASE.ActivateCallLightningDialog', { spellLevel: stormCloudTiles[0].getFlag("advancedspelleffects", "spellLevel") })
            };
            let confirm = await warpgate.buttonDialog(confirmData, 'row');
            if (confirm) {
                let item = caster.actor.items.filter(i => i.name == game.i18n.localize('ASE.ActivateCallLightning'))[0];
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
        const boltOptions = {
            "chain": game.i18n.localize('ASE.Chain'),
            "strike": game.i18n.localize('ASE.Strike')
        };
        const dieOptions = {
            'd4': 'd4',
            'd6': 'd6',
            'd8': 'd8',
            'd10': 'd10',
            'd12': 'd12',
            'd20': 'd20',
        };

        spellOptions.push({
            label: game.i18n.localize("ASE.OverrideDamageLabel"),
            tooltip: game.i18n.localize("ASE.OverrideDamageTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.overrideDamage',
            flagName: 'overrideDamage',
            flagValue: currFlags.overrideDamage ?? false,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieCountLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgDieCount',
            flagName: 'dmgDieCount',
            flagValue: currFlags.dmgDieCount ?? 3,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieLabel"),
            type: 'dropdown',
            options: dieOptions,
            name: 'flags.advancedspelleffects.effectOptions.dmgDie',
            flagName: 'dmgDie',
            flagValue: currFlags.dmgDie ?? 'd10',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageBonusLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgMod',
            flagName: 'dmgMod',
            flagValue: currFlags.dmgMod ?? 0,
        });


        animOptions.push({
            label: game.i18n.localize('ASE.SelectBoltStyleLabel'),
            type: "dropdown",
            options: boltOptions,
            name: "flags.advancedspelleffects.effectOptions.boltStyle",
            flagName: "boltStyle",
            flagValue: currFlags.boltStyle,
        });
        animOptions.push({
            label: game.i18n.localize('ASE.PlaceCrackAsTileLabel'),
            tooltip: game.i18n.localize('ASE.PlaceCrackAsTileTooltip'),
            type: "checkbox",
            name: "flags.advancedspelleffects.effectOptions.placeCrackAsTile",
            flagName: "placeCrackAsTile",
            flagValue: currFlags.placeCrackAsTile ?? true,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.BoltSoundLabel'),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.boltSound',
            flagName: 'boltSound',
            flagValue: currFlags.boltSound,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.BoltSoundDelayLabel'),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.boltSoundDelay',
            flagName: 'boltSoundDelay',
            flagValue: currFlags.boltSoundDelay,
        });
        soundOptions.push({
            label: game.i18n.localize('ASE.BoltVolumeLabel'),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.boltVolume',
            flagName: 'boltVolume',
            flagValue: currFlags.boltVolume,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
        }
    }

}
