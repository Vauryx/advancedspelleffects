Hooks.once('init', async function () {

    //Effect functions to be called from a macro in the "OnUseMacro" field of MIDI-QOL
    //Each function is excuted via socketlib to ensure proper permissions for the effect
    async function detectMagic(rollData) {
        socket.executeAsGM("detectMagic", rollData);
    }


    // List of effects that can be called
    game.AdvancedSpellEffects = {};
    game.AdvancedSpellEffects.detectMagic = detectMagic;
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
        for (const user in actorD.data.permission){
            if (user == "default") continue;
            users.push(user);
        }
        console.log("Visible to users: " , users);
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
                let magicalObjects = [];
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

    //register module with socketlib
    socket = socketlib.registerModule("advancedspelleffects");
    //register all effect functions defined above with socketlib here
    socket.register("detectMagic", detectMagicContinous);
});
