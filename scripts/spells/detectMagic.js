import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class detectMagic {

    static registerHooks() {
        Hooks.on("updateToken", detectMagic._updateToken);
        if (game.settings.get("advancedspelleffects", "preloadFiles")) {
            //console.log("Starting Preload of ASE Animate Dead...");
            Hooks.on("sequencer.ready", detectMagic._preloadAssets);
        }
    }
    static async _preloadAssets() {
        console.log('Preloading assets for ASE Detect Magic...');
        let assetDBPaths = [];
        let animateDeadItems = utilFunctions.getAllItemsNamed("Detect Magic");
        if (animateDeadItems.length > 0) {
            for (let item of animateDeadItems) {
                let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
                //console.log(aseSettings);
                let waveAnim = `jb2a.detect_magic.circle.${aseSettings.waveColor ?? 'blue'}`;
                let auraLoopAnim = `jb2a.magic_signs.circle.02.divination.loop.${aseSettings.auraColor ?? 'blue'}`;
                let auraIntroAnim = `jb2a.magic_signs.circle.02.divination.intro.${aseSettings.auraColor ?? 'blue'}`;

                if (!assetDBPaths.includes(waveAnim)) assetDBPaths.push(waveAnim);
                if (!assetDBPaths.includes(auraLoopAnim)) assetDBPaths.push(auraLoopAnim);
                if (!assetDBPaths.includes(auraIntroAnim)) assetDBPaths.push(auraIntroAnim);

                let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
                let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

                let objects = await Tagger.getByTag("magical");
                let magicalObjects = objects.map(o => {
                    return {
                        obj: o,
                        school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                        color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
                    }
                });
                for (let magical of magicalObjects) {
                    if (!magical.school) {
                        continue;
                    }
                    let runeIntroAnim = `jb2a.magic_signs.rune.${magical.school}.intro.${magical.color}`;
                    let runeLoopAnim = `jb2a.magic_signs.rune.${magical.school}.loop.${magical.color}`;
                    if (!assetDBPaths.includes(runeIntroAnim)) assetDBPaths.push(runeIntroAnim);
                    if (!assetDBPaths.includes(runeLoopAnim)) assetDBPaths.push(runeLoopAnim);
                }
            }
        }
        //console.log('DB Paths about to be preloaded...', assetDBPaths);
        //console.log('Files about to be preloaded...', assetFilePaths);
        console.log(`Preloaded ${assetDBPaths.length} assets for Detect Magic!`);
        await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
        return;
    }
    static async activateDetectMagic(midiData) {
        //console.log("Detect Magic MIDI Data: ", midiData);
        let item = midiData.item;
        let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
        let actor = midiData.actor;
        let caster = canvas.tokens.get(midiData.tokenId);
        let users = [];
        let magicalObjects = [];
        let waveColor = aseFlags.waveColor ?? 'blue';
        let auraColor = aseFlags.auraColor ?? 'blue';
        const waveSound = aseFlags.waveSound ?? "";
        const waveSoundDelay = Number(aseFlags.waveSoundDelay) ?? 0;
        const waveVolume = Number(aseFlags.waveVolume) ?? 1;

        for (const user in actor.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }

        let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
        let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

        let objects = await Tagger.getByTag("magical", { ignore: [caster] });
        magicalObjects = objects.map(o => {
            let pointA = { x: caster.data.x + (canvas.grid.size / 2), y: caster.data.y + (canvas.grid.size / 2) };
            let pointB = { x: o.x + (canvas.grid.size / 2), y: o.y + (canvas.grid.size / 2) }
            let distance = utilFunctions.measureDistance(pointA, pointB);
            return {
                delay: distance * 55,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        }).filter(o => o.distance <= 30)

        let dmSequence = new Sequence("Advanced Spell Effects")
            .sound()
            .file(waveSound)
            .volume(waveVolume)
            .delay(waveSoundDelay)
            .playIf(waveSound != "")
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

        for (let magical of magicalObjects) {
            if (!magical.school) {
                continue;
            }
            await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", true);

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
        dmSequence.play();


    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let users = [];
        for (const user in casterActor.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }
        let objects = await Tagger.getByTag("magical", { ignore: [casterToken] });
        let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
        let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
        let magicalObjects = [];

        magicalObjects = objects.map(o => {
            let pointA = { x: casterToken.data.x + (canvas.grid.size / 2), y: casterToken.data.y + (canvas.grid.size / 2) };
            let pointB = { x: o.x + (canvas.grid.size / 2), y: o.y + (canvas.grid.size / 2) }
            let distance = utilFunctions.measureDistance(pointA, pointB);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        })
        for await (let magical of magicalObjects) {
            if (!magical.school) {
                continue;
            }
            await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", false);
            await Sequencer.EffectManager.endEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
            new Sequence("Advanced Spell Effects")
                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .playIf(magical.distance <= 30)
                .scale(0.25)
                .setMustache(magical)
                .zIndex(0)
                .play()
        }
        await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-detectMagicAura`, object: casterToken });
        new Sequence("Advanced Spell Effects")
            .effect()
            .file(`jb2a.magic_signs.circle.02.divination.outro.${effectOptions.auraColor}`)
            .scale(0.2)
            .belowTokens()
            .attachTo(casterToken)
            .play()
    }

    static async _updateToken(tokenDocument, updateData) {
        //console.log("Registering Detect Magic Hook");
        if ((!updateData.x && !updateData.y)) return;
        const isGM = utilFunctions.isFirstGM();

        if (!isGM) return;
        if (tokenDocument.actor.effects.filter((effect) => effect.data.document.sourceName == "Detect Magic").length == 0) {
            return;
        }
        console.log("Is first GM: ", isGM);
        let users = [];
        for (const user in tokenDocument.actor.data.permission) {
            if (user == "default") continue;
            users.push(user);
        }
        let newPos = { x: 0, y: 0 };
        newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
        newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
        let magicalObjectsOutOfRange = [];
        let magicalObjectsInRange = [];
        let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
        let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];

        let objects = await Tagger.getByTag("magical", { ignore: [tokenDocument] });

        magicalObjectsOutOfRange = objects.map(o => {
            let pointA = { x: newPos.x + (canvas.grid.size / 2), y: newPos.y + (canvas.grid.size / 2) };
            let pointB = { x: o.x + (canvas.grid.size / 2), y: o.y + (canvas.grid.size / 2) }
            let distance = utilFunctions.measureDistance(pointA, pointB);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        }).filter(o => o.distance > 30)
        for await (let magical of magicalObjectsOutOfRange) {
            if (!magical.school) {
                continue;
            }
            new Sequence("Advanced Spell Effects")
                .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                .forUsers(users)
                .atLocation(magical.obj)
                .scale(0.25)
                .setMustache(magical)
                .zIndex(0)
                .playIf((magical.obj.document.getFlag("advancedspelleffects", "magicDetected")))
                .play()
            await magical.obj.document.setFlag("advancedspelleffects", "magicDetected", false);
            await SequencerEffectManager.endEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
        }
        magicalObjectsInRange = objects.map(o => {
            let pointA = { x: newPos.x + (canvas.grid.size / 2), y: newPos.y + (canvas.grid.size / 2) };
            let pointB = { x: o.x + (canvas.grid.size / 2), y: o.y + (canvas.grid.size / 2) }
            let distance = utilFunctions.measureDistance(pointA, pointB);
            return {
                delay: 0,
                distance: distance,
                obj: o,
                school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
            }
        }).filter(o => o.distance <= 30)

        for await (let magical of magicalObjectsInRange) {
            if (!magical.school) {
                continue;
            }
            //let runeDisplayed = Sequencer.EffectManager.getEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
            if (!magical.obj.document.getFlag("advancedspelleffects", "magicDetected")) {
                await magical.obj.document.setFlag("advancedspelleffects", "magicDetected", true);
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
    }

    static async getRequiredSettings(currFlags) {

        const detectMagicWaves = `jb2a.detect_magic.circle`;
        const detectMagicWaveColorOptions = utilFunctions.getDBOptions(detectMagicWaves);

        const detectMagicAuras = `jb2a.magic_signs.circle.02.divination.intro`;
        const detectMagicAuraColorOptions = utilFunctions.getDBOptions(detectMagicAuras);

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        animOptions.push({
            label: 'Select Wave Color: ',
            type: 'dropdown',
            options: detectMagicWaveColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.waveColor',
            flagName: 'waveColor',
            flagValue: currFlags.waveColor ?? 'blue',
        });
        soundOptions.push({
            label: 'Wave Sound: ',
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.waveSound',
            flagName: 'waveSound',
            flagValue: currFlags.waveSound ?? '',
        });
        soundOptions.push({
            label: "Wave Sound Delay: ",
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.waveSoundDelay',
            flagName: 'wakeSoundDelay',
            flagValue: currFlags.waveSoundDelay ?? 0,
        });
        soundOptions.push({
            label: "Wave Sound Volume:",
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.waveVolume',
            flagName: 'waveVolume',
            flagValue: currFlags.waveVolume ?? 1,
        });

        animOptions.push({
            label: 'Select Aura Color: ',
            type: 'dropdown',
            options: detectMagicAuraColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.auraColor',
            flagName: 'auraColor',
            flagValue: currFlags.auraColor ?? 'blue',
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }

}

