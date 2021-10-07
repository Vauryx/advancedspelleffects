let ASEsocket;
//Define every function needed for an effect here so that they can be registered by socketlib


Hooks.once('ready', async function () {
    Hooks.on("updateToken", async (tokenDocument, updateData, options) => {
        //console.log("Executing detect magic hook!...");
        if ((!updateData.x && !updateData.y)) return;
        //console.log("hook fired!...", tokenDocument, updateData);
        if (tokenDocument.actor.effects.filter((effect) => effect.data.document.sourceName == "Detect Magic").length == 0) {
            //console.log("ASE Detect Magic effect not found...", tokenDocument.actor.effects.filter((effect) => effect.data.document.sourceName == "Detect Magic - MIDI"));
            return;
        }
        //console.log("Found token with Detect Magic concentration!...");
        let users = [];
        for (const user in tokenDocument.actor.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }
        let newPos = { x: 0, y: 0 };
        newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
        newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
        //console.log("Controlled token: " , tokenDocument);
        let magicalObjectsOutOfRange = [];
        let magicalObjectsInRange = [];
        let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
        let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

        let objects = await Tagger.getByTag("magical", { ignore: [tokenDocument] });

        magicalObjectsOutOfRange = objects.map(o => {
            let distance = canvas.grid.measureDistance(newPos, o);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        }).filter(o => o.distance > 32.5)
        for (let magical of magicalObjectsOutOfRange) {
            if (!magical.school) {
                continue;
            }
            //console.log("Magical Object out of range...Removing rune effect: ", magical.obj);
            new Sequence("Advanced Spell Effects")
                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .setMustache(magical)
                .zIndex(0)
                .playIf((magical.obj.document.getFlag("advancedspelleffects", "magicDetected")))
                .play()
            await ASEsocket.executeAsGM("updateObjectFlag", magical.obj.id, "magicDetected", false);
            //console.log("magical object out of range: ", magical.obj, magical.obj.document.getFlag("world", "magicDetected"));
            SequencerEffectManager.endEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
        }
        magicalObjectsInRange = objects.map(o => {
            let distance = canvas.grid.measureDistance(newPos, o);
            //console.log("distance: ", distance);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        }).filter(o => o.distance <= 32.5)

        //console.log("Magical Objects in Range: " , magicalObjects);
        for (let magical of magicalObjectsInRange) {
            if (!magical.school) {
                continue;
            }
            let runeDisplayed = Sequencer.EffectManager.getEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
            //let runeIntros = Sequencer.EffectManager.getEffects({name: `detectMagicRuneIntro`, object: canvas.tokens.get(tokenDocument.id)});
            //console.log("Intros displaying: ", runeIntros);
            //console.log("magical object in range: ", magical.obj,magical.obj.document.getFlag("world", "magicDetected"));
            if (!(magical.obj.document.getFlag("advancedspelleffects", "magicDetected")) && runeDisplayed.length == 0 /*&& runeIntros.length == 0*/) {
                //console.log("Magical Object In range with no flag...Playing rune effect: ", magical.obj);
                await ASEsocket.executeAsGM("updateObjectFlag", magical.obj.id, "magicDetected", true);
                new Sequence("Advanced Spell Effects")
                    .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                    .forUsers(users)
                    .scale(0.25)
                    .delay(magical.delay)
                    .setMustache(magical)
                    .name("detectMagicRuneIntro")
                    .attachTo(magical.obj)
                    .waitUntilFinished(-800)
                    .zIndex(0)
                    .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                    .name(`${magical.obj.document.id}-magicRune`)
                    .delay(magical.delay)
                    .forUsers(users)
                    .scale(0.25)
                    .attachTo(magical.obj)
                    .persist(true)
                    .setMustache(magical)
                    .waitUntilFinished(-750)
                    .zIndex(1)
                    .fadeOut(750, { ease: "easeInQuint" })
                    .play()
            }
        }
    });
    Hooks.on("updateCombat", async function (combat) {
        let currentCombatantId = combat.current.tokenId;
        let caster = canvas.tokens.get(currentCombatantId);
        if (!caster.actor.isOwner) return;
        let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == currentCombatantId);
        //console.log("update hook fired...", stormCloudTiles);
        if (stormCloudTiles.length > 0 && !game.user.isGM) {
            console.log("Detected Storm Cloud! Prompting for Bolt...");
            await game.AdvancedSpellEffects.callBolt(stormCloudTiles[0]);
        }
    });

    if (!game.user.isGM) return;

    Hooks.on("updateTile", async function (tileD) {
        ASEsocket.executeAsGM("moveDarknessWalls", tileD.id);
        if (tileD.getFlag("advancedspelleffects", "fogCloudWallNum")) {
            let wallNum = tileD.getFlag("advancedspelleffects", "fogCloudWallNum");
            ASEsocket.executeAsGM("moveFogCloudWalls", tileD.id, wallNum);
        }

    });
    Hooks.on("deleteTile", async function deleteAttachedWalls(tileD) {
        //console.log("Ready hook deletion!");
        if (!game.user.isGM) {
            return;
        }
        async function deleteDarknessTile() {
            let walls = [];
            let wallDocuments = [];
            walls = await Tagger.getByTag([`DarknessWall-${tileD.id}`]);
            walls.forEach((wall) => {
                wallDocuments.push(wall.document.id);
            });
            if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
                await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
            }
        }
        async function deleteFogCloudTile() {
            let walls = [];
            let wallDocuments = [];
            walls = await Tagger.getByTag([`FogCloudWall-${tileD.id}`]);
            //console.log("Tagged Fog Cloud walls: ", walls);
            walls.forEach((wall) => {
                wallDocuments.push(wall.document.id);
            });
            //console.log(wallDocuments);
            //console.log("Embedded document test...", canvas.scene.getEmbeddedDocument("Wall",wallDocuments[0]));
            if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
                await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
            }
        }

        deleteDarknessTile();
        deleteFogCloudTile();
    });
});

