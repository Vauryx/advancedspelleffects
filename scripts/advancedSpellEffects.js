import * as utilFunctions from "./utilityFunctions.js";
import { setupASESocket } from "./aseSockets.js";
import { aseSocket } from "./aseSockets.js";
import { handleConcentration } from "./concentrationHandler.js";
// Importing spells
import { darkness } from "./spells/darkness.js";
import { detectMagic } from "./spells/detectMagic.js";
import * as callLightning from "./spells/callLightning.js";
import {fogCloud} from "./spells/fogCloud.js";

//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
    setupASESocket();
});

Hooks.on('init', () => {
    //Hook onto MIDI- roll complete to activate effects
    if (game.modules.get("midi-qol")?.active) {
        Hooks.on("midi-qol.RollComplete", (workflow) => {
            console.log("MIDI Workflow: ", workflow);
            handleASE(workflow)
        });
    }

    async function handleASE(midiData) {
        let item = midiData.item;

        let aseFlags = item?.data?.flags?.advancedspelleffects;
        if (!aseFlags.enableASE) return;

        let missingModule = utilFunctions.checkModules();
        if (missingModule) {
            ui.notifications.error(missingModule);
            return;
        }

        switch (item.name) {
            case "Darkness":
                await darkness(midiData);
                break;
            case "Detect Magic":
                await detectMagic(midiData);
                break;
            case "Call Lightning":
                if(!midiData.flavor?.includes("Lightning Bolt")){
                    await callLightning.createStormCloud(midiData);
                }
                break;
            case "Fog Cloud":
                await fogCloud(midiData);
                break;
            default:
                console.log("--SPELL NAME NOT RECOGNIZED--");
        }
    }
});

Hooks.once('ready', async function () {
    Hooks.on("deleteActiveEffect", async function (activeEffect) {
        handleConcentration(activeEffect);
    });

    Hooks.on("updateToken", async (tokenDocument, updateData, options) => {
        if ((!updateData.x && !updateData.y)) return;
        if (tokenDocument.actor.effects.filter((effect) => effect.data.document.sourceName == "Detect Magic").length == 0) {
            return;
        }
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
        for (let magical of magicalObjectsOutOfRange) {
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
            await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", false);
            SequencerEffectManager.endEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
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

        for (let magical of magicalObjectsInRange) {
            if (!magical.school) {
                continue;
            }
            let runeDisplayed = Sequencer.EffectManager.getEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
            if (!(magical.obj.document.getFlag("advancedspelleffects", "magicDetected")) && runeDisplayed.length == 0) {
                await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", true);
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
        if (stormCloudTiles.length > 0) {
            console.log("Detected Storm Cloud! Prompting for Bolt...");
            await callLightning.callLightningBolt(stormCloudTiles[0]);
        }
    });

    if (!game.user.isGM) return;

    Hooks.on("updateTile", async function (tileD) {
        let wallNum = 12;
        if (tileD.getFlag("advancedspelleffects", "fogCloudWallNum")) {
            wallNum = tileD.getFlag("advancedspelleffects", "fogCloudWallNum");
            await aseSocket.executeAsGM("moveWalls", tileD.id, 'FogCloud', wallNum);
        }
        await aseSocket.executeAsGM("moveWalls", tileD.id, 'Darkness', wallNum);
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
