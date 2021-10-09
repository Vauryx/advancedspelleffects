import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export async function detectMagic(midiData) {
    //console.log("Detect Magic MIDI Data: ", midiData);
    let item = midiData.item;
    let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
    let actor = midiData.actor;
    let caster = canvas.tokens.get(midiData.tokenId);
    let users = [];
    let magicalObjects = [];
    let waveColor = aseFlags.waveColor ?? 'blue';
    let auraColor = aseFlags.auraColor ?? 'blue';

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