import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class detectStuff {
    constructor(data) {
        this.data = data;
        this.actor = game.actors.get(this.data.actor.id);
        this.caster = canvas.tokens.get(this.data.tokenId);
        this.users = [];
        for (const user in this.actor.data.permission) {
            if (user == "default") continue;
            if (game.users.get(user)) {
                this.users.push(user);
            }
        }
        this.item = this.data.item;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
        this.preset = this.effectOptions.preset ?? 'magic';
        switch (this.preset) {
            case 'magic':
                this.tags = [
                    "abjuration",
                    "conjuration",
                    "divination",
                    "enchantment",
                    "evocation",
                    "illusion",
                    "necromancy",
                    "transmutation"
                ];
                this.magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
                break;
            case 'goodAndEvil':
                this.tags = ["good", "evil"];
                break;
            case 'poisonAndDisease':
                this.tags = ["poison", "disease"];
                break;
            case 'custom':
                this.tags = [];
                this.customTags = [];
                for (let tag of Object.keys(this.effectOptions.tagOptions)) {
                    this.tags.push(this.effectOptions.tagOptions[tag].tagLabel);
                    this.customTags.push({
                        tagLabel: this.effectOptions.tagOptions[tag].tagLabel,
                        tagEffect: this.effectOptions.tagOptions[tag].tagEffect
                    });
                }
                break;
        }
        //console.log("Detection Spell: ", this);
    }
    static registerHooks() {
        Hooks.on("updateToken", detectStuff._updateToken);
    }
    async cast() {
        await this.castDetect();
    }

    getObjectsInRange(objects) {
        return objects.map(obj => {
            let returnObj = {};
            let pointA = { x: this.caster.data.x + (canvas.grid.size / 2), y: this.caster.data.y + (canvas.grid.size / 2) };
            let pointB = { x: obj.data.x + (canvas.grid.size / 2), y: obj.data.y + (canvas.grid.size / 2) }
            let distance = utilFunctions.measureDistance(pointA, pointB);
            returnObj["delay"] = distance * 55;
            returnObj["distance"] = distance;
            returnObj["obj"] = obj;
            let tag;
            if (this.preset == 'magic') {
                let magicSchool = Tagger.getTags(obj).find(t => this.tags.includes(t.toLowerCase())) || false
                let magicColor = Tagger.getTags(obj).find(t => this.magicalColors.includes(t.toLowerCase())) || "blue"
                returnObj["introAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.intro.${magicColor}`;
                returnObj["loopAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.loop.${magicColor}`;
                returnObj["outroAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.outro.${magicColor}`;
                tag = magicSchool;
            } else if (this.preset == 'goodAndEvil') {
                tag = Tagger.getTags(obj).find(t => this.tags.includes(t.toLowerCase())) || false;
                if (tag) {
                    if (tag == "good") {
                        returnObj["animPath"] = this.effectOptions.goodAnim;
                    } else if (tag == "evil") {
                        returnObj["animPath"] = this.effectOptions.evilAnim;
                    }
                } else {
                    returnObj["animPath"] = false;
                }
            } else if (this.preset == 'poisonAndDisease') {
                tag = Tagger.getTags(obj).find(t => this.tags.includes(t.toLowerCase())) || false;
                if (tag) {
                    if (tag == "poison") {
                        returnObj["animPath"] = this.effectOptions.poisonAnim;
                    } else if (tag == "disease") {
                        returnObj["animPath"] = this.effectOptions.diseaseAnim;
                    }
                }
                else {
                    returnObj["animPath"] = false;
                }
            } else if (this.preset == 'custom') {
                let objectTags = Tagger.getTags(obj);
                //console.log("Object Tags: ", objectTags);
                //console.log("Custom Tags: ", this.customTags);
                let customTagObject = this.customTags.filter(ct => objectTags.includes(ct.tagLabel))[0] ?? false;
                //console.log("Custom Tag Object: ", customTagObject);
                if (customTagObject) {
                    tag = customTagObject?.tagLabel ?? false;
                }
                //console.log("Custom Tag found: ", tag);
                if (tag) {
                    returnObj["animPath"] = customTagObject.tagEffect;
                } else {
                    returnObj["animPath"] = false;
                }
            }
            returnObj["tag"] = tag;
            //console.log("Return Object: ", returnObj);
            return returnObj;
        }).filter(obj => (obj.distance <= this.effectOptions.range && this.tags.includes(obj.tag)));
    }
    async castDetect() {
        const taggedObjects = Tagger.getByTag("ASE-detect", { ignore: [this.caster], caseInsensitive: true });
        let objInRange = this.getObjectsInRange(taggedObjects);
        //console.log("Tagged Objects in Range: ", objInRange);
        await aseSocket.executeAsGM("updateFlag", this.caster.id, "detectItemId", this.item.id);
        this.playAnimSequence(objInRange);

    }

    async playAnimSequence(objects) {
        const waveSound = this.effectOptions.waveSound ?? false;
        const waveSoundVolume = this.effectOptions.waveSoundVolume ?? 0.5;
        const waveSoundDelay = this.effectOptions.waveSoundDelay ?? 0;
        const waveColor = this.effectOptions.waveColor ?? "blue";
        const auraColor = this.effectOptions.auraColor ?? "blue";

        let detectedObjects = [];
        for (let obj of objects) {
            detectedObjects.push(obj.obj.id);
        }

        let sequence = new Sequence("Advanced Spell Effects")
            .sound()
            .file(waveSound)
            .volume(waveSoundVolume)
            .delay(waveSoundDelay)
            .playIf(waveSound)
            .effect(`jb2a.detect_magic.circle.${waveColor}`)
            .attachTo(this.caster)
            .belowTiles()
            .effect()
            .file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`)
            .attachTo(this.caster)
            .scale(0.2)
            .belowTokens()
            .waitUntilFinished(-1000)
            .fadeOut(1000, { ease: "easeInQuint" })
            .effect()
            .file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`)
            .attachTo(this.caster)
            .persist()
            .extraEndDuration(750)
            .fadeOut(750, { ease: "easeInQuint" })
            .scale(0.2)
            .loopProperty("sprite", "rotation", { duration: 20000, from: 0, to: 360 })
            .name(`${this.caster.id}-detectMagicAura`)
            .belowTokens();
        for (let obj of objects) {
            if (this.preset == 'magic') {
                this.playMagicalObjectAnim(obj);
            } else {
                this.playObjectAnim(obj);
            }
        }
        await aseSocket.executeAsGM("updateFlag", this.caster.id, "objectsDetected", detectedObjects);
        sequence.play();

    }

    async playObjectAnim(object) {
        new Sequence("Advanced Spell Effects")
            .effect(object.animPath)
            .fadeIn(750, { ease: "easeInQuint" })
            .name(`${object.obj.id}-magicRune`)
            .delay(object.delay)
            .forUsers(this.users)
            .attachTo(object.obj)
            .scale(0.5)
            .persist(true)
            .fadeOut(750, { ease: "easeInQuint" })
            .zIndex(1)
            .play()
    }

    async playMagicalObjectAnim(object) {
        new Sequence("Advanced Spell Effects")
            .effect(object.introAnimPath)
            .forUsers(this.users)
            .attachTo(object.obj)
            .scale(0.25)
            .delay(object.delay)
            .waitUntilFinished(-1200)
            .zIndex(0)
            .effect(object.loopAnimPath)
            .name(`${object.obj.id}-magicRune`)
            .delay(object.delay)
            .forUsers(this.users)
            .scale(0.25)
            .attachTo(object.obj)
            .persist(true)
            .waitUntilFinished(-750)
            .fadeOut(750, { ease: "easeInQuint" })
            .zIndex(1)
            .play()
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let users = [];
        for (const user in casterActor.data.permission) {
            if (user == "default") continue;
            if (game.users.get(user)) {
                users.push(user);
            }
        }
        let preset = effectOptions.preset;
        let tags = [];
        let magicalColors = [];
        let customTags = [];
        switch (preset) {
            case 'magic':
                tags = [
                    "abjuration",
                    "conjuration",
                    "divination",
                    "enchantment",
                    "evocation",
                    "illusion",
                    "necromancy",
                    "transmutation"
                ];
                magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
                break;
            case 'goodAndEvil':
                tags = ["good", "evil"];
                break;
            case 'poisonAndDisease':
                tags = ["poison", "disease"];
                break;
            case 'custom':
                tags = [];
                customTags = [];
                for (let tag of Object.keys(effectOptions.tagOptions)) {
                    tags.push(effectOptions.tagOptions[tag].tagLabel);
                    customTags.push({
                        tagLabel: effectOptions.tagOptions[tag].tagLabel,
                        tagEffect: effectOptions.tagOptions[tag].tagEffect
                    });
                }
                break;
        }
        const taggedObjects = Tagger.getByTag("ASE-detect", { ignore: [casterToken], caseInsensitive: true });

        let detectedObjectsIDs = casterToken.document.getFlag("advancedspelleffects", "objectsDetected");
        await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-detectMagicAura`, object: casterToken });
        new Sequence("Advanced Spell Effects")
            .effect()
            .file(`jb2a.magic_signs.circle.02.divination.outro.${effectOptions.auraColor}`)
            .scale(0.2)
            .belowTokens()
            .attachTo(casterToken)
            .play()
        for await (let id of detectedObjectsIDs) {
            let object = canvas.scene.tiles.get(id)
                || canvas.scene.tokens.get(id)
                || canvas.scene.drawings.get(id)
                || canvas.scene.walls.get(id)
                || canvas.scene.lights.get(id)
                || game.scenes.get(id)
                || game.users.get(id);
            let pointA = { x: casterToken.data.x + (canvas.grid.size / 2), y: casterToken.data.y + (canvas.grid.size / 2) };
            let pointB = { x: object.data.x + (canvas.grid.size / 2), y: object.data.y + (canvas.grid.size / 2) }
            let distance = utilFunctions.measureDistance(pointA, pointB);
            if (object) {
                if (preset == 'magic') {
                    let magicSchool = Tagger.getTags(object).find(t => tags.includes(t.toLowerCase())) || false;
                    let magicColor = Tagger.getTags(object).find(t => magicalColors.includes(t.toLowerCase())) || "blue";
                    await Sequencer.EffectManager.endEffects({ name: `${id}-magicRune` });
                    new Sequence("Advanced Spell Effects")
                        .effect(`jb2a.magic_signs.rune.${magicSchool}.outro.${magicColor}`)
                        .forUsers(users)
                        .attachTo(object.id)
                        .playIf(distance <= 30)
                        .scale(0.25)
                        .zIndex(0)
                        .play();
                } else {
                    await Sequencer.EffectManager.endEffects({ name: `${id}-magicRune` });
                }
            }
        }
        await aseSocket.executeAsGM("removeFlag", casterToken.id, "objectsDetected");
    }

    static async _updateToken(tokenDocument, updateData) {

        if ((!updateData.x && !updateData.y)) return;


        const isGM = utilFunctions.isFirstGM();
        if (!isGM) return;


        const itemId = tokenDocument.getFlag("advancedspelleffects", "detectItemId");
        if (!itemId) return;


        let item = tokenDocument._actor?.items?.get(itemId) ?? game.items.get(itemId) ?? false;
        if (!item) return;


        if (tokenDocument.actor.effects.filter(async (effect) => {
            let effectItem = await fromUuid(effect.data.origin);
            return effectItem.name == item.name;
        }).length == 0) {
            return;
        }

        const effectOptions = item.getFlag('advancedspelleffects', 'effectOptions');
        let newPos = { x: 0, y: 0 };
        newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
        newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
        let users = [];
        for (const user in tokenDocument.actor.data.permission) {
            if (user == "default") continue;
            if (game.users.get(user)) {
                users.push(user);
            }
        }

        let preset = effectOptions.preset;
        let tags = [];
        let magicalColors = [];
        let customTags = [];
        let taggedObjects;
        switch (preset) {
            case 'magic':
                tags = [
                    "abjuration",
                    "conjuration",
                    "divination",
                    "enchantment",
                    "evocation",
                    "illusion",
                    "necromancy",
                    "transmutation"
                ];
                magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
                break;
            case 'goodAndEvil':
                tags = ["good", "evil"];
                break;
            case 'poisonAndDisease':
                tags = ["poison", "disease"];
                break;
            case 'custom':
                tags = [];
                customTags = [];
                for (let tag of Object.keys(effectOptions.tagOptions)) {
                    tags.push(effectOptions.tagOptions[tag].tagLabel);
                    customTags.push({
                        tagLabel: effectOptions.tagOptions[tag].tagLabel,
                        tagEffect: effectOptions.tagOptions[tag].tagEffect
                    });
                }
                break;
        }
        taggedObjects = Tagger.getByTag("ASE-detect",
            { caseInsensitive: true });
        let detectedObjects = taggedObjects.map(obj => {
            let returnObj = {};
            let pointA = { x: newPos.x + (canvas.grid.size / 2), y: newPos.y + (canvas.grid.size / 2) };
            let pointB = { x: obj.data.x + (canvas.grid.size / 2), y: obj.data.y + (canvas.grid.size / 2) };
            let distance = utilFunctions.measureDistance(pointA, pointB);
            returnObj["delay"] = 0;
            returnObj["distance"] = distance;
            returnObj["obj"] = obj;
            let tag;
            if (preset == 'magic') {
                let magicSchool = Tagger.getTags(obj).find(t => tags.includes(t.toLowerCase())) || false
                let magicColor = Tagger.getTags(obj).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
                returnObj["introAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.intro.${magicColor}`;
                returnObj["loopAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.loop.${magicColor}`;
                returnObj["outroAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.outro.${magicColor}`;
                tag = magicSchool;
            } else if (preset == 'goodAndEvil') {
                tag = Tagger.getTags(obj).find(t => tags.includes(t.toLowerCase())) || false;
                if (tag) {
                    if (tag == "good") {
                        returnObj["animPath"] = effectOptions.goodAnim;
                    } else if (tag == "evil") {
                        returnObj["animPath"] = effectOptions.evilAnim;
                    }
                } else {
                    returnObj["animPath"] = false;
                }
            } else if (preset == 'poisonAndDisease') {
                tag = Tagger.getTags(obj).find(t => tags.includes(t.toLowerCase())) || false;
                if (tag) {
                    if (tag == "poison") {
                        returnObj["animPath"] = effectOptions.poisonAnim;
                    } else if (tag == "disease") {
                        returnObj["animPath"] = effectOptions.diseaseAnim;
                    }
                }
                else {
                    returnObj["animPath"] = false;
                }
            } else if (preset == 'custom') {
                let objectTags = Tagger.getTags(obj);
                //console.log("Object Tags: ", objectTags);
                //console.log("Custom Tags: ", customTags);
                let customTagObject = customTags.filter(ct => objectTags.includes(ct.tagLabel))[0] ?? false;
                //console.log("Custom Tag Object: ", customTagObject);
                if (customTagObject) {
                    tag = customTagObject?.tagLabel ?? false;
                }
                //console.log("Custom Tag found: ", tag);
                if (tag) {
                    returnObj["animPath"] = customTagObject.tagEffect;
                } else {
                    returnObj["animPath"] = false;
                }
            }
            returnObj["tag"] = tag;
            //console.log("Return Object: ", returnObj);
            return returnObj;
        }).filter(obj => (tags.includes(obj.tag)));;



        let detectedObjectsOutOfRange = detectedObjects.filter(o => o.distance > effectOptions.range);
        let detectedObjectsInRange = detectedObjects.filter(o => o.distance <= effectOptions.range);
        let detectedObjectsIDs = tokenDocument.getFlag("advancedspelleffects", "objectsDetected");
        //handle out of range objects
        for await (let detectedObj of detectedObjectsOutOfRange) {
            if (preset == 'magic') {
                await Sequencer.EffectManager.endEffects({ name: `${detectedObj.obj.id}-magicRune` });
                new Sequence("Advanced Spell Effects")
                    .effect(detectedObj.outroAnimPath)
                    .forUsers(users)
                    .playIf(detectedObjectsIDs.includes(detectedObj.obj.id))
                    .attachTo(detectedObj.obj.id)
                    .scale(0.25)
                    .zIndex(0)
                    .play();
            } else {
                await Sequencer.EffectManager.endEffects({ name: `${detectedObj.obj.id}-magicRune` });
            }
        }
        //remove id of each detectedObjectOutOfRange from detectedObjectsIDs
        for (let detectedObj of detectedObjectsOutOfRange) {
            detectedObjectsIDs = detectedObjectsIDs.filter(id => id != detectedObj.obj.id) ?? [];
        }
        await aseSocket.executeAsGM("updateFlag", tokenDocument.id, "objectsDetected", detectedObjectsIDs);

        //handle in range objects
        for await (let detectedObj of detectedObjectsInRange) {
            if (detectedObjectsIDs.includes(detectedObj.obj.id)) {
                continue;
            }
            if (preset == 'magic') {
                new Sequence("Advanced Spell Effects")
                    .effect(detectedObj.introAnimPath)
                    .forUsers(users)
                    .attachTo(detectedObj.obj)
                    .scale(0.25)
                    .delay(detectedObj.delay)
                    .waitUntilFinished(-1200)
                    .zIndex(0)
                    .effect(detectedObj.loopAnimPath)
                    .name(`${detectedObj.obj.id}-magicRune`)
                    .delay(detectedObj.delay)
                    .forUsers(users)
                    .scale(0.25)
                    .attachTo(detectedObj.obj)
                    .persist(true)
                    .waitUntilFinished(-750)
                    .fadeOut(750, { ease: "easeInQuint" })
                    .zIndex(1)
                    .play()
            } else {
                new Sequence("Advanced Spell Effects")
                    .effect(detectedObj.animPath)
                    .fadeIn(750, { ease: "easeInQuint" })
                    .name(`${detectedObj.obj.id}-magicRune`)
                    .delay(detectedObj.delay)
                    .forUsers(users)
                    .scale(0.5)
                    .attachTo(detectedObj.obj)
                    .persist(true)
                    .fadeOut(750, { ease: "easeInQuint" })
                    .zIndex(1)
                    .play()
            }
        }
        //add id of each detectedObjectInRange to detectedObjectsIDs if not already in it
        for (let detectedObj of detectedObjectsInRange) {
            if (!detectedObjectsIDs.includes(detectedObj.obj.id)) {
                detectedObjectsIDs.push(detectedObj.obj.id);
            }
        }
        await aseSocket.executeAsGM("updateFlag", tokenDocument.id, "objectsDetected", detectedObjectsIDs);

    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const detectMagicWaves = `jb2a.detect_magic.circle`;
        const detectMagicWaveColorOptions = utilFunctions.getDBOptions(detectMagicWaves);

        const detectMagicAuras = `jb2a.magic_signs.circle.02.divination.intro`;
        const detectMagicAuraColorOptions = utilFunctions.getDBOptions(detectMagicAuras);

        const detectPresetAnims = 'jb2a.icon';
        const detectPresetAnimOptions = utilFunctions.getDBOptionsIcons(detectPresetAnims);

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        const presetOptions = {
            "magic": 'Detect Magic',
            "goodAndEvil": 'Detect Good and Evil',
            "poisonAndDisease": 'Detect Poison and Disease',
            "custom": 'Custom'
        };

        spellOptions.push({
            label: game.i18n.localize("ASE.DetectPresetsLabel"),
            type: 'dropdown',
            options: presetOptions,
            name: 'flags.advancedspelleffects.effectOptions.preset',
            flagName: 'preset',
            flagValue: currFlags.preset ?? 'magic',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DetectRangeLabel"),
            tooltip: game.i18n.localize("ASE.DetectRangeTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.range',
            flagName: 'range',
            flagValue: currFlags.range ?? 30,
        });


        /* spellOptions.push({
             label: game.i18n.localize("ASE.DetectTagsLabel"),
             tooltip: game.i18n.localize("ASE.DetectTagsTooltip"),
             type: 'textInput',
             name: 'flags.advancedspelleffects.effectOptions.tags',
             flagName: 'tags',
             flagValue: currFlags.tags ?? '',
         });*/

        animOptions.push({
            label: game.i18n.localize("ASE.DetectWaveColorLabel"),
            type: 'dropdown',
            options: detectMagicWaveColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.waveColor',
            flagName: 'waveColor',
            flagValue: currFlags.waveColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DetectWaveSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.waveSound',
            flagName: 'waveSound',
            flagValue: currFlags.waveSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DetectWaveSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.waveSoundDelay',
            flagName: 'wakeSoundDelay',
            flagValue: currFlags.waveSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DetectWaveSoundVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.waveVolume',
            flagName: 'waveVolume',
            flagValue: currFlags.waveVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.DetectAuraColorLabel"),
            type: 'dropdown',
            options: detectMagicAuraColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.auraColor',
            flagName: 'auraColor',
            flagValue: currFlags.auraColor ?? 'blue',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.DetectGoodAnimLabel"),
            tooltip: game.i18n.localize("ASE.DetectGoodAnimTooltip"),
            type: 'dropdown',
            options: detectPresetAnimOptions,
            name: 'flags.advancedspelleffects.effectOptions.goodAnim',
            flagName: 'goodAnim',
            flagValue: currFlags.goodAnim ?? 'jb2a.icon.runes03.yellow',
        });
        animOptions.push({
            label: game.i18n.localize("ASE.DetectEvilAnimLabel"),
            tooltip: game.i18n.localize("ASE.DetectEvilAnimTooltip"),
            type: 'dropdown',
            options: detectPresetAnimOptions,
            name: 'flags.advancedspelleffects.effectOptions.evilAnim',
            flagName: 'evilAnim',
            flagValue: currFlags.evilAnim ?? 'jb2a.icon.runes03.dark_black',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.DetectPoisonAnimLabel"),
            tooltip: game.i18n.localize("ASE.DetectPoisonAnimTooltip"),
            type: 'dropdown',
            options: detectPresetAnimOptions,
            name: 'flags.advancedspelleffects.effectOptions.poisonAnim',
            flagName: 'poisonAnim',
            flagValue: currFlags.poisonAnim ?? 'jb2a.icon.poison.dark_green',
        });
        animOptions.push({
            label: game.i18n.localize("ASE.DetectDiseaseAnimLabel"),
            tooltip: game.i18n.localize("ASE.DetectDiseaseAnimTooltip"),
            type: 'dropdown',
            options: detectPresetAnimOptions,
            name: 'flags.advancedspelleffects.effectOptions.diseaseAnim',
            flagName: 'diseaseAnim',
            flagValue: currFlags.diseaseAnim ?? 'jb2a.icon.poison.purple',
        });
        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}