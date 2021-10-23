import { aseSocket } from "./aseSockets.js";
import * as utilFunctions from "./utilityFunctions.js";

export class concentrationHandler {

    static registerHooks() {
        Hooks.on("preDeleteActiveEffect", concentrationHandler._handleConcentration);
    }

    static async _handleConcentration(activeEffect) {
        console.log("Handling removal of Concentration: ", activeEffect);
        if (activeEffect.data.label != "Concentrating") return;
        let origin = activeEffect.data.origin?.split(".");
        if (!origin || origin?.length < 4) return false;
        let itemId = origin[5] ?? origin[3];
        let casterActor;
        let casterToken;
        let effectSource;
        if(origin[0] == "Actor"){
            casterActor = game.actors.get(origin[1]);
            casterToken = await casterActor.getActiveTokens()[0];
        }
        else{
            casterToken = canvas.tokens.get(origin[3]);
            casterActor = casterToken.actor;
        }
        effectSource = casterActor.items.get(itemId).name;
        let item = casterActor.items.filter((item) => item.name == effectSource)[0] ?? undefined;
        if (!item) return;
        let aseEnabled = item.getFlag("advancedspelleffects", 'enableASE') ?? false;
        let effectOptions = item.getFlag("advancedspelleffects", 'effectOptions') ?? {};
        if (!aseEnabled) return;
        console.log(effectSource);
        switch (effectSource) {
            case "Darkness":
                //console.log("Handling concentration removal for ASE Darknes...");
                let darknessTiles = await Tagger.getByTag(`DarknessTile-${casterActor.id}`);
                if (darknessTiles.length > 0) {
                    aseSocket.executeAsGM("deleteTiles", [darknessTiles[0].id]);
                }
                return;
            case "Detect Magic":
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
                for (let magical of magicalObjects) {
                    if (!magical.school) {
                        continue;
                    }
                    await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", false);
                    await Sequencer.EffectManager.endEffects({ name: `${magical.obj.document.id}-magicRune`, object: magical.obj });
                    await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-detectMagicAura`, object: casterToken });
                    new Sequence("Advanced Spell Effects")
                        .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                        .forUsers(users)
                        .atLocation(magical.obj)
                        .playIf(magical.distance <= 30)
                        .scale(0.25)
                        .setMustache(magical)
                        .zIndex(0)
                        .effect()
                        .file(`jb2a.magic_signs.circle.02.divination.outro.${effectOptions.auraColor}`)
                        .scale(0.2)
                        .belowTokens()
                        .attachTo(casterToken)
                        .play()
                }
                return;
            case "Call Lightning":
                let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == casterToken.id);
                //console.log("tiles to delete: ", [tiles[0].id]);
                if (stormCloudTiles.length > 0) {
                    //console.log("Removing Storm Cloud Tile...", stormCloudTiles[0].id);
                    aseSocket.executeAsGM("deleteTiles", [stormCloudTiles[0].id]);
                }
                return;
            case "Fog Cloud":
                //console.log(casterActor.id);
                let fogCloudTiles = await Tagger.getByTag(`FogCloudTile-${casterActor.id}`);
                if (fogCloudTiles.length > 0) {
                    aseSocket.executeAsGM("deleteTiles", [fogCloudTiles[0].id]);
                }
                return;
            case "Witch Bolt":
                console.log(`${casterToken.id}-witchBolt`);
                await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-witchBolt` });
                await casterToken.document.unsetFlag("advancedspelleffects", "witchBolt");
                return;
        }
        if (effectSource.includes("Summon")) {
            console.log("Detected summon concentration removal...");
            let summonedTokens = canvas.tokens.placeables.filter((token) => { return token.document.getFlag("advancedspelleffects", "summoner") == casterActor.id });
            for (const summonedToken of summonedTokens) {
                await warpgate.dismiss(summonedToken.id);
            }
            return;
        }
        console.log("ASE: Effect source not recognized...");
    }

    static async addConcentration(actor, item) {
        //console.log("item in addConcentration: ", item);
        let selfTarget = item.actor.token ? item.actor.token.object : utilFunctions.getSelfTarget(item.actor);
        if (!selfTarget)
            return;

        let concentrationName = "Concentrating";
        const inCombat = (game.combat?.turns.some(combatant => combatant.token?.id === selfTarget.id));
        const effectData = {
            changes: [],
            origin: item.uuid,
            disabled: false,
            icon: "modules/advancedspelleffects/icons/concentrate.png",
            label: concentrationName,
            duration: {},
            flags: { "advancedspelleffects": { isConcentration: item?.uuid } }
        };
        const convertedDuration = utilFunctions.convertDuration(item.data.data.duration, inCombat);
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

}