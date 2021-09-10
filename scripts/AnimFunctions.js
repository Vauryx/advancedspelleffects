Hooks.once('init', async function () {

    //Effect functions to be called from a macro in the "OnUseMacro" field of MIDI-QOL
    //Each function is excuted via socketlib to ensure proper permissions for the effect
    async function detectMagic(rollData) {
        socket.executeAsGM("detectMagic", rollData);
    }
    async function detectMagicRecursive(rollData) {
        socket.executeAsGM("detectMagicRecursive", rollData);
    }
    async function fogCloudWithWalls(rollData, numWalls) {
        socket.executeAsGM("fogCloudWithWalls", rollData, numWalls || 12);
    }
    async function darknessWithWalls(rollData, numWalls) {
        socket.executeAsGM("darknessWithWalls", rollData, numWalls || 12);
    }
    async function tollTheDead(rollData) {
        setTimeout(() => { socket.executeAsGM("tollTheDead", rollData[0]); }, 100);
    }
    async function steelWindStrike(rollData, weapon, color) {
        socket.executeAsGM("steelWindStrike", rollData[0], weapon || "sword", color || "blue");
    }
    // List of effects that can be called
    game.AdvancedSpellEffects = {};
    game.AdvancedSpellEffects.detectMagic = detectMagic;
    game.AdvancedSpellEffects.detectMagicRecursive = detectMagicRecursive;
    game.AdvancedSpellEffects.fogCloudWithWalls = fogCloudWithWalls;
    game.AdvancedSpellEffects.darknessWithWalls = darknessWithWalls;
    game.AdvancedSpellEffects.tollTheDead = tollTheDead;
    game.AdvancedSpellEffects.steelWindStrike = steelWindStrike;
});

