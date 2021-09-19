let ASEsocket;
//Define every function needed for an effect here so that they can be registered by socketlib


Hooks.once('ready', async function () {
    Hooks.on("updateToken", async (tokenDocument, updateData, options) => {

        if ((!updateData.x && !updateData.y)) return;
        //console.log("hook fired!...", tokenDocument, updateData);
        if (tokenDocument.actor.effects.filter((effect) => effect.data.document.sourceName == "Detect Magic").length==0) return;

        let users = [];
        for (const user in tokenDocument.actor.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }
        let newPos = { x: 0, y: 0 };
        newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
        newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
        //console.log("Controlled token: " , tokenDocument);
        let magicalObjects = [];
        let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
        let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

        let objects = await Tagger.getByTag("magical", { ignore: [tokenDocument] });

        magicalObjects = objects.map(o => {
            let distance = canvas.grid.measureDistance(newPos, o);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        }).filter(o => o.distance > 32.5)
        for (let magical of magicalObjects) {
            if (!magical.school) {
                continue;
            }
            new Sequence()
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
        magicalObjects = objects.map(o => {
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
        for (let magical of magicalObjects) {
            if (!magical.school) {
                continue;
            }
            let runeDisplayed = Sequencer.EffectManager.getEffects({name: `${magical.obj.document.id}-magicRune`, object: magical.obj});
            //let runeIntros = Sequencer.EffectManager.getEffects({name: `detectMagicRuneIntro`, object: canvas.tokens.get(tokenDocument.id)});
            //console.log("Intros displaying: ", runeIntros);
            //console.log("magical object in range: ", magical.obj,magical.obj.document.getFlag("world", "magicDetected"));
            if (!(magical.obj.document.getFlag("advancedspelleffects", "magicDetected")) && runeDisplayed.length == 0 /*&& runeIntros.length == 0*/) {
                await ASEsocket.executeAsGM("updateObjectFlag", magical.obj.id, "magicDetected", true);
                new Sequence()
                    .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                    .forUsers(users)
                    .atLocation(magical.obj)
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
                    .atLocation(magical.obj)
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
                // code block
                let rollData = options.args[0];
                itemId = rollData.id;
                tokenId = rollData.tokenId;
                template = await warpgate.crosshairs.show(3, rollData.item.img, "Darkness");
                //console.log(rollData);
                ASEsocket.executeAsGM("registeredDarknessMIDI", template, itemId, tokenId);
                break;
            case "ItemMacro":
                let caster = await canvas.tokens.get(options.tokenId);
                const actor = caster.actor;
                let item = await actor.items.get(options.itemId);
                template = await warpgate.crosshairs.show(3, item.img, "Darkness");
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

                if (!game.modules.get("tokenmagic")?.active) {
                    let installed = game.modules.get("tokenmagic") && !game.modules.get("tokenmagic").active ? "enabled" : "installed";
                    error = `You need to have Token Magic FX ${installed} to run this macro!`;
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
                sequence = new Sequence()
                    .effect(`jb2a.detect_magic.circle.${waveColor}`)
                    .atLocation(caster)
                    .attachTo(caster)
                    .JB2A()
                    .belowTiles()
                    .scale(2.33333)
                    .effect()
                        .file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`)
                        .atLocation(caster)
                        .attachTo(caster)
                        .scale(0.2)
                        .belowTokens()
                        .waitUntilFinished(-1000)
                        .fadeOut(1000, { ease: "easeInQuint" })
                    .effect()
                        .file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`)
                        .atLocation(caster)
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
                            new Sequence()
                                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                                .forUsers(users)
                                .atLocation(magical.obj)
                                .scale(0.25)
                                .setMustache(magical)
                                .zIndex(0)
                                .effect()
                                .file("jb2a.magic_signs.circle.02.divination.outro.` + auraColor + `")
                                .atLocation(caster)
                                .scale(0.2)
                                .belowTokens()
                                .attachTo(caster)
                            .play()
                        }
        }
        else if(args[0] != "on" && args[0] != "off"){
            let options = {version: "MIDI", args: args, waveColor: "`+ waveColor + `", auraColor: "`+ auraColor + `"};
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
                    new Sequence()
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
                        .atLocation(magical.obj)
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

                if (!game.modules.get("tokenmagic")?.active) {
                    let installed = game.modules.get("tokenmagic") && !game.modules.get("tokenmagic").active ? "enabled" : "installed";
                    error = `You need to have Token Magic FX ${installed} to run this macro!`;
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
                sequence = new Sequence()
                    .effect(`jb2a.detect_magic.circle.${waveColor}`)
                    .atLocation(caster)
                    .JB2A()
                    .belowTiles()
                    .attachTo(caster)
                    .scale(2.33333)
                    .effect()
                        .file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`)
                        .atLocation(caster)
                        .attachTo(caster)
                        .scale(0.2)
                        .belowTokens()
                        .waitUntilFinished(-1000)
                        .fadeOut(1000, { ease: "easeInQuint" })
                    .effect()
                        .file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`)
                        .atLocation(caster)
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
                    Sequencer.EffectManager.endEffects({name: ` + "`${token.id}-detectMagicAura`" + `, object: token});
                    new Sequence()
                    .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                    .forUsers(users)
                    .atLocation(magical.obj)
                    .scale(0.25)
                    .setMustache(magical)
                    .zIndex(0)
                    .effect()
                    .file("jb2a.magic_signs.circle.02.divination.outro.` + auraColor + `")
                    .atLocation(caster)
                    .scale(0.2)
                    .belowTokens()
                    .attachTo(caster)
                    .play()
                }
}
else if(args[0] != "on" && args[0] != "off"){
    let options = {version: "ItemMacro", itemId: item.id, tokenId: token.id, waveColor: "`+ waveColor + `", auraColor: "`+ auraColor + `"};
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
                    new Sequence()
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
                        .atLocation(magical.obj)
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
                    if (!item.getFlag("itemacro", "macro.data.command").includes("/*ASE_REPLACED*/")) {
                        newItemMacro = `/*ASE_REPLACED*/
if(args[0] === "off"){
    console.log("token: ", token)
    let fogCloudTiles = Tagger.getByTag(`+ "`FogCloudTile-${token.id}`" + `);
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

                let animStartTimeMap = {
                    "sword": 1050,
                    "mace": 825,
                    "greataxe": 1400,
                    "greatsword": 1400,
                    "handaxe": 1000,
                    "spear": 825,
                    "dagger": 700
                };
                swordAnim = `jb2a.${options.weapon}.melee${dagger}.${options.color}`;

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

                    let steelWindSequence = new Sequence()
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
                        let steelWindSequence = new Sequence()
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
                            .startTime(animStartTimeMap[options.weapon] || 1050)
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
    // List of effects that can be called
    game.AdvancedSpellEffects = {};
    game.AdvancedSpellEffects.removeTiles = removeTiles;
    game.AdvancedSpellEffects.updateFlag = updateFlag;
    game.AdvancedSpellEffects.darkness = darkness;
    game.AdvancedSpellEffects.detectMagic = detectMagic;
    game.AdvancedSpellEffects.fogCloud = fogCloud;
    game.AdvancedSpellEffects.steelWindStrike = steelWindStrike;
    /*
    game.AdvancedSpellEffects.tollTheDead = tollTheDead;*/

});

Hooks.once("socketlib.ready", () => {


    //register module with socketlib
    ASEsocket = window.socketlib.registerModule("advancedspelleffects");
    //register all effect functions defined above with socketlib here
    //ASEsocket.register("registeredFogCloudWithWalls", fogCloudWithWallsSocketFunction);
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
        const object = canvas.scene.tiles.get(objectId);
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
                        let darknessTiles = Tagger.getByTag(`+ "`DarknessTile-${token.id}`" + `);
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
            tileWidth = (templateData.distance * 45);
            tileHeight = (templateData.distance * 45);

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
        let darknessTiles = Tagger.getByTag(`+ "`DarknessTile-${token.id}`" + `);
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
    let options = {version: "ItemMacro", itemId: item.id, tokenId: token.id};
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
            tileWidth = (templateData.distance * 45);
            tileHeight = (templateData.distance * 45);

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
                let sequence = new Sequence()
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
                let steelWindSequence = new Sequence()
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

            let steelWindSequence = new Sequence()
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