Hooks.once('init', async function () {
    // Helper Function for Call Lightning
    async function callBolt(stormCloudTile) {
        let confirmData = {
            buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
            title: "Call forth Lightning Bolt?"
        };
        let confirm = await warpgate.buttonDialog(confirmData, 'row');
        if (confirm) {
            let template = await warpgate.crosshairs.show(3, "icons/magic/lightning/bolt-strike-blue.webp", "Lightning Bolt");
            let casterID = stormCloudTile.getFlag("advancedspelleffects", "stormCloudTile");
            //console.log("Call Lightning caster id: ", casterID);
            let caster = canvas.tokens.get(casterID);

            //NEW DISTANCE MEASUREMENTS
            const ray = new Ray({ x: caster.data.x + (canvas.grid.size / 2), y: caster.data.y + (canvas.grid.size / 2) }, template);
            const segments = [{ ray }];
            let dist = canvas.grid.measureDistances(segments, { gridSpaces: true })[0]
            console.log(dist);
            //


            let boltLength = canvas.grid.measureDistance({ x: caster.data.x + (canvas.grid.size / 2), y: caster.data.y + (canvas.grid.size / 2) }, template);
            //console.log("Bolt Length: ", boltLength);
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

            playEffect(template, stormCloudTile, boltStyle);

            let tokens = canvas.tokens.placeables.map(t => {
                let distance = canvas.grid.measureDistance({ x: template.x, y: template.y }, { x: t.data.x + (canvas.grid.size / 2), y: t.data.y + (canvas.grid.size / 2) });
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
            if(stormCloudTile.getFlag("advancedspelleffects","stormDamage")){
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
                new MidiQOL.DamageOnlyWorkflow(casterActor, caster, fullDamageRoll.total, "lightning", failedSaves, fullDamageRoll, { flavor: `Lightning Bolt Full Damage - Damage Roll (${spellLevel}d10 Lightning)`, itemCardId: "new", itemData: itemData });
            }
            if (passedSaves.length > 0) {
                new MidiQOL.DamageOnlyWorkflow(casterActor, caster, halfdamageroll.total, "lightning", passedSaves, halfdamageroll, { flavor: `Lightning Bolt Half Damage - Damage Roll (${spellLevel}d10 Lightning)`, itemCardId: "new", itemData: itemData });
            }
        }

        async function playEffect(template, cloud, boltStyle) {
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
            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            async function placeAsTile(template, effectFilePath) {
                //console.log("Template Data: ", template);
                let templateData = template;
                let tileWidth;
                let tileHeight;
                let tileX;
                let tileY;

                tileWidth = templateData.width * (canvas.grid.size);
                tileHeight = templateData.width * (canvas.grid.size);
                tileX = templateData.x - (tileWidth / 2);
                tileY = templateData.y - (tileHeight / 2);
                data = {
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
                }
                let createdTiles = await ASEsocket.executeAsGM("placeTiles", [data]);
            }
            let cloudCenter = { x: cloud.data.x + (cloud.data.width / 2), y: cloud.data.y + (cloud.data.width / 2) };
            let strikeRay = new Ray(template, cloudCenter);
            let strikeAngle = strikeRay.angle * (180 / Math.PI)
            let strikeRotation = (-strikeAngle) - 90;
            let groundCrackVersion = getRandomInt(1, 3);
            let groundCrackAnim = `jb2a.impact.ground_crack.blue.0${groundCrackVersion}`;
            let groundCrackImg = `jb2a.impact.ground_crack.still_frame.0${groundCrackVersion}`;
            let boltSeq = new Sequence("Advanced Spell Effects")
                .effect()
                .file(boltEffect)
                .JB2A()
                .atLocation(cloud)
                .reachTowards(template)
                .waitUntilFinished(-1500)
                .playIf(boltStyle == "chain")
                .effect()
                .file(boltEffect)
                .atLocation({ x: template.x, y: template.y })
                .playIf(boltStyle == "strike")
                .rotate(strikeRotation)
                .randomizeMirrorX()
                .scale(2)
                .effect()
                .file(groundCrackAnim)
                .atLocation(template)
                .belowTokens()
                .scale(0.5)
                .waitUntilFinished(-3000)
                .thenDo(async () => {
                    placeAsTile(template, Sequencer.Database.getEntry(groundCrackImg).file);
                })
            await boltSeq.play();
        }


    }
    //Effect functions to be called from a macro in the "OnUseMacro" field of MIDI-QOL
    //Each function is excuted via socketlib to ensure proper permissions for the effect
    async function removeTiles(tileIds) {
        ASEsocket.executeAsGM("deleteTiles", tileIds);
    }

    async function updateFlag(ObjectId, flag, value) {
        await ASEsocket.executeAsGM("updateObjectFlag", ObjectId, flag, value);
    }

    //MIDI/ITEM MACRO VERSIONS
    async function darkness(options) {
        let itemId;
        let tokenId;
        let template;
        switch (options.version) {
            case "MIDI":
                let error = false;
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }
                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }
                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }
                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }
                if (!game.modules.get("tagger")?.active) {
                    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
                    error = `You need to have TTagger${installed} to run this macro!`;
                }
                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("warpgate")?.active) {
                    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }
                // code block
                let rollData = options.args[0];
                itemId = rollData.id;
                tokenId = rollData.tokenId;
                template = await warpgate.crosshairs.show(6, rollData.item.img, "Darkness");
                //console.log(rollData);
                ASEsocket.executeAsGM("registeredDarknessMIDI", template, itemId, tokenId);
                break;
            case "ItemMacro":
                let caster = await canvas.tokens.get(options.tokenId);
                const actor = caster.actor;
                let item = await actor.items.get(options.itemId);
                template = await warpgate.crosshairs.show(6, item.img, "Darkness");
                ASEsocket.executeAsGM("registeredDarknessItemMacro", template, options.itemId, options.tokenId);
                break;
            default:
                // code block
                return;
        }
    }

    //MIDI/ITEM MACRO VERSIONS
    async function detectMagic(options) {
        let item;
        let actor;
        let caster;
        let users = [];
        let magicalObjects = [];
        let sequence;
        let error;
        let waveColor = options.waveColor || 'blue';
        let auraColor = options.auraColor || 'blue';
        switch (options.version) {
            case "MIDI":
                let args = options.args;
                //console.log("ARGS: ", args);
                error = false;
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }

                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }

                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }

                if (!game.modules.get("midi-qol")?.active) {
                    let installed = game.modules.get("midi-qol") && !game.modules.get("midi-qol").active ? "enabled" : "installed";
                    error = `You need to have MidiQOL ${installed} to run this macro!`;
                }

                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }

                if (!game.modules.get("tagger")?.active) {
                    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
                    error = `You need to have TTagger${installed} to run this macro!`;
                }

                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }
                actor = game.actors.get(args[0].actor._id);
                //console.log("Actor: ", actorD);

                for (const user in actor.data.permission) {
                    if (user == "default") continue;
                    users.push(user);
                }
                //console.log("Visible to users: ", users);
                caster = canvas.tokens.get(args[0].tokenId);
                item = actor.items.getName(args[0].item.name);
                //console.log(itemD);
                if (game.modules.get("tagger")?.active) {

                    let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
                    let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

                    let objects = await Tagger.getByTag("magical", { ignore: [caster] });
                    magicalObjects = objects.map(o => {
                        let distance = canvas.grid.measureDistance(caster, o);
                        return {
                            delay: distance * 55,
                            distance: distance,
                            obj: o,
                            school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                            color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
                        }
                    })
                        .filter(o => o.distance <= 32.5)
                }
                //console.log("Detected Magical Objects: ", magicalObjects);
                sequence = new Sequence("Advanced Spell Effects")
                    .effect(`jb2a.detect_magic.circle.${waveColor}`)
                    .attachTo(caster)
                    .JB2A()
                    .belowTiles()
                    .scale(2.33333)
                    .effect()
                    .file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`)
                    .attachTo(caster)
                    .scale(0.2)
                    .belowTokens()
                    .waitUntilFinished(-1000)
                    .fadeOut(1000, { ease: "easeInQuint" })
                    .effect()
                    .file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`)
                    .attachTo(caster)
                    .persist()
                    .extraEndDuration(750)
                    .fadeOut(750, { ease: "easeInQuint" })
                    .scale(0.2)
                    .loopProperty("sprite", "rotation", { duration: 20000, from: 0, to: 360 })
                    .name(`${caster.id}-detectMagicAura`)
                    .belowTokens()
                    .thenDo(async () => {
                        //console.log("Actor: ", actorD);
                        let concentrationActiveEffect = actor.effects.filter((effect) => effect.data.label === "Concentrating")[0];
                        //console.log("Detect Magic Concentration effect: ", concentrationActiveEffect);
                        await concentrationActiveEffect.update({
                            changes: [{
                                key: "macro.itemMacro",
                                mode: 0,
                                value: 0
                            }]
                        });
                        let newItemMacro;
                        //console.log("Current ItemMacro: ", item.getFlag("itemacro", "macro.data.command"));
                        if (!item.getFlag("itemacro", "macro.data.command").includes("/*ASE_REPLACED*/")) {
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
                                .file("jb2a.magic_signs.circle.02.divination.outro.` + auraColor + `")
                                .scale(0.2)
                                .belowTokens()
                                .attachTo(caster)
                            .play()
                        }
        }
        else if(args[0] != "on" && args[0] != "off"){
            let options = {version: "MIDI", args: args, waveColor: "`+ waveColor + `", auraColor: "` + auraColor + `"};
            game.AdvancedSpellEffects.detectMagic(options);
        }`;
                            //console.log(newItemMacro);
                            await item.setFlag("itemacro", "macro.data.command", newItemMacro)
                        }
                    })

                for (let magical of magicalObjects) {
                    if (!magical.school) {
                        continue;
                    }
                    await ASEsocket.executeAsGM("updateObjectFlag", magical.obj.id, "magicDetected", true);
                    console.log("Playing effect for: ", magical.obj);
                    //console.log("Magical OBJ: ", magical.obj)
                    new Sequence("Advanced Spell Effects")
                        .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                        .forUsers(users)
                        .atLocation(magical.obj)
                        .scale(0.25)
                        .delay(magical.delay)
                        .setMustache(magical)
                        .waitUntilFinished(-1200)
                        .zIndex(0)
                        .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                        .name(`${magical.obj.document.id}-magicRune`)
                        .delay(magical.delay)
                        .forUsers(users)
                        .scale(0.25)
                        .attachTo(magical.obj)
                        .persist(true)
                        .setMustache(magical)
                        .waitUntilFinished(-750)
                        .fadeOut(750, { ease: "easeInQuint" })
                        .zIndex(1)
                        .play()
                }
                sequence.play();
                break;
            case "ItemMacro":
                caster = await canvas.tokens.get(options.tokenId);
                actor = caster.actor;
                item = await actor.items.get(options.itemId);

                //console.log("ARGS: ", args);
                error = false;

                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }

                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }
                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }

                if (!game.modules.get("tagger")?.active) {
                    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
                    error = `You need to have TTagger${installed} to run this macro!`;
                }

                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }

                //const actorD = game.actors.get(args[0].actor._id);
                //console.log("Actor: ", actorD);
                for (const user in actor.data.permission) {
                    if (user == "default") continue;
                    users.push(user);
                }
                //console.log("Visible to users: ", users);
                //const tokenD = canvas.tokens.get(args[0].tokenId);
                //const item = actorD.items.getName(args[0].item.name);
                //console.log(itemD);
                if (error) {
                    ui.notifications.error(error);
                    return;
                }


                if (game.modules.get("tagger")?.active) {

                    let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
                    let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

                    let objects = await Tagger.getByTag("magical", { ignore: [caster] });
                    magicalObjects = objects.map(o => {
                        let distance = canvas.grid.measureDistance(caster, o);
                        return {
                            delay: distance * 55,
                            distance: distance,
                            obj: o,
                            school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                            color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
                        }
                    })
                        .filter(o => o.distance <= 32.5)
                }
                //console.log("Detected Magical Objects: ", magicalObjects);
                sequence = new Sequence("Advanced Spell Effects")
                    .effect(`jb2a.detect_magic.circle.${waveColor}`)
                    .JB2A()
                    .belowTiles()
                    .attachTo(caster)
                    .scale(2.33333)
                    .effect()
                    .file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`)
                    .attachTo(caster)
                    .scale(0.2)
                    .belowTokens()
                    .waitUntilFinished(-1000)
                    .fadeOut(1000, { ease: "easeInQuint" })
                    .effect()
                    .file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`)
                    .attachTo(caster)
                    .persist()
                    .extraEndDuration(750)
                    .fadeOut(750, { ease: "easeInQuint" })
                    .scale(0.2)
                    .loopProperty("sprite", "rotation", { duration: 20000, from: 0, to: 360 })
                    .name(`${caster.id}-detectMagicAura`)
                    .belowTokens()
                    .thenDo(async () => {
                        await addConcentration();
                        let newItemMacro;
                        //console.log("Current ItemMacro: ", item.getFlag("itemacro", "macro.data.command"));
                        if (!item.getFlag("itemacro", "macro.data.command").includes("/*ASE_REPLACED*/")) {
                            //console.log("Replacing current item macro...");
                            newItemMacro = `/*ASE_REPLACED*/if(args[0] === "off"){
let objects = await Tagger.getByTag("magical", { ignore: [token] });
let users = [];
for (const user in game.actors.get(token.data.actorId).data.permission) {
    if (user == "default") continue;
    users.push(user);
}
let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
let magicalObjects = [];

magicalObjects = objects.map(o => {
                    let distance = canvas.grid.measureDistance(token, o);
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
                    Sequencer.EffectManager.endEffects({name: ` + "`${args[1].tokenId}-detectMagicAura`" + `, object: token});
                    new Sequence("Advanced Spell Effects")
                    .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                    .forUsers(users)
                    .atLocation(magical.obj)
                    .scale(0.25)
                    .setMustache(magical)
                    .zIndex(0)
                    .effect()
                    .file("jb2a.magic_signs.circle.02.divination.outro.` + auraColor + `")
                    .scale(0.2)
                    .belowTokens()
                    .attachTo(caster)
                    .play()
                }
}
else if(args[0] != "on" && args[0] != "off"){
    let options = {version: "ItemMacro", itemId: item.id, tokenId: args[1].tokenId, waveColor: "`+ waveColor + `", auraColor: "` + auraColor + `"};
    game.AdvancedSpellEffects.detectMagic(options);
}`;
                            //console.log(newItemMacro);
                            await item.setFlag("itemacro", "macro.data.command", newItemMacro)
                        }
                    })

                for (let magical of magicalObjects) {
                    if (!magical.school) {
                        continue;
                    }
                    await ASEsocket.executeAsGM("updateObjectFlag", magical.obj.id, "magicDetected", true);

                    //console.log("Magical OBJ: ", magical.obj)
                    new Sequence("Advanced Spell Effects")
                        .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                        .forUsers(users)
                        .atLocation(magical.obj)
                        .scale(0.25)
                        .delay(magical.delay)
                        .setMustache(magical)
                        .waitUntilFinished(-1200)
                        .zIndex(0)
                        .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                        .name(`${magical.obj.document.id}-magicRune`)
                        .delay(magical.delay)
                        .forUsers(users)
                        .scale(0.25)
                        .attachTo(magical.obj)
                        .persist(true)
                        .setMustache(magical)
                        .waitUntilFinished(-750)
                        .fadeOut(750, { ease: "easeInQuint" })
                        .zIndex(1)
                        .play()

                }
                sequence.play();

                function getSelfTarget(actor) {
                    if (actor.token)
                        return actor.token;
                    const speaker = ChatMessage.getSpeaker({ actor });
                    if (speaker.token)
                        return canvas.tokens?.get(speaker.token);
                    return new CONFIG.Token.documentClass(actor.getTokenData(), { actor });
                }
                async function addConcentration() {
                    //console.log("item in addConcentration: ", item);
                    let selfTarget = item.actor.token ? item.actor.token.object : getSelfTarget(item.actor);
                    if (!selfTarget)
                        return;

                    let concentrationName = "Concentration";
                    const inCombat = (game.combat?.turns.some(combatant => combatant.token?.id === selfTarget.id));
                    const effectData = {
                        changes: [{
                            key: "macro.itemMacro",
                            mode: 0,
                            value: 0
                        }],
                        origin: item.uuid,
                        disabled: false,
                        icon: "modules/advancedspelleffects/icons/concentrate.png",
                        label: concentrationName,
                        duration: {},
                        flags: { "advancedspelleffects": { isConcentration: item?.uuid } }
                    };

                    const convertedDuration = globalThis.DAE.convertDuration(item.data.data.duration, inCombat);
                    if (convertedDuration?.type === "seconds") {
                        effectData.duration = { seconds: convertedDuration.seconds, startTime: game.time.worldTime };
                    }
                    else if (convertedDuration?.type === "turns") {
                        effectData.duration = {
                            rounds: convertedDuration.rounds,
                            turns: convertedDuration.turns,
                            startRound: game.combat?.round,
                            startTurn: game.combat?.turn
                        };
                    }


                    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                    //console.log("Done creating and adding effect to actor...");

                    return true;
                    // return await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

                }
                break;
            default:
                // code block
                return;
        }
    }

    //MIDI
    async function fogCloud(options) {
        //console.log("Spell Options: ", options);
        switch (options.version) {
            case "MIDI":
                //console.log("Roll Data: ", rollData);
                let error = false;
                const rollData = options.args;
                const actor = rollData[0].actor;
                const item = actor.items.getName(rollData[0].item.name);
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }
                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }
                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }
                if (!game.modules.get("midi-qol")?.active) {
                    let installed = game.modules.get("midi-qol") && !game.modules.get("midi-qol").active ? "enabled" : "installed";
                    error = `You need to have MidiQOL ${installed} to run this macro!`;
                }
                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }
                if (!game.modules.get("tagger")?.active) {
                    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
                    error = `You need to have TTagger${installed} to run this macro!`;
                }
                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("warpgate")?.active) {
                    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }

                let template = await warpgate.crosshairs.show(8 * (rollData[0].spellLevel), item.img, "Fog Cloud");

                await placeCloudAsTile(template, rollData[0].tokenId);
                await changeSelfItemMacro();


                async function changeSelfItemMacro() {
                    let concentrationActiveEffect = actor.effects.filter((effect) => effect.data.label === "Concentrating")[0];
                    //console.log("Detect Magic Concentration effect: ", concentrationActiveEffect);
                    await concentrationActiveEffect.update({
                        changes: [{
                            key: "macro.itemMacro",
                            mode: 0,
                            value: 0
                        }]
                    });
                    let newItemMacro;
                    if (!item.getFlag("itemacro", "macro.data.command")?.includes("/*ASE_REPLACED*/")) {
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
        let options = {version: "MIDI", args: args, numberWalls: 12};
        game.AdvancedSpellEffects.fogCloud(options);
    }`;
                        //console.log(newItemMacro);
                        await item.setFlag("itemacro", "macro.data.command", newItemMacro)
                    }
                }
                async function placeCloudAsTile(template, casterId) {
                    let templateData = template;
                    //console.log(templateData);
                    //console.log("Template Data: ", templateData);
                    let tileWidth;
                    let tileHeight;
                    let tileX;
                    let tileY;
                    let placedX = templateData.x;
                    let placedY = templateData.y;
                    let wallPoints = [];
                    let walls = [];
                    const spellLevel = rollData[0].spellLevel;
                    let wall_number = options.numberWalls * spellLevel;
                    let wall_angles = 2 * Math.PI / wall_number
                    //console.log("Spell Cast at level: ", spellLevel);
                    tileWidth = (templateData.width * canvas.grid.size);
                    tileHeight = (templateData.width * canvas.grid.size);

                    //console.log("Tile Width: ", tileWidth);
                    //console.log("Tile Height: ", tileHeight);

                    let outerCircleRadius = tileWidth / 2.2;
                    tileX = templateData.x - (tileWidth / 2);
                    tileY = templateData.y - (tileHeight / 2);
                    //console.log("Tile Width, Tile Height: ", tileWidth, tileHeight);
                    // console.log("Tile X, Tile Y: ", tileX, tileY);
                    data = {
                        alpha: 1,
                        width: tileWidth,
                        height: tileHeight,
                        img: "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
                        overhead: true,
                        occlusion: {
                            alpha: 0,
                            mode: 3,
                        },
                        video: {
                            autoplay: true,
                            loop: true,
                            volume: 0,
                        },
                        x: tileX,
                        y: tileY,
                        z: 100,
                        flags: { tagger: { tags: [`FogCloudTile-${casterId}`] }, advancedspelleffects: { fogCloudWallNum: wall_number } }
                    }
                    let createdTiles = await ASEsocket.executeAsGM("placeTiles", [data]);
                    let tileD = createdTiles[0];

                    //console.log("Created tile..:", tileD);
                    //console.log("Amount of walls to place per spell level: ", options.numberWalls);


                    for (let i = 0; i < wall_number; i++) {
                        let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                        let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                        wallPoints.push({ x: x, y: y });
                    }
                    //console.log("Walls Coordinates: ",wallPoints);
                    for (let i = 0; i < wallPoints.length; i++) {
                        if (i < wallPoints.length - 1) {
                            walls.push({
                                c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                                flags: { tagger: { tags: [`FogCloudWall-${tileD._id}`] } },
                                move: 0
                            })
                        }
                        else {
                            walls.push({
                                c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                                flags: { tagger: { tags: [`FogCloudWall-${tileD._id}`] } },
                                move: 0
                            })
                        }
                    }
                    //console.log("Wall Data: ", walls);
                    await ASEsocket.executeAsGM("placeWalls", walls);
                    /*Hooks.on("updateTile", async function moveAttachedWalls(tileD, diff) {
            
                       
                    });*/

                }

                break;
            case "ItemMacro":
                break;
            default:
                return;
        }
    }

    //MIDI
    async function tollTheDead(rollData) {
        setTimeout(() => { ASEsocket.executeAsGM("registeredTollTheDead", rollData[0]); }, 100);
    }

    async function steelWindStrike(options) {
        let itemId;
        let tokenId;
        switch (options.version) {
            case "MIDI":
                let error = false;
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }
                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }
                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }
                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("warpgate")?.active) {
                    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }
                console.log(options.args[0]);
                options.weapon = options.args[0].item.flags.advancedspelleffects?.effectOptions?.weapon ?? 'sword';
                options.color = options.args[0].item.flags.advancedspelleffects?.effectOptions?.weaponColor ?? 'blue';
                //console.log("rollData", rollData);
                function easeOutElasticCustom(x) {
                    const c4 = (2 * Math.PI) / 10;
                    return x === 0
                        ? 0
                        : x === 1
                            ? 1
                            : Math.pow(2, -12 * x) * Math.sin((x * 12 - 0.75) * c4) + 1;
                }
                Sequencer.registerEase("easeOutElasticCustom", easeOutElasticCustom);
                let rollData = options.args[0];
                let caster = canvas.tokens.get(rollData.tokenId);
                //console.log("Caster roll data: ", caster.actor.getRollData());
                let targets = Array.from(game.user.targets);
                let rollDataForDisplay = [];
                //let spellCastingAbility = rollData.actor.data.attributes.spellcasting;
                let dagger = "";
                if (options.weapon == "dagger") dagger = ".02"

                let swordAnim;
                let gustAnim = "jb2a.gust_of_wind.veryfast";
                //let allFiles = [gustAnim, swordAnim];
                //console.log('Files about to be preloaded...',allFiles);
                //await SequencerPreloader.preloadForClients(allFiles, true);

                let validSwingTypes = [0, 2, 4];


                let animStartTimeMap = {
                    0: 750,
                    1: 500,
                    2: 850,
                    3: 850,
                    4: 1000,
                    5: 500
                };
                let animEndTimeMap = {
                    0: 1250,
                    1: 1250,
                    2: 2000,
                    3: 1250,
                    4: 1700,
                    5: 1250
                };
                let weaponsPathMap = {
                    "sword": "melee.01",
                    "mace": "melee",
                    "greataxe": "melee",
                    "greatsword": "melee",
                    "handaxe": "melee",
                    "spear": "melee.01"
                };



                await caster.document.setFlag("autorotate", "enabled", false);
                //console.log ("Auto Rotate Flag status: ",caster.document.getFlag("autorotate", "enabled"));
                await steelWindStrike(caster, targets);

                async function evaluateAttack(target) {
                    //console.log("Evalute attack target: ", target);
                    let attackRoll = new Roll(`1d20 + @mod + @prof`, caster.actor.getRollData()).roll();
                    // game.dice3d?.showForRoll(attackRoll);
                    if (attackRoll.total < target.actor.data.data.attributes.ac.value) {
                        onMiss(target, attackRoll);
                    }
                    else {
                        onHit(target, attackRoll);
                    }
                }

                async function onHit(target, attackRoll) {
                    //console.log('Attack hit!');
                    //console.log("Attack roll: ", attackRoll);
                    let currentRoll = new Roll('6d10', caster.actor.getRollData()).roll();
                    //console.log("Current damage dice roll total: ", currentRoll.total);
                    //game.dice3d?.showForRoll(currentRoll);
                    let damageData = new MidiQOL.DamageOnlyWorkflow(rollData.actor, rollData.tokenId, currentRoll.total, "force", [target], currentRoll, { flavor: 'Steel Wind Strike - Damage Roll (6d10 force)', itemCardId: rollData.itemCardId });
                    //console.log("damage data: ", damageData);
                    rollDataForDisplay.push({
                        "target": target.name,
                        "attackroll": attackRoll.total,
                        "hit": true,
                        "damageroll": currentRoll.total
                    })
                }
                async function onMiss(target, attackRoll) {
                    //console.log('Missed attack...');
                    //console.log("Attack roll: ", attackRoll);
                    rollDataForDisplay.push({
                        "target": target.name,
                        "attackroll": attackRoll.total,
                        "hit": false,
                        "damageroll": 0
                    })
                    //let currentRoll = new Roll(`${damageDie}`, caster.actor.getRollData()).roll({ async: false });
                    //game.dice3d?.showForRoll(currentRoll);
                    //new MidiQOL.DamageOnlyWorkflow(rollData.actor, rollData.tokenId, currentRoll.total, "bludgeoning", [target], currentRoll, { flavor: `Flurry of Blows - Damage Roll (${damageDie} Bludgeoning)`, itemCardId: rollData.itemCardId });
                }

                async function finalTeleport(caster, location) {
                    console.log("template: ", location);
                    let startLocation = { x: caster.x, y: caster.y };
                    //let adjustedLocation = { x: location.x - (canvas.grid.size / 2), y: location.y - (canvas.grid.size / 2) }
                    let distance = Math.sqrt(Math.pow((location.x - caster.x), 2) + Math.pow((location.y - caster.y), 2));

                    let steelWindSequence = new Sequence("Advanced Spell Effects")
                        .animation()
                        .on(caster)
                        .rotateTowards(location)
                        .animation()
                        .on(caster)
                        .snapToSquare()
                        .moveTowards(location, { ease: "easeOutElasticCustom" })
                        .moveSpeed(distance / 60)
                        .duration(800)
                        .waitUntilFinished(-750)
                        .effect()
                        .atLocation(startLocation)
                        .JB2A()
                        .file(gustAnim)
                        .reachTowards(location)
                        .opacity(0.8)
                        .fadeOut(250)
                        .belowTokens()
                        .waitUntilFinished()
                        .thenDo(async () => {
                            await caster.TMFXdeleteFilters("SWSBlur");
                            await caster.document.setFlag("autorotate", "enabled", true);
                        })
                    await steelWindSequence.play();
                }
                function getFreePosition(origin) {
                    const center = canvas.grid.getCenter(origin.x, origin.y)
                    origin = { x: center[0], y: center[1] };
                    const positions = generatePositions(origin);
                    //console.log("Generated Positions: ",positions);
                    for (let position of positions) {
                        //console.log(`Checking if position {${position.x}, ${position.y}} is free...`);
                        if (isFree(position)) {
                            return position;
                        }
                    }

                }
                function generatePositions(origin) {
                    let positions = [canvas.grid.getSnappedPosition(origin.x - 1, origin.y - 1)];
                    for (let r = canvas.scene.dimensions.size; r < canvas.scene.dimensions.size * 2; r += canvas.scene.dimensions.size) {

                        for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / (4 * r / canvas.scene.dimensions.size)) {
                            const newPos = canvas.grid.getTopLeft(origin.x + r * Math.cos(theta), origin.y + r * Math.sin(theta))
                            positions.push({ x: newPos[0], y: newPos[1] });
                        }
                    }
                    return positions;
                }
                function isFree(position) {
                    for (let token of canvas.tokens.placeables) {
                        const hitBox = new PIXI.Rectangle(token.x, token.y, token.w, token.h);
                        //console.log(`Checking hitbox for ${token.name}`, hitBox);
                        if (hitBox.contains(position.x, position.y)) {
                            //console.log("Not free...Checking next position");
                            return false;
                        }
                    }
                    //console.log("Free!");
                    return true;
                }
                function getRandomInt(min, max) {
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                async function steelWindStrike(caster, targets) {
                    let currentX;
                    let targetX;
                    let currentY;
                    let targetY;
                    let distance;
                    let params =
                        [{
                            filterType: "blur",
                            filterId: "SWSBlur",
                            padding: 10,
                            quality: 4.0,
                            blur: 0,
                            blurX: 0,
                            blurY: 0,
                            animated:
                            {
                                blurX:
                                {
                                    active: true,
                                    animType: "syncCosOscillation",
                                    loopDuration: 500,
                                    val1: 0,
                                    val2: 8
                                },
                                blurY:
                                {
                                    active: true,
                                    animType: "syncCosOscillation",
                                    loopDuration: 250,
                                    val1: 0,
                                    val2: 8
                                }
                            }
                        }];
                    let swingType;
                    let swingStartDelay = -600;
                    await caster.TMFXaddUpdateFilters(params);
                    //console.log(targets);
                    for (let i = 0; i < targets.length; i++) {
                        if (i == targets.length - 1) {
                            swingType = 5;
                            swingStartDelay = -250;
                        }
                        else {
                            swingType = validSwingTypes[getRandomInt(0, 2)];
                        }
                        swordAnim = `jb2a.${options.weapon}.${weaponsPathMap[options.weapon]}.${options.color}.${swingType}`;
                        //console.log(targets[i]);
                        let target = targets[i];
                        evaluateAttack(target);
                        //debugger;
                        const openPosition = getFreePosition({ x: target.x, y: target.y });
                        let rotateAngle = new Ray(openPosition, target).angle * (180 / Math.PI);
                        currentX = caster.x;
                        targetX = openPosition.x;
                        currentY = caster.y;
                        targetY = openPosition.y;
                        distance = Math.sqrt(Math.pow((targetX - currentX), 2) + Math.pow((targetY - currentY), 2));
                        //console.log(distance);
                        let steelWindSequence = new Sequence("Advanced Spell Effects")
                            .effect()
                            .atLocation({x: caster.x + (canvas.grid.size / 2), y: caster.y + (canvas.grid.size / 2)})
                            .JB2A()
                            .file(gustAnim)
                            .reachTowards({ x: openPosition.x + (canvas.grid.size / 2), y: openPosition.y + (canvas.grid.size / 2) })
                            .opacity(0.8)
                            .fadeOut(250)
                            .belowTokens()
                            .animation()
                            .on(caster)
                            .rotate(rotateAngle - 90)
                            .animation()
                            .on(caster)
                            .moveTowards(openPosition, { ease: "easeOutElasticCustom" })
                            .moveSpeed(distance / 60)
                            .duration(800)
                            .waitUntilFinished(swingStartDelay)
                            .effect()
                            .atLocation(caster, { cacheLocation: false })
                            .JB2A()
                            .file(swordAnim)
                            .startTime(animStartTimeMap[swingType])
                            .endTime(animEndTimeMap[swingType])
                            .reachTowards(target)
                            .fadeOut(250, { ease: "easeOutQuint" })
                            .waitUntilFinished()
                        await steelWindSequence.play();
                    }
                    let contentHTML = `<form class="editable flexcol" autocomplete="off">`;
                    rollDataForDisplay.forEach((data) => {
                        let name = data.target;
                        let attackTotal = data.attackroll;
                        let damageTotal = data.damageroll;
                        let hitStatus = data.hit;
                        contentHTML = contentHTML + `<section style="border: 1px solid black">
                                                <li class="flexrow">
                                                    <h4>${name}</h4>
                                                    <div>
                                                        <span>Attack Total: ${attackTotal}</span>
                                                    </div>
                                                    <div>
                                                        <span>${hitStatus ? 'Hit!' : 'Missed!'}</span>
                                                    </div>
                                                    <div> 
                                                        <span>Damage Total: ${damageTotal}</span>
                                                    </div>
                                                </li>
                                            </section> 
                                            <br>`;
                    });
                    contentHTML = contentHTML + `</form>`
                    async function chooseFinalLocation() {
                        let template = await warpgate.crosshairs.show(1, rollData.item.img, "End At");
                        await finalTeleport(caster, template);

                    }
                    let done = await (new Promise((resolve) => {
                        new Dialog({
                            title: "Steel Wind Strike breakdown",
                            content: contentHTML,
                            buttons:
                            {
                                one: {
                                    label: 'Okay',
                                    callback: (html) => {
                                        resolve(true);
                                    }
                                }
                            },
                        },
                            { width: '500' },
                        ).render(true)
                    }));

                    if (done) {
                        await chooseFinalLocation();
                    }

                }
                break;
            case "ItemMacro":
                break;
            default:
                return;
        }
    }

    async function thunderStep(options) {
        let error;
        switch (options.version) {
            case "MIDI":
                error = false;
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }

                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }

                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }

                if (!game.modules.get("midi-qol")?.active) {
                    let installed = game.modules.get("midi-qol") && !game.modules.get("midi-qol").active ? "enabled" : "installed";
                    error = `You need to have MidiQOL ${installed} to run this macro!`;
                }

                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }

                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("warpgate")?.active) {
                    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }
                let midiData = options.args[0];
                //console.log("Midi Data: ", midiData);
                let caster = canvas.tokens.get(midiData.tokenId);
                let target = canvas.tokens.get(midiData.targets[0]?.id);
                let casterActor = game.actors.get(caster.data.actorId);
                //console.log("Caster: ", caster);
                let saveDC = casterActor.data.data.attributes.spelldc;
                //console.log("Save DC: ", saveDC);
                let tokens = canvas.tokens.placeables.filter((token) => token.id != caster.id).map(t => {
                    let distance = canvas.grid.measureDistance(caster, t);
                    return { token: t, distance: distance }
                }).filter(t => t.distance <= 12.5);
                if (target) {
                    tokens = tokens.filter((token) => token.token.id != target.id);
                }
                //console.log("Tokens in range: ", tokens);
                let failedSaves = [];
                let passedSaves = [];

                for (const currentTarget of tokens) {
                    let currentTargetActor = currentTarget.token.actor;
                    let saveResult = await currentTargetActor.rollAbilitySave("con", { fastForward: true, flavor: "Thunder Step Saving Throw" });;

                    if (saveResult.total < saveDC) {
                        failedSaves.push(currentTarget.token);
                    }
                    else if (saveResult.total >= saveDC) {
                        passedSaves.push(currentTarget.token);
                    }
                }
                //console.log("Failed Saves - ", failedSaves);
                //console.log("Passed Saves - ", passedSaves);
                let fullDamageRoll = new Roll(`${midiData.spellLevel}d10`).evaluate();
                if (game.modules.get("dice-so-nice")?.active) {
                    game.dice3d?.showForRoll(fullDamageRoll);
                }
                //console.log("Thunder Step Full Damage roll: ", fullDamageRoll);
                let halfdamageroll = new Roll(`${fullDamageRoll.total}/2`).evaluate({ async: false });
                let casterTeleportLocation = await warpgate.crosshairs.show(1, midiData.item.img, "Thunder Step - Caster");

                const loadImage = src =>
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = src;
                    })
                    ;
                let casterImage;
                let targetImage;
                loadImage(caster.data.img).then(async (image) => {
                    casterImage = image;
                    //console.log(casterImage);
                    const casterImageScale = caster.w / casterImage.width;
                    //console.log("Token Image Scale: ", casterImageScale);

                    //console.log("Target selected: ", target);
                    if (target) {
                        await loadImage(target.data.img).then(async (image) => {
                            //console.log("Target Image Loaded...");
                            targetImage = image;
                            //console.log(targetImage);
                            const targetImageScale = target.w / targetImage.width;
                            //console.log("Target Image Scale: ", targetImageScale);
                            let targetTeleportLocation = await warpgate.crosshairs.show(1, midiData.item.img, "Thunder Step - Tag Along");
                            playTargetTeleportEffect(target, targetImageScale, targetTeleportLocation);
                        });
                    }

                    await playCasterTeleportEffect(caster, casterImageScale, casterTeleportLocation);
                    //console.log("Done teleporting...");

                    if (failedSaves.length > 0) {
                        new MidiQOL.DamageOnlyWorkflow(casterActor, caster, fullDamageRoll.total, "thunder", failedSaves, fullDamageRoll, { flavor: `Thunder Step Full Damage - Damage Roll (${midiData.spellLevel}d10 Thunder)`, itemCardId: "new", itemData: midiData.item });
                    }

                    if (passedSaves.length > 0) {
                        new MidiQOL.DamageOnlyWorkflow(casterActor, caster, halfdamageroll.total, "thunder", passedSaves, halfdamageroll, { flavor: `Thunder Step Half Damage - Damage Roll (${midiData.spellLevel}d10 Thunder)`, itemCardId: "new", itemData: midiData.item });
                    }


                });
                async function playTargetTeleportEffect(target, targetImageScale, teleportLocation) {
                    let sequence = new Sequence("Advanced Spell Effects")
                        .effect()
                        .file("jb2a.eldritch_blast.lightblue.05ft")
                        .atLocation(target)
                        .JB2A()
                        .waitUntilFinished(-1200)
                        .endTime(3300)
                        .playbackRate(1)
                        .scaleOut(0, 250)
                        .belowTokens()
                        .filter("Glow", { color: '0x0000FF', distance: 35, outerStrength: 2, innerStrength: 0.25 })
                        .animation()
                        .on(target)
                        .opacity(0)
                        .effect()
                        .file(target.data.img)
                        .atLocation(target)
                        .scale(targetImageScale)
                        .rotate(-target.data.rotation)
                        .scaleOut(0, 1000, { ease: "easeInOutElastic" })
                        .waitUntilFinished()
                        .animation()
                        .on(target)
                        .teleportTo(teleportLocation)
                        .snapToSquare()
                        .waitUntilFinished()
                        .effect()
                        .file()
                        .file(target.data.img)
                        .atLocation(target)
                        .scale(targetImageScale)
                        .addPostOverride(async (effect, data) => {
                            data.angle = -target.data.rotation;
                            return data;
                        })
                        .scaleIn(0, 1000, { ease: "easeInOutElastic" })
                        .filter("Glow", { color: '0x0000FF', distance: 50, outerStrength: 2, innerStrength: 0 })
                        .fadeOut(250)
                        .waitUntilFinished(-250)
                        .animation()
                        .on(target)
                        .opacity(1)
                    sequence.play();
                }

                async function playCasterTeleportEffect(caster, casterImageScale, teleportLocation) {
                    let sequence = new Sequence("Advanced Spell Effects")
                        .effect()
                        .file("jb2a.eldritch_blast.lightblue.05ft")
                        .atLocation(caster)
                        .JB2A()
                        .waitUntilFinished(-1200)
                        .endTime(3300)
                        .playbackRate(1)
                        .scaleOut(0, 250)
                        .belowTokens()
                        .filter("Glow", { color: '0x0000FF', distance: 35, outerStrength: 2, innerStrength: 0.25 })
                        .animation()
                        .on(caster)
                        .opacity(0)
                        .effect()
                        .file(caster.data.img)
                        .atLocation(caster)
                        .scale(casterImageScale)
                        .rotate(-caster.data.rotation)
                        .scaleOut(0, 1000, { ease: "easeInOutElastic" })
                        .waitUntilFinished()
                        .effect()
                        .file("jb2a.explosion.04.blue")
                        .atLocation(caster)
                        .filter("Glow", { color: '0x0000FF', distance: 35, outerStrength: 1, innerStrength: 0.25 })
                        .scale(2)
                        .animation()
                        .on(caster)
                        .teleportTo(teleportLocation)
                        .snapToSquare()
                        .waitUntilFinished()
                        .effect()
                        .file()
                        .file(caster.data.img)
                        .addPostOverride(async (effect, data) => {
                            //console.log(data);
                            data.angle = -caster.data.rotation;
                            return data;
                        })
                        .atLocation(caster)
                        .scale(casterImageScale)
                        .scaleIn(0, 1000, { ease: "easeInOutElastic" })
                        .filter("Glow", { color: '0x0000FF', distance: 50, outerStrength: 2, innerStrength: 0 })
                        .fadeOut(250)
                        .waitUntilFinished(-250)
                        .animation()
                        .on(caster)
                        .opacity(1)
                    await sequence.play();
                }

                break;
            case "ItemMacro":
                break;
            default:
                return;
        }
    }

    async function summon(options) {
        switch (options.version) {
            case "MIDI":
                let error = false;
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }
                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }
                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }
                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }
                if (!game.modules.get("tagger")?.active) {
                    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
                    error = `You need to have TTagger${installed} to run this macro!`;
                }
                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("warpgate")?.active) {
                    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }
                let midiData = options.args[0];
                switch (options.type.toLowerCase()) {
                    case "spiritual weapon":
                        const actorD = game.actors.get(midiData.actor._id);
                        const tokenD = canvas.tokens.get(midiData.tokenId);
                        const level = midiData.spellLevel;
                        let summonType = "Spiritual Weapon";
                        const summonerDc = actorD.data.data.attributes.spelldc;
                        const summonerAttack = summonerDc - 8;
                        const summonerMod = getProperty(tokenD.actor, `data.data.abilities.${getProperty(tokenD.actor, 'data.data.attributes.spellcasting')}.mod`);
                        let damageScale = '';
                        function componentToHex(c) {
                            var hex = c.toString(16);
                            return hex.length == 1 ? "0" + hex : hex;
                        }

                        function rgbToHex(r, g, b) {
                            return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
                        }
                        async function myEffectFunction(template, color, update) {
                            console.log("Color: ", color);
                            let glowColor;
                            switch (color) {
                                case 'blue':
                                    glowColor = rgbToHex(173, 216, 230)
                                    break;
                                case 'green':
                                    glowColor = rgbToHex(144, 238, 144)
                                    break;
                                case 'orange':
                                    glowColor = rgbToHex(255, 128, 0)
                                    break;
                                case 'pruple':
                                    glowColor = rgbToHex(153, 0, 153)
                                    break;
                                case 'red':
                                    glowColor = rgbToHex(204, 0, 0)
                                    break;
                                case 'yellow':
                                    glowColor = rgbToHex(255, 255, 0)
                                    break;
                                case 'pink':
                                    glowColor = rgbToHex(255, 102, 255)
                                    break;
                                default:
                                    glowColor = rgbToHex(153, 204, 255)
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
                                .belowTokens()
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

                        function capitalizeFirstLetter(string) {
                            return string.charAt(0).toUpperCase() + string.slice(1);
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
                            typeOptions.push(capitalizeFirstLetter(type));
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
                            colorOptions.push(capitalizeFirstLetter(color));
                        });
                        let attackColors;

                        if (Sequencer.Database.entryExists(`jb2a.${weaponChoice}.melee`)) {
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
                            attackColorOptions.push(capitalizeFirstLetter(attackColor));
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
                        if (weaponChoice != "scythe") {
                            spiritAttackAnim = `jb2a.${weaponChoice}.melee.${attackColorChoice}`;
                        }
                        else {
                            spiritAttackAnim = `jb2a.sword.melee.${attackColorChoice}`;
                        }


                        /*console.log("Weapon: ", weaponChoice);
                        console.log("Type: ", typeChoice);
                        console.log("Spirit Color: ", spiritColorChoice);
                        console.log("Spirit Attack Color: ", attackColorChoice);
                        console.log("Complete Spirit Weapon: ", spiritWeapon);
                        console.log("Complete Spirit Attack: ", spiritAttackAnim);*/

                        //thankfully jb2a has very structured file names
                        let spiritualWeapon = Sequencer.Database.getEntry(spiritWeapon).file;

                        console.log("Spiritual Weapon path: ", spiritualWeapon);
                        if ((level - 3) > 0) {
                            damageScale = `+ ${Math.floor((level - 2) / 2)}d8[upcast]`;
                        }

                        let updates = {
                            token: {
                                'alpha': 0,
                                'name': `${summonType} of ${actorD.name}`,
                                'img': spiritualWeapon,
                                'scale': 1.5
                            },
                            actor: {
                                'name': `${summonType} of ${actorD.name}`,
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
                        break;
                    case "beast":
                        break;
                    default:
                        break;
                }
                break;
            case "IteMMacro":
                break;
            default:
                return;
        }
    }

    async function callLightning(options) {
        let color = options.color?.toLowerCase() ?? "blue";
        let res = options.resolution?.toLowerCase() ?? "low";
        let boltStyle = options.boltStyle?.toLowerCase() ?? 'chain';
        switch (options.version) {
            case "MIDI":
                let error = false;
                if (typeof args !== 'undefined' && args.length === 0) {
                    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
                }
                if (!(game.modules.get("jb2a_patreon"))) {
                    error = `You need to have JB2A's patreon only module installed to run this macro!`;
                }
                if (!game.modules.get("advanced-macros")?.active) {
                    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
                    error = `You need to have Advanced Macros ${installed} to run this macro!`;
                }
                if (!game.modules.get("socketlib")?.active) {
                    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
                    error = `You need to have SocketLib ${installed} to run this macro!`;
                }
                if (!game.modules.get("tagger")?.active) {
                    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
                    error = `You need to have TTagger${installed} to run this macro!`;
                }
                if (!game.modules.get("sequencer")?.active) {
                    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
                    error = `You need to have Sequencer ${installed} to run this macro!`;
                }
                if (!game.modules.get("warpgate")?.active) {
                    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (!game.modules.get("itemacro")?.active) {
                    let installed = game.modules.get("itemacro") && !game.modules.get("itemacro").active ? "enabled" : "installed";
                    error = `You need to have Warpgate ${installed} to run this macro!`;
                }
                if (error) {
                    ui.notifications.error(error);
                    return;
                }
                let midiData = options.args[0];
                //console.log(midiData);
                let weatherDialogData = {
                    buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
                    title: "Is there a storm?"
                };
                let stormyWeather = await warpgate.buttonDialog(weatherDialogData, 'row');
                let template = await warpgate.crosshairs.show(25, midiData.item.img, "Call Lightning");
                let effectFile = `jb2a.call_lightning.${res}_res.${color}`
                let effectFilePath = Sequencer.Database.getEntry(effectFile).file;
                let stormTile = await placeCloudAsTile(template, midiData.tokenId);
                let spellItem = midiData.actor.items.get(midiData.item._id);
                await changeSelfItemMacro();
                await game.AdvancedSpellEffects.updateFlag(stormTile._id, "stormDamage", stormyWeather);
                await game.AdvancedSpellEffects.callBolt(canvas.scene.tiles.get(stormTile._id));

                async function placeCloudAsTile(template, casterId) {
                    let templateData = template;
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
                                'spellLevel': midiData.spellLevel,
                                'itemID': midiData.item._id
                            }
                        }
                    }
                    let createdTiles = await ASEsocket.executeAsGM("placeTiles", [data]);
                    return (createdTiles[0]);
                }
                async function changeSelfItemMacro() {
                    let concentrationActiveEffect = midiData.actor.effects.filter((effect) => effect.data.label === "Concentrating")[0];
                    await concentrationActiveEffect?.update({
                        changes: [{
                            key: "macro.itemMacro",
                            mode: 0,
                            value: 0
                        }]
                    });
                    let newItemMacro;
                    let oldItemMacro = spellItem.getFlag("itemacro", "macro.data.command");
                    if (!oldItemMacro.includes("/*ASE_REPLACED*/")) {
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
    ${oldItemMacro}
}`;
                        //console.log(newItemMacro);
                        await spellItem.setFlag("itemacro", "macro.data.command", newItemMacro)
                    }
                }
                break;
            case "ItemMacro":
                break;
            default:
                break;

        }

    }
    // List of effects that can be called
    game.AdvancedSpellEffects = {};
    game.AdvancedSpellEffects.removeTiles = removeTiles;
    game.AdvancedSpellEffects.updateFlag = updateFlag;
    game.AdvancedSpellEffects.darkness = darkness;
    game.AdvancedSpellEffects.detectMagic = detectMagic;
    game.AdvancedSpellEffects.fogCloud = fogCloud;
    game.AdvancedSpellEffects.steelWindStrike = steelWindStrike;
    game.AdvancedSpellEffects.thunderStep = thunderStep;
    game.AdvancedSpellEffects.summon = summon;
    game.AdvancedSpellEffects.callLightning = callLightning;
    game.AdvancedSpellEffects.callBolt = callBolt;
    /*
    game.AdvancedSpellEffects.tollTheDead = tollTheDead;*/

});

Hooks.once("socketlib.ready", () => {


    //register module with socketlib
    ASEsocket = window.socketlib.registerModule("advancedspelleffects");
    //register all effect functions defined above with socketlib here
    ASEsocket.register("registeredDarknessMIDI", darknessMIDISocketFunction);
    ASEsocket.register("registeredDarknessItemMacro", darknessItemMacroSocketFunction);
    ASEsocket.register("registeredTollTheDead", tollTheDeadSocketFunction);
    ASEsocket.register("registeredSteelWindStrikeNoMIDI", steelWindStrikeNoMIDISocketFunction);
    ASEsocket.register("moveDarknessWalls", darknessWallMover);
    ASEsocket.register("deleteTiles", deleteTiles);
    ASEsocket.register("placeTiles", placeTiles);
    ASEsocket.register("updateObjectFlag", updateFlag);
    ASEsocket.register("placeWalls", placeWalls);
    ASEsocket.register("moveFogCloudWalls", fogCloudWallMover);

    async function updateFlag(objectId, flag, value) {
        //console.log("Tile ID: ", objectId);
        let object = canvas.scene.tiles.get(objectId) || canvas.scene.tokens.get(objectId) || canvas.scene.drawings.get(objectId) || canvas.scene.walls.get(objectId) || canvas.scene.lights.get(objectId);
        //console.log("Flag updating for object: ", object);
        await object.setFlag("advancedspelleffects", flag, value);
    }
    async function deleteTiles(tileIds) {
        await canvas.scene.deleteEmbeddedDocuments("Tile", tileIds);
    }
    async function placeTiles(tileData) {
        return (await canvas.scene.createEmbeddedDocuments("Tile", tileData));
    }
    async function placeWalls(wallData) {
        return (await canvas.scene.createEmbeddedDocuments("Wall", wallData));
    }

    async function fogCloudWallMover(tileId, wall_number) {
        let tileD = await canvas.scene.tiles.get(tileId);
        //console.log("tile pos: ", { 'x': tileD.data.x, 'y': tileD.data.y });
        //console.log('diff: ', diff);
        //if (!diff.x || !diff.y) return;
        //console.log(wall_number);
        let placedX = tileD.data.x + (tileD.data.width / 2);
        let placedY = tileD.data.y + (tileD.data.height / 2);
        let outerCircleRadius = tileD.data.width / 2.2;
        let wall_angles = 2 * Math.PI / wall_number;
        let walls = [];
        let wallDocuments = [];
        let wallPoints = [];
        //console.log("Tile Document: ",tileD);
        walls = await Tagger.getByTag([`FogCloudWall-${tileD.id}`]);
        walls.forEach((wall) => {
            wallDocuments.push(wall.document.id);
        });
        walls = [];
        if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
            for (let i = 0; i < wall_number; i++) {
                let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                wallPoints.push({ x: x, y: y });
            }
            //console.log("Walls Coordinates: ",wallPoints);
            for (let i = 0; i < wallPoints.length; i++) {
                if (i < wallPoints.length - 1) {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                        flags: { tagger: { tags: [`FogCloudWall-${tileD.id}`] } },
                        move: 0
                    })
                }
                else {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                        flags: { tagger: { tags: [`FogCloudWall-${tileD.id}`] } },
                        move: 0
                    })
                }
            }

        }
        //console.log("Walls: ", walls);
        await canvas.scene.createEmbeddedDocuments("Wall", walls);
        //console.log(wallDocuments);
    }

    async function darknessWallMover(tileId) {
        let tileD = await canvas.scene.tiles.get(tileId);
        let wall_number = 12;
        let placedX = tileD.data.x + (tileD.data.width / 2);
        let placedY = tileD.data.y + (tileD.data.height / 2);
        let outerCircleRadius = tileD.data.width / 2.2;
        let wall_angles = 2 * Math.PI / wall_number;
        let walls = [];
        let wallDocuments = [];
        let wallPoints = [];

        walls = await Tagger.getByTag([`DarknessWall-${tileD.id}`]);
        walls.forEach((wall) => {
            wallDocuments.push(wall.document.id);
        });
        walls = [];
        if (wallDocuments.length > 0) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
            for (let i = 0; i < wall_number; i++) {
                let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                wallPoints.push({ x: x, y: y });
            }

            for (let i = 0; i < wallPoints.length; i++) {
                if (i < wallPoints.length - 1) {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                        move: 0
                    })
                }
                else {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                        move: 0
                    })
                }
            }

        }
        if (walls.length > 0) {
            await canvas.scene.createEmbeddedDocuments("Wall", walls);
        }

    }

    async function darknessMIDISocketFunction(template, itemID, tokenID) {
        //console.log("Roll Data: ", rollData);
        let caster = await canvas.tokens.get(tokenID);
        const actor = caster.actor;
        let item = actor.items.find((item) => item.id == itemID);
        //console.log("Actor: ", actor);
        //console.log("Caster: ", caster);
        //console.log("Item: ", item);
        await placeCloudAsTile(template, caster.id);

        await changeSelfItemMacro();

        async function changeSelfItemMacro() {
            let concentrationActiveEffect = actor.effects.filter((effect) => effect.data.label === "Concentrating")[0];
            //console.log("Detect Magic Concentration effect: ", concentrationActiveEffect);
            await concentrationActiveEffect.update({
                changes: [{
                    key: "macro.itemMacro",
                    mode: 0,
                    value: 0
                }]
            });
            let newItemMacro;

            if (!item.getFlag("itemacro", "macro.data.command").includes("/*ASE_REPLACED*/")) {
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
                //console.log(newItemMacro);
                await item.setFlag("itemacro", "macro.data.command", newItemMacro);
            }
        }

        async function placeCloudAsTile(templateData, casterId) {
            // console.log("Template given: ", template);

            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;
            let placedX = templateData.x;
            let placedY = templateData.y;
            let wallPoints = [];
            let walls = [];
            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);

            let outerCircleRadius = tileWidth / 2.2;
            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);

            data = [{
                alpha: 1,
                width: tileWidth,
                height: tileHeight,
                img: "modules/jb2a_patreon/Library/2nd_Level/Darkness/Darkness_01_Black_600x600.webm",
                overhead: true,
                occlusion: {
                    alpha: 0,
                    mode: 3,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tileX,
                y: tileY,
                z: 100,
                flags: { tagger: { tags: [`DarknessTile-${casterId}`] } }
            }]
            let createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", data);
            let tileD = createdTiles[0];

            let wall_number = 12;
            let wall_angles = 2 * Math.PI / wall_number
            for (let i = 0; i < wall_number; i++) {
                let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                wallPoints.push({ x: x, y: y });
            }

            for (let i = 0; i < wallPoints.length; i++) {
                if (i < wallPoints.length - 1) {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                        move: 0
                    })
                }
                else {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                        move: 0
                    })
                }
            }

            await canvas.scene.createEmbeddedDocuments("Wall", walls);
        }

    }

    async function darknessItemMacroSocketFunction(template, itemID, tokenID) {
        //console.log("Roll Data: ", rollData);
        let caster = await canvas.tokens.get(tokenID);
        const actor = caster.actor;
        let item = actor.items.find((item) => item.id == itemID);
        //console.log("Actor: ", actor);
        //console.log("Caster: ", caster);
        //console.log("Item: ", item);
        let error = false;
        if (typeof args !== 'undefined' && args.length === 0) {
            error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
        }
        if (!(game.modules.get("jb2a_patreon"))) {
            error = `You need to have JB2A's patreon only module installed to run this macro!`;
        }
        if (!game.modules.get("advanced-macros")?.active) {
            let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
            error = `You need to have Advanced Macros ${installed} to run this macro!`;
        }
        if (!game.modules.get("socketlib")?.active) {
            let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
            error = `You need to have SocketLib ${installed} to run this macro!`;
        }
        if (!game.modules.get("tagger")?.active) {
            let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
            error = `You need to have TTagger${installed} to run this macro!`;
        }
        if (!game.modules.get("sequencer")?.active) {
            let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
            error = `You need to have Sequencer ${installed} to run this macro!`;
        }
        if (error) {
            ui.notifications.error(error);
            return;
        }




        await placeCloudAsTile(template, caster.id);

        await changeSelfItemMacro();

        await addConcentration();



        function getSelfTarget(actor) {
            if (actor.token)
                return actor.token;
            const speaker = ChatMessage.getSpeaker({ actor });
            if (speaker.token)
                return canvas.tokens?.get(speaker.token);
            return new CONFIG.Token.documentClass(actor.getTokenData(), { actor });
        }
        async function addConcentration() {
            //console.log("item in addConcentration: ", item);
            let selfTarget = item.actor.token ? item.actor.token.object : getSelfTarget(item.actor);
            if (!selfTarget)
                return;

            let concentrationName = "Concentration";
            const inCombat = (game.combat?.turns.some(combatant => combatant.token?.id === selfTarget.id));
            const effectData = {
                changes: [{
                    key: "macro.itemMacro",
                    mode: 0,
                    value: 0
                }],
                origin: item.uuid,
                disabled: false,
                icon: "modules/advancedspelleffects/icons/concentrate.png",
                label: concentrationName,
                duration: {},
                flags: { "advancedspelleffects": { isConcentration: item?.uuid } }
            };

            const convertedDuration = globalThis.DAE.convertDuration(item.data.data.duration, inCombat);
            if (convertedDuration?.type === "seconds") {
                effectData.duration = { seconds: convertedDuration.seconds, startTime: game.time.worldTime };
            }
            else if (convertedDuration?.type === "turns") {
                effectData.duration = {
                    rounds: convertedDuration.rounds,
                    turns: convertedDuration.turns,
                    startRound: game.combat?.round,
                    startTurn: game.combat?.turn
                };
            }


            await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
            //console.log("Done creating and adding effect to actor...");

            return true;
            // return await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        }

        async function changeSelfItemMacro() {
            let newItemMacro;

            if (!item.getFlag("itemacro", "macro.data.command").includes("/*ASE_REPLACED*/")) {
                newItemMacro = `/*ASE_REPLACED*/if(args.length > 0){
    if(args[0] === "off"){
        //console.log("token: ", token)
        let darknessTiles = Tagger.getByTag(`+ "`DarknessTile-${args[1].tokenId}`" + `);
        darknessTiles.then(async (tiles) => {
            console.log("tiles to delete: ", [tiles[0].id]);
            if(tiles.length>0){
            game.AdvancedSpellEffects.removeTiles([tiles[0].id]);
        }
        })
    }
}
else
{
    let options = {version: "ItemMacro", itemId: item.id, tokenId: args[1].tokenId};
    game.AdvancedSpellEffects.darkness(options);
}`;
                //console.log(newItemMacro);
                await item.setFlag("itemacro", "macro.data.command", newItemMacro)
            }
        }

        async function placeCloudAsTile(templateData, casterId) {
            // console.log("Template given: ", template);

            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;
            let placedX = templateData.x;
            let placedY = templateData.y;
            let wallPoints = [];
            let walls = [];
            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);

            let outerCircleRadius = tileWidth / 2.2;
            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);

            data = [{
                alpha: 1,
                width: tileWidth,
                height: tileHeight,
                img: "modules/jb2a_patreon/Library/2nd_Level/Darkness/Darkness_01_Black_600x600.webm",
                overhead: true,
                occlusion: {
                    alpha: 0,
                    mode: 3,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tileX,
                y: tileY,
                z: 100,
                flags: { tagger: { tags: [`DarknessTile-${casterId}`] } }
            }]
            let createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", data);
            let tileD = createdTiles[0];

            let wall_number = 12;
            let wall_angles = 2 * Math.PI / wall_number
            for (let i = 0; i < wall_number; i++) {
                let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                wallPoints.push({ x: x, y: y });
            }

            for (let i = 0; i < wallPoints.length; i++) {
                if (i < wallPoints.length - 1) {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                        move: 0
                    })
                }
                else {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                        move: 0
                    })
                }
            }

            await canvas.scene.createEmbeddedDocuments("Wall", walls);
        }


    }

    async function tollTheDeadSocketFunction(rollData) {

        console.log(rollData);
        //let caster = canvas.tokens.controlled[0];
        let bellAnim = "jb2a.toll_the_dead.purple.bell";
        let shockAnim = "jb2a.toll_the_dead.purple.shockwave";
        let skullAnim = "jb2a.toll_the_dead.purple.skull_smoke"
        let spawnEffect = "jb2a.eldritch_blast.purple"
        let target = rollData.failedSaves[0];

        if (target != undefined) {
            let targetCurrentHP = target._actor.data.data.attributes.hp.value;
            let targetMaxHP = target._actor.data.data.attributes.hp.max;
            let damageDie = "1d8";
            let animScale = 0.3;
            let volume = 0.2;
            if (targetCurrentHP < targetMaxHP) {
                damageDie = "1d12";
                animScale = 0.6;
                volume = 0.3;
            }

            let damageRoll = new Roll(`${damageDie}`).roll();
            executeBell();
            async function executeBell() {
                if (game.modules.get("dice-so-nice")?.active) {
                    await game.dice3d?.showForRoll(damageRoll);
                }
                new MidiQOL.DamageOnlyWorkflow(rollData.actor, rollData.tokenId, damageRoll.total, "necrotic", [target], damageRoll, { flavor: `Toll the Dead - Damage Roll (${damageDie} Necrotic)`, itemCardId: rollData.itemCardId });
                //await SequencerPreloader.preloadForClients([animFilePath, audioFilePath], true);
                let sequence = new Sequence("Advanced Spell Effects")
                    .effect()
                    .file(spawnEffect)
                    .atLocation(target)
                    .JB2A()
                    .waitUntilFinished(-1200)
                    .endTime(3300)
                    .playbackRate(0.75)
                    .fadeOut(500)
                    .effect()
                    .file(bellAnim)
                    .atLocation(target)
                    .scale(animScale)
                    .rotate(45)
                    .fadeIn(500)
                    .JB2A()
                    .scaleIn((animScale - 0.2), 850, { ease: "easeInOutCirc" })
                    .rotateIn(10, 850, { ease: "easeInOutBack" })
                    .rotateOut(45, 650, { ease: "easeOutBounce" })
                    .fadeOut(150)
                    .endTimePerc(0.75)
                    .waitUntilFinished(-475)
                    .scaleOut((animScale + 0.05), 850)
                    .effect()
                    .file(shockAnim)
                    .atLocation(target)
                    .JB2A()
                    .scale((animScale + 0.2))
                    .waitUntilFinished(-800)
                    .fadeOut(600)
                    .endTimePerc(0.65)
                    .effect()
                    .atLocation(target)
                    .file(skullAnim)
                    .JB2A()
                    .scale(animScale)
                sequence.play();
            }
        }
    }

    async function steelWindStrikeNoMIDISocketFunction(item, weapon, color) {

        function easeOutElasticCustom(x) {
            const c4 = (2 * Math.PI) / 10;

            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -12 * x) * Math.sin((x * 12 - 0.75) * c4) + 1;
        }
        Sequencer.registerEase("easeOutElasticCustom", easeOutElasticCustom);
        console.log("Item: ", item);
        let caster = item.parent.getActiveTokens()[0];
        console.log("Caster roll data: ", caster.actor.getRollData());
        let targets = Array.from(game.user.targets);
        let rollDataForDisplay = [];
        //let spellCastingAbility = rollData.actor.data.attributes.spellcasting;
        let dagger = (weapon == "dagger") ? ".02" : "";
        let swordAnim;
        let gustAnim = "jb2a.gust_of_wind.veryfast";
        let animStartTimeMap = {
            "sword": 1050,
            "mace": 825,
            "greataxe": 1400,
            "greatsword": 1400,
            "handaxe": 1000,
            "spear": 825,
            "dagger": 700
        };
        swordAnim = `jb2a.${weapon}.melee${dagger}.${color}`;
        await caster.document.setFlag("autorotate", "enabled", false);

        await steelWindStrike(caster, targets);

        async function steelWindStrike(caster, targets) {
            let currentX;
            let targetX;
            let currentY;
            let targetY;
            let distance;
            let params =
                [{
                    filterType: "blur",
                    filterId: "SWSBlur",
                    padding: 10,
                    quality: 4.0,
                    blur: 0,
                    blurX: 0,
                    blurY: 0,
                    animated:
                    {
                        blurX:
                        {
                            active: true,
                            animType: "syncCosOscillation",
                            loopDuration: 500,
                            val1: 0,
                            val2: 8
                        },
                        blurY:
                        {
                            active: true,
                            animType: "syncCosOscillation",
                            loopDuration: 250,
                            val1: 0,
                            val2: 8
                        }
                    }
                }];
            await caster.TMFXaddUpdateFilters(params);
            //console.log(targets);
            for (let i = 0; i < targets.length; i++) {
                //console.log(targets[i]);
                let target = targets[i];
                evaluateAttack(target);

                currentX = caster.x;
                targetX = target.x;
                currentY = caster.y;
                targetY = target.y;
                distance = Math.sqrt(Math.pow((targetX - currentX), 2) + Math.pow((targetY - currentY), 2));
                //console.log(distance);
                let steelWindSequence = new Sequence("Advanced Spell Effects")
                    .effect()
                    .atLocation(caster)
                    .JB2A()
                    .file(gustAnim)
                    .reachTowards(target)
                    .opacity(0.8)
                    .fadeOut(250)
                    .belowTokens()
                    .effect()
                    .atLocation(caster)
                    .JB2A()
                    .file(swordAnim)
                    .startTime(animStartTimeMap[weapon] || 1050)
                    .moveTowards(target, { ease: "easeOutElasticCustom" })
                    .moveSpeed(distance)
                    .animation()
                    .on(caster)
                    .rotateTowards(target)
                    .animation()
                    .on(caster)
                    .moveTowards(target, { ease: "easeOutElasticCustom" })
                    .moveSpeed(distance / 60)
                    .duration(800)
                    .waitUntilFinished()
                await steelWindSequence.play();
            }

            let contentHTML = `<form class="editable flexcol" autocomplete="off">`;

            rollDataForDisplay.forEach((data) => {
                let name = data.target;
                let attackTotal = data.attackroll;
                let damageTotal = data.damageroll;
                let hitStatus = data.hit;
                contentHTML = contentHTML + `<section style="border: 1px solid black">
                                                <li class="flexrow">
                                                    <h4>${name}</h4>
                                                    <div>
                                                        <span>Attack Total: ${attackTotal}</span>
                                                    </div>
                                                    <div>
                                                        <span>${hitStatus ? 'Hit!' : 'Missed!'}</span>
                                                    </div>
                                                    <div> 
                                                        <span>Damage Total: ${damageTotal}</span>
                                                    </div>
                                                </li>
                                            </section> 
                                            <br>`;
            });
            contentHTML = contentHTML + `</form>`
            let preReticle;
            let reticle;

            let templateData = {
                t: "circle",
                user: game.user.id,
                distance: 2.5,
                direction: 0,
                x: 0,
                y: 0,
                texture: ""
            };
            async function createTemplate(reticleData) {
                preReticle = new MeasuredTemplateDocument(reticleData, { parent: canvas.scene });
                //console.log("Pre-Reticle: ", preReticle);
                reticle = new game.dnd5e.canvas.AbilityTemplate(preReticle);
                reticle.actorSheet = item.actor.sheet;
                //console.log("Reticle: ", reticle);
                Hooks.once("createMeasuredTemplate", async (template) => {
                    //console.log("template placed: ", template);
                    canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.data._id])
                    await finalTeleport(caster, template);
                    await caster.TMFXdeleteFilters("SWSBlur");
                    await caster.document.setFlag("autorotate", "enabled", true);

                });
                await reticle.drawPreview();
            }
            let waitForInput = await (new Promise((resolve) => {
                new Dialog({
                    title: "Steel Wind Strike breakdown",
                    content: contentHTML,
                    buttons:
                    {
                        one: {
                            label: 'Okay',
                            callback: (html) => {
                                resolve(true);
                            }
                        }
                    },
                },
                    { width: '500' },
                ).render(true)
            }));

            if (waitForInput) {
                await createTemplate(templateData);
            }

        }
        async function evaluateAttack(target) {
            //console.log("Evalute attack target: ", target);
            let attackRoll = new Roll(`1d20 + @mod + @prof`, caster.actor.getRollData()).roll({ async: false });
            attackRoll.toMessage();
            // game.dice3d?.showForRoll(attackRoll);
            if (attackRoll.total < target.actor.data.data.attributes.ac.value) {
                onMiss(target, attackRoll);
            }
            else {
                onHit(target, attackRoll);
            }
        }
        async function onHit(target, attackRoll) {
            //console.log('Attack hit!');
            //console.log("Attack roll: ", attackRoll);
            let currentRoll = new Roll('6d10', caster.actor.getRollData()).roll({ async: false });
            currentRoll.toMessage();
            //console.log("Current damage dice roll total: ", currentRoll.total);
            //game.dice3d?.showForRoll(currentRoll);
            //let damageData = new MidiQOL.DamageOnlyWorkflow(rollData.actor, rollData.tokenId, currentRoll.total, "force", [target], currentRoll, { flavor: 'Steel Wind Strike - Damage Roll (6d10 force)', itemCardId: rollData.itemCardId });
            //console.log("damage data: ", damageData);

            rollDataForDisplay.push({
                "target": target.name,
                "attackroll": attackRoll.total,
                "hit": true,
                "damageroll": currentRoll.total
            })
        }
        async function onMiss(target, attackRoll) {
            //console.log('Missed attack...');
            //console.log("Attack roll: ", attackRoll);
            rollDataForDisplay.push({
                "target": target.name,
                "attackroll": attackRoll.total,
                "hit": false,
                "damageroll": 0
            })
            //let currentRoll = new Roll(`${damageDie}`, caster.actor.getRollData()).roll({ async: false });
            //game.dice3d?.showForRoll(currentRoll);
            //new MidiQOL.DamageOnlyWorkflow(rollData.actor, rollData.tokenId, currentRoll.total, "bludgeoning", [target], currentRoll, { flavor: `Flurry of Blows - Damage Roll (${damageDie} Bludgeoning)`, itemCardId: rollData.itemCardId });
        }

        async function finalTeleport(caster, location) {
            console.log("template: ", location);
            let adjustedLocation = { x: location.data.x - (canvas.grid.size / 2), y: location.data.y - (canvas.grid.size / 2) }
            let distance = Math.sqrt(Math.pow((adjustedLocation.x - caster.x), 2) + Math.pow((adjustedLocation.y - caster.y), 2));

            let steelWindSequence = new Sequence("Advanced Spell Effects")
                .effect()
                .atLocation(caster)
                .JB2A()
                .file(gustAnim)
                .reachTowards(location)
                .opacity(0.8)
                .fadeOut(250)
                .belowTokens()
                .animation()
                .on(caster)
                .rotateTowards(location)
                .animation()
                .on(caster)
                .snapToSquare()
                .moveTowards(location, { ease: "easeOutElasticCustom" })
                .moveSpeed(distance / 60)
                .duration(800)
            await steelWindSequence.play();
        }

    }

});