Hooks.once("socketlib.ready", () => {
    //Define every function needed for an effect here so that they can be registered by socketlib
    async function detectMagicContinous(rollData) {
        // Wasp - Sequencer guy Detect Magic Macro
        // Requires the JB2A patreon module
        // Requires Advanced Macros and MidiQOL with Workflow -> Add macro to call on use
        // Then add this macro's name to the bottom of the Detect Magic spell in the "On Use Macro" field

        // Small modification to display rune when a token moves within range of magical object as long as effect is active
        // Effect can be disabled by running the following in a separate macro with the caster of detect magic selected
        /* 
        let tokenD = canvas.tokens.controlled[0];
        let detectMagicHookId = await tokenD.document.getFlag("world","detectMagicHookId");
        Hooks.off("updateToken", detectMagicHookId);
        await TokenMagic.deleteFilters(tokenD, "detectMagicGlow");
        */
        let args = rollData;
        //console.log("ARGS: ", args);
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
        const actorD = game.actors.get(args[0].actor._id);
        let users = [];
        for (const user in actorD.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }
        console.log("Visible to users: ", users);
        const tokenD = canvas.tokens.get(args[0].tokenId);
        const itemD = actorD.items.getName(args[0].item.name);

        if (error) {
            ui.notifications.error(error);
            return;
        }

        let magicalObjects = [];

        if (game.modules.get("tagger")?.active) {

            let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
            let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

            let objects = await Tagger.getByTag("magical", { ignore: [tokenD] });
            magicalObjects = objects.map(o => {
                let distance = canvas.grid.measureDistance(tokenD, o);
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

        let sequence = new Sequence()
            .effect("jb2a.detect_magic.circle.purple")
            .atLocation(tokenD)
            .JB2A()
            .belowTiles()
            .scale(2.33333)
            .thenDo(async () => {
                await registerDetectMagicHook(tokenD, users);
            })
            .thenDo(async () => {
                await applyMagicHighlight();
            })

        for (let magical of magicalObjects) {

            if (!magical.school) {
                continue;
            }
            await magical.obj.document.setFlag("world", "detectMagic", true);
            new Sequence()
                .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .delay(magical.delay)
                .setMustache(magical)
                .waitUntilFinished(-800)
                .zIndex(0)
                .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .setMustache(magical)
                .fadeOut(500)
                .waitUntilFinished(-800)
                .zIndex(1)
                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .setMustache(magical)
                .zIndex(0)
                .thenDo(async () => {
                    await magical.obj.document.setFlag("world", "detectMagic", false)
                })
                .play()
        }
        sequence.play();

        async function applyMagicHighlight() {
            let detectMagicGlow =
                [{
                    filterType: "zapshadow",
                    filterId: "myZapShadow",
                    alphaTolerance: 0.50
                },
                {
                    filterType: "xglow",
                    filterId: "detectMagicGlow",
                    auraType: 2,
                    color: 0x8F00FF,
                    thickness: 0.01,
                    scale: 1,
                    time: 0,
                    auraIntensity: 2,
                    subAuraIntensity: 1.5,
                    threshold: 0.5,
                    discard: true,
                    animated:
                    {
                        time:
                        {
                            active: true,
                            speed: 0.0027,
                            animType: "move"
                        },
                        thickness:
                        {
                            active: true,
                            loopDuration: 3000,
                            animType: "cosOscillation",
                            val1: 2,
                            val2: 5
                        }
                    }
                }];

            await TokenMagic.addFilters(tokenD, detectMagicGlow);
        }


        async function registerDetectMagicHook(tokenD, users) {
            let detectMagicHookId = Hooks.on("updateToken", async (tokenDocument, updateData, options) => {
                //console.log("hook fired!");
                if ((!updateData.x && !updateData.y) || (tokenDocument.id != tokenD.id)) return;
                //console.log("Controlled token: " , tokenD);
                let magicalObjects = []
                if (game.modules.get("tagger")?.active) {

                    let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
                    let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

                    let objects = await Tagger.getByTag("magical", { ignore: [tokenD] });
                    //console.log("Total Magical Objects in Scene: " , objects);
                    magicalObjects = objects.map(o => {
                        let distance = canvas.grid.measureDistance(tokenD, o);
                        return {
                            delay: 0,
                            distance: distance,
                            obj: o,
                            school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                            color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
                        }
                    })
                        .filter(o => o.distance <= 32.5)
                }
                //console.log("Magical Objects in Range: " , magicalObjects);
                for (let magical of magicalObjects) {

                    if (!magical.school || magical.obj.document.getFlag("world", "detectMagic")) {
                        //console.log("Tile is already displaying a rune!");
                        //console.log("Tile flag: ", magical.obj.document.getFlag("world", "detectMagic"));
                        continue;
                    }

                    await magical.obj.document.setFlag("world", "detectMagic", true);
                    //console.log("Tile flag: ", magical.obj.document.getFlag("world", "detectMagic"));
                    //console.log("Dispalying rune on magical object: ", magical);
                    new Sequence()
                        .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                        .forUsers(users)
                        .atLocation(magical.obj)
                        .scale(0.25)
                        .delay(magical.delay)
                        .setMustache(magical)
                        .waitUntilFinished(-800)
                        .zIndex(0)
                        .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                        .forUsers(users)
                        .atLocation(magical.obj)
                        .scale(0.25)
                        .setMustache(magical)
                        .fadeOut(500)
                        .waitUntilFinished(-800)
                        .zIndex(1)
                        .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                        .forUsers(users)
                        .atLocation(magical.obj)
                        .scale(0.25)
                        .setMustache(magical)
                        .zIndex(0)
                        .waitUntilFinished()
                        .thenDo(async () => {
                            await magical.obj.document.setFlag("world", "detectMagic", false)
                        })
                        .play()
                }
            });
            await tokenD.document.setFlag("world", "detectMagicHookId", detectMagicHookId);
        }
    }

    async function detectMagicRecursive(rollData) {
        // Wasp - Sequencer guy Detect Magic Macro
        // Requires the JB2A patreon module
        // Requires Advanced Macros and MidiQOL with Workflow -> Add macro to call on use
        // Then add this macro's name to the bottom of the Detect Magic spell in the "On Use Macro" field

        // Small modification to display rune when a token moves within range of magical object as long as effect is active
        // Effect can be disabled by running the following in a separate macro with the caster of detect magic selected
        /* 
        let tokenD = canvas.tokens.controlled[0];
        let detectMagicHookId = await tokenD.document.getFlag("world","detectMagicHookId");
        Hooks.off("updateToken", detectMagicHookId);
        await TokenMagic.deleteFilters(tokenD, "detectMagicGlow");
        */
        let args = rollData;
        //console.log("ARGS: ", args);
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
        const actorD = game.actors.get(args[0].actor._id);
        let users = [];
        for (const user in actorD.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }
        console.log("Visible to users: ", users);
        const tokenD = canvas.tokens.get(args[0].tokenId);
        const itemD = actorD.items.getName(args[0].item.name);

        if (error) {
            ui.notifications.error(error);
            return;
        }

        let magicalObjects = [];

        if (game.modules.get("tagger")?.active) {

            let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
            let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

            let objects = await Tagger.getByTag("magical", { ignore: [tokenD] });
            magicalObjects = objects.map(o => {
                let distance = canvas.grid.measureDistance(tokenD, o);
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

        let sequence = new Sequence()
            .effect("jb2a.detect_magic.circle.purple")
            .atLocation(tokenD)
            .JB2A()
            .belowTiles()
            .scale(2.33333)
            .thenDo(async () => {
                await registerDetectMagicHook(tokenD, users);
            })
            .thenDo(async () => {
                await applyMagicHighlight();
            })


        for (let magical of magicalObjects) {
            if (!magical.school) {
                continue;
            }
            await magical.obj.document.setFlag("world", "runeLooping", true);

            async function loopRunes() {
                //console.log("Entered Recursive Rune Loop...");
                new Sequence()
                    .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                    .delay(magical.delay)
                    .forUsers(users)
                    .atLocation(magical.obj)
                    .scale(0.25)
                    .setMustache(magical)
                    .waitUntilFinished(-1150)
                    .zIndex(1)
                    .thenDo(async () => {
                        if (await magical.obj.document.getFlag("world", "runeLooping")) {
                            loopRunes();
                        }
                    })
                    .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                    .playIf(() => {
                        return !(magical.obj.document.getFlag("world", "runeLooping"))
                    })
                    .forUsers(users)
                    .atLocation(magical.obj)
                    .scale(0.25)
                    .setMustache(magical)
                    .zIndex(0)
                    .play()
            }
            new Sequence()
                .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .delay(magical.delay)
                .setMustache(magical)
                .waitUntilFinished(-1200)
                .zIndex(0)
                .thenDo(async () => {
                    loopRunes();
                })
                .play()

        }


        sequence.play();

        async function applyMagicHighlight() {
            let detectMagicGlow =
                [{
                    filterType: "zapshadow",
                    filterId: "myZapShadow",
                    alphaTolerance: 0.50
                },
                {
                    filterType: "xglow",
                    filterId: "detectMagicGlow",
                    auraType: 2,
                    color: 0x8F00FF,
                    thickness: 0.01,
                    scale: 1,
                    time: 0,
                    auraIntensity: 2,
                    subAuraIntensity: 1.5,
                    threshold: 0.5,
                    discard: true,
                    animated:
                    {
                        time:
                        {
                            active: true,
                            speed: 0.0027,
                            animType: "move"
                        },
                        thickness:
                        {
                            active: true,
                            loopDuration: 3000,
                            animType: "cosOscillation",
                            val1: 2,
                            val2: 5
                        }
                    }
                }];

            await TokenMagic.addFilters(tokenD, detectMagicGlow);
        }


        async function registerDetectMagicHook(tokenD, users) {
            let detectMagicHookId = Hooks.on("updateToken", async (tokenDocument, updateData, options) => {
                //console.log("hook fired!");
                if ((!updateData.x && !updateData.y) || (tokenDocument.id != tokenD.id)) return;
                let newPos = { x: 0, y: 0 };
                newPos.x = (updateData.x) ? updateData.x : tokenD.data.x;
                newPos.y = (updateData.y) ? updateData.y : tokenD.data.y;
                //console.log("Controlled token: " , tokenD);
                let magicalObjects = [];
                let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
                let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

                let objects = await Tagger.getByTag("magical", { ignore: [tokenD] });

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
                    await magical.obj.document.setFlag("world", "runeLooping", false);
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
                    if (!(magical.obj.document.getFlag("world", "runeLooping"))) {
                        await magical.obj.document.setFlag("world", "runeLooping", true);
                        async function loopRunes() {
                            //console.log("Entered Recursive Rune Loop...");
                            new Sequence()
                                .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                                .delay(magical.delay)
                                .forUsers(users)
                                .atLocation(magical.obj)
                                .scale(0.25)
                                .setMustache(magical)
                                .waitUntilFinished(-1000)
                                .zIndex(1)
                                .thenDo(async () => {
                                    if (await magical.obj.document.getFlag("world", "runeLooping")) {
                                        loopRunes();
                                    }
                                })
                                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                                .playIf(() => {
                                    return !(magical.obj.document.getFlag("world", "runeLooping"))
                                })
                                .forUsers(users)
                                .atLocation(magical.obj)
                                .scale(0.25)
                                .setMustache(magical)
                                .zIndex(0)
                                .play()
                        }
                        new Sequence()
                            .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                            .forUsers(users)
                            .atLocation(magical.obj)
                            .scale(0.25)
                            .delay(magical.delay)
                            .setMustache(magical)
                            .waitUntilFinished(-800)
                            .zIndex(0)
                            .thenDo(async () => {
                                loopRunes();
                            })
                            .play()
                    }
                }
            });
            await tokenD.document.setFlag("world", "detectMagicHookId", detectMagicHookId);
        }
    }

    async function fogCloudWithWalls(rollData, numWalls) {
        //console.log("Roll Data: ", rollData);
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

        let template = canvas.templates.get(rollData[0].templateId);

        await placeCloudAsTile(template, rollData[0].tokenId);
        async function placeCloudAsTile(template, casterId) {
            let templateData = template.data;
            //console.log("Template Data: ", templateData);
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;
            let placedX = templateData.x;
            let placedY = templateData.y;
            let wallPoints = [];
            let walls = [];
            tileWidth = (templateData.distance * 45) * rollData[0].spellLevel;
            tileHeight = (templateData.distance * 45) * rollData[0].spellLevel;

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
                flags: { tagger: { tags: [`FogCloudTile-${casterId}`] } }
            }
            let createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", [data]);
            let tileD = createdTiles[0];
            //console.log("Created tile..:", tileD);
            //console.log(numWalls);
            let wall_number = numWalls * rollData[0].spellLevel;
            let wall_angles = 2 * Math.PI / wall_number
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
            //console.log("Wall Data: ", walls);
            await canvas.scene.createEmbeddedDocuments("Wall", walls);
            await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateData._id]);
            /*Hooks.on("updateTile", async function moveAttachedWalls(tileD, diff) {

                //console.log("tile pos: ", { 'x': tileD.data.x, 'y': tileD.data.y });
                //console.log('diff: ', diff);
                if(!diff.x || !diff.y) return;
                //console.log(wall_number);
                let placedX = tileD.data.x + (tileD.data.width/2);
                let placedY = tileD.data.y +  (tileD.data.height/2);
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
                console.log("Walls: ", walls);
                await canvas.scene.createEmbeddedDocuments("Wall", walls);
                //console.log(wallDocuments);
            });*/
            let fogCloudTileDeleteHookId = Hooks.on("deleteTile", async function deleteAttachedWalls(tileD) {

                let walls = [];
                let wallDocuments = [];
                walls = await Tagger.getByTag([`FogCloudWall-${tileD.id}`]);
                walls.forEach((wall) => {
                    wallDocuments.push(wall.document.id);
                });
                //console.log(wallDocuments);
                //console.log("Embedded document test...", canvas.scene.getEmbeddedDocument("Wall",wallDocuments[0]));
                if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
                    await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
                    Hooks.off("deleteTile", fogCloudTileDeleteHookId);
                }

            });
        }


    }

    async function darknessWithWalls(rollData, numWalls) {
        //console.log("Roll Data: ", rollData);
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

        let template = canvas.templates.get(rollData[0].templateId);

        await placeCloudAsTile(template, rollData[0].tokenId);
        async function placeCloudAsTile(template, casterId) {
            let templateData = template.data;
            //console.log("Template Data: ", templateData);
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
            //console.log("Tile Width, Tile Height: ", tileWidth, tileHeight);
            // console.log("Tile X, Tile Y: ", tileX, tileY);
            data = {
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
            }
            let createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", [data]);
            let tileD = createdTiles[0];
            //console.log("Created tile..:", tileD);
            //console.log(numWalls);
            let wall_number = numWalls;
            let wall_angles = 2 * Math.PI / wall_number
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
            //console.log("Wall Data: ", walls);
            await canvas.scene.createEmbeddedDocuments("Wall", walls);
            await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateData._id]);
            let updateTileHookId = Hooks.on("updateTile", async function moveAttachedWalls(tileD, diff) {

                //console.log("tile pos: ", { 'x': tileD.data.x, 'y': tileD.data.y });
                //console.log('diff: ', diff);
                //console.log(wall_number);
                let placedX = tileD.data.x + (tileD.data.width / 2);
                let placedY = tileD.data.y + (tileD.data.height / 2);
                let outerCircleRadius = tileD.data.width / 2.2;
                let wall_angles = 2 * Math.PI / wall_number;
                let walls = [];
                let wallDocuments = [];
                let wallPoints = [];
                //console.log("Tile Document: ",tileD);
                walls = await Tagger.getByTag([`DarknessWall-${tileD.id}`]);
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
                //console.log("Walls: ", walls);
                await canvas.scene.createEmbeddedDocuments("Wall", walls);
                //console.log(wallDocuments);
            });
            let darknessTileDeleteHookId = Hooks.on("deleteTile", async function deleteAttachedWalls(tileD) {

                let walls = [];
                let wallDocuments = [];
                walls = await Tagger.getByTag([`DarknessWall-${tileD.id}`]);
                walls.forEach((wall) => {
                    wallDocuments.push(wall.document.id);
                });
                //console.log(wallDocuments);
                //console.log("Embedded document test...", canvas.scene.getEmbeddedDocument("Wall",wallDocuments[0]));
                if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
                    await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
                    Hooks.off("deleteTile", darknessTileDeleteHookId);
                    Hooks.off("updateTile", updateTileHookId);
                }

            });
        }


    }

    async function tollTheDead(rollData) {
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

    async function steelWindStrike(rollData, weapon, color) {
        console.log("rollData", rollData);
        let caster = canvas.tokens.get(rollData.tokenId);
        console.log("Caster roll data: ", caster.actor.getRollData());
        let targets = Array.from(game.user.targets);
        let rollDataForDisplay = [];
        //let spellCastingAbility = rollData.actor.data.attributes.spellcasting;
        let dagger = "";
        if (weapon == "dagger") dagger = ".02"

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
        swordAnim = `jb2a.${weapon}.melee${dagger}.${color}`;

        await caster.document.setFlag("autorotate", "enabled", false);

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

        async function finalTeleport(caster, location){
            console.log("template: ", location);
            let adjustedLocation = {x: location.data.x - (canvas.grid.size/2), y: location.data.y - (canvas.grid.size/2)}
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
                user: game.user._id,
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
                reticle.actorSheet = rollData.actor.document.sheet;
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
            let callBolt = await (new Promise((resolve) => {
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

            if (callBolt) {
                await createTemplate(templateData);
            }
            
        }
    }
    //register module with socketlib
    ASEsocket = socketlib.registerModule("advancedspelleffects");
    //register all effect functions defined above with socketlib here
    ASEsocket.register("detectMagic", detectMagicContinous);
    ASEsocket.register("detectMagicRecursive", detectMagicRecursive);
    ASEsocket.register("fogCloudWithWalls", fogCloudWithWalls);
    ASEsocket.register("darknessWithWalls", darknessWithWalls);
    ASEsocket.register("tollTheDead", tollTheDead);
    ASEsocket.register("steelWindStrike", steelWindStrike);
});
