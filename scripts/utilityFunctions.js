export async function createFolderWithActors(folderName, actorNames) {

    let folder = game.folders?.getName(folderName);

    if (!folder) {
        folder = await Folder.create({
            name: folderName,
            type: 'Actor',
            color: "#646cdd",
            parent: null
        });
    }

    const folderId = folder.id;

    const monsterPack = game.packs.get("dnd5e.monsters");

    if (!monsterPack) return [];

    // Loop through each actor name and try to find them in the D&D 5e monsters compendia
    const actors = [];
    for (const name of actorNames) {

        const creature = await monsterPack.getDocuments({ "name": name })

        if (!creature.length) continue
        actors.push(await Actor.create({
            ...creature[0].toObject(),
            folder: folderId
        }));
    }

    return actors;

}

export function checkModules() {
    let error = false;

    if (!game.modules.get("jb2a_patreon")?.active) {
        let installed = game.modules.get("jb2a_patreon") && !game.modules.get("jb2a_patreon").active ? "enabled" : "installed";
        error = `You need to have the JB2A Patreon module ${installed} to cast this spell!`;
    }

    if (!game.modules.get("socketlib")?.active) {
        let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
        error = `You need to have SocketLib ${installed} to cast this spell!`;
    }
    if (!game.modules.get("tagger")?.active) {
        let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
        error = `You need to have Tagger${installed} to cast this spell!`;
    }
    if (!game.modules.get("sequencer")?.active) {
        let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
        error = `You need to have Sequencer ${installed} to cast this spell!`;
    }
    if (!game.modules.get("warpgate")?.active) {
        let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
        error = `You need to have Warpgate ${installed} to cast this spell!`;
    }

    return error;
}

export function getDistanceClassic(pointA, pointB) {
    return Math.sqrt(Math.pow((pointA.x - pointB.x), 2) + Math.pow((pointA.y - pointB.y), 2));
}

export function measureDistance(pointA, pointB) {
    const ray = new Ray({ x: pointA.x, y: pointA.y }, { x: pointB.x, y: pointB.y });
    const segments = [{ ray }];
    let dist = canvas.grid.measureDistances(segments, { gridSpaces: true })[0]
    return dist;
}

export function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function strikeThrough(text) {
    return text
        .split('')
        .map(char => char + '\u0336')
        .join('')
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getRandomColor(type) {
    let color = rgbToHex(getRandomInt(0, 155), getRandomInt(0, 155), getRandomInt(0, 155));
    if (type == "0x") {
        return color;
    } else if (type == "#") {
        return "#" + color.substring(2);
    }
    return color;
}

export function convertColorHexTo0x(color) {
    return "0x" + color.substring(1);
}

export function convertColor0xToHex(color) {
    return "#" + color.substring(2);
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getCenter(pos, width = 1) {
    return ({ x: pos.x + ((canvas.grid.size / 2) * width), y: pos.y + ((canvas.grid.size / 2) * width) });
}

export function getTileCenter(tile) {
    //return position offset by tile width/2 and height/2
    return ({ x: tile.x + (tile.width / 2), y: tile.y + (tile.height / 2) })
}

export async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function convertDuration(itemDuration, inCombat) {
    // TAKEN FROM DYNAMIC ACTIVE EFFECTS --
    const useTurns = inCombat && game.modules.get("times-up")?.active;;
    if (!itemDuration)
        return { type: "seconds", seconds: 0, rounds: 0, turns: 0 };
    if (!game.modules.get("times-up")?.active) {
        switch (itemDuration.units) {
            case "turn":
            case "turns": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: itemDuration.value };
            case "round":
            case "rounds": return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value * CONFIG.time.roundTime, rounds: itemDuration.value, turns: 0 };
            case "second":
            case "seconds":
                return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value, rounds: itemDuration.value / CONFIG.time.roundTime, turns: 0 };
            case "minute":
            case "minutes":
                let durSeconds = itemDuration.value * 60;
                if (durSeconds / CONFIG.time.roundTime <= 10) {
                    return { type: useTurns ? "turns" : "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
                }
                else {
                    return { type: "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
                }
            case "hour":
            case "hours": return { type: "seconds", seconds: itemDuration.value * 60 * 60, rounds: 0, turns: 0 };
            case "day":
            case "days": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24, rounds: 0, turns: 0 };
            case "week":
            case "weeks": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 7, rounds: 0, turns: 0 };
            case "month":
            case "months": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 30, rounds: 0, turns: 0 };
            case "year":
            case "years": return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 30 * 365, rounds: 0, turns: 0 };
            case "inst": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: 1 };
            default:
                console.warn("dae | unknown time unit found", itemDuration.units);
                return { type: useTurns ? "none" : "seconds", seconds: undefined, rounds: undefined, turns: undefined };
        }
    }
    else {
        switch (itemDuration.units) {
            case "turn":
            case "turns": return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: itemDuration.value };
            case "round":
            case "rounds": return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value * CONFIG.time.roundTime, rounds: itemDuration.value, turns: 0 };
            case "second": return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value, rounds: itemDuration.value / CONFIG.time.roundTime, turns: 0 };
            default:
                let interval = {};
                interval[itemDuration.units] = itemDuration.value;
                //@ts-ignore
                const durationSeconds = window.SimpleCalendar.api.timestampPlusInterval(game.time.worldTime, interval) - game.time.worldTime;
                if (durationSeconds / CONFIG.time.roundTime <= 10) {
                    return { type: useTurns ? "turns" : "seconds", seconds: durationSeconds, rounds: Math.floor(durationSeconds / CONFIG.time.roundTime), turns: 0 };
                }
                else {
                    return { type: "seconds", seconds: durationSeconds, rounds: Math.floor(durationSeconds / CONFIG.time.roundTime), turns: 0 };
                }
            //      default: return {type: combat ? "none" : "seconds", seconds: CONFIG.time.roundTime, rounds: 0, turns: 1};
        }
    }
}

export function getSelfTarget(actor) {
    if (actor.token)
        return actor.token;
    const speaker = ChatMessage.getSpeaker({ actor });
    if (speaker.token)
        return canvas.tokens?.get(speaker.token);
    return new CONFIG.Token.documentClass(actor.getTokenData(), { actor });
}

export function getAssetFilePaths(assetDBPaths) {
    let assetFilePaths = [];
    //console.log(assetDBPaths);
    for (let DBPath of assetDBPaths) {
        //console.log(DBPath);
        let sequencesUnderPath = Sequencer.Database.getEntry(DBPath).constructor === Array ? Sequencer.Database.getEntry(DBPath) : [Sequencer.Database.getEntry(DBPath)];
        //console.log(sequencesUnderPath);
        for (let sequence of sequencesUnderPath) {
            //console.log(sequence);
            if (typeof sequence === "string") {
                //console.log(sequencesUnderPath);
                assetFilePaths.push(sequence);
            }
            else if (typeof sequence.file === "string") {
                //console.log(sequencesUnderPath.file);
                assetFilePaths.push(sequence.file);
            }
            else {
                // iterate over sequencer.file using for...in
                //console.log(sequence);
                for (let file in sequence.file) {
                    //console.log('Sequence under path not a string: ', file);
                    if (sequence.file[file].constructor === Array) {
                        for (let filePath of sequence.file[file]) {
                            //console.log(filePath);
                            assetFilePaths.push(filePath);
                        }
                    }
                    else {
                        //console.log(sequence.file[file]);
                        assetFilePaths.push(sequence.file[file]);
                    }
                }
            }

        }
    }

    return assetFilePaths;
}

export function getAllItemsNamed(name) {
    let actors = game.actors.contents;
    let scenes = game.scenes.contents;
    let itemsWithName = [];
    for (let actor of actors) {
        let items = actor.items.filter(item => item.name == name && item.data.flags.advancedspelleffects?.enableASE);
        items.forEach(item => {
            itemsWithName.push(item);
        });
    }
    for (let scene of scenes) {
        let tokensInScene = Array.from(scene.tokens);
        tokensInScene.forEach(token => {
            let items = token.actor.items.filter(item => item.name == name && item.data.flags.advancedspelleffects?.enableASE);
            items.forEach(item => {
                itemsWithName.push(item);
            });
        });
    }
    return itemsWithName;
}

function firstGM() {
    return game.users.find(u => u.isGM && u.active);
}

export function isFirstGM() {
    return game.user.id === firstGM()?.id;
}

export function getDBOptions(rawSet) {
    let options = {};
    let setOptions = Sequencer.Database.getPathsUnder(rawSet);
    if (setOptions) {
        setOptions.forEach((elem) => {
            options[elem] = capitalizeFirstLetter(elem);
        });
        //console.log(options);
    }
    return options;
}
export function getDBOptionsIcons(rawSet) {
    let options = {};
    const seqFiles = Sequencer.Database.getEntry(rawSet);
    if (seqFiles.length > 0) {
        seqFiles.forEach((elem) => {
            options[elem.dbPath] = elem.dbPath.substring(10);
        });
    }
    return options;
}

export function isMidiActive() {
    if (game.modules.get("midi-qol")?.active) {
        return true;
    }
    return false;
}

export function getContainedCustom(tokenD, crosshairs) {
    let tokenCenter = getCenter(tokenD.data, tokenD.data.width);
    let tokenCrosshairsDist = canvas.grid.measureDistance(tokenCenter, crosshairs);
    let crosshairsDistance = crosshairs.data?.distance ?? crosshairs.distance;
    //console.log(`Crosshairs distance: ${crosshairsDistance}`);
    let distanceRequired = (crosshairsDistance - 2.5) + (2.5 * tokenD.data.width);
    if ((tokenCrosshairsDist) < distanceRequired) {
        return true;
    }
    else {
        return false;
    }
}
export async function checkCrosshairs(crosshairs) {
    //console.log(crosshairs);
    let collected;
    while (crosshairs.inFlight) {
        //wait for initial render
        await warpgate.wait(100);
        /* set default tint */
        collected = warpgate.crosshairs.collect(crosshairs, ['Token'], getContainedCustom)['Token'];
        let tokensOutOfRange = canvas.tokens.placeables.filter(token => {
            return !collected.find(t => t.id === token.id);
        });
        crosshairs.label = `${collected.length} targets`;
        for await (let tokenD of collected) {
            let token = canvas.tokens.get(tokenD.id);
            //console.log(token);
            let markerEffect = 'jb2a.ui.indicator.red.01.01';
            let markerApplied = Sequencer.EffectManager.getEffects({ name: `ase-crosshairs-marker-${token.id}` });
            if (markerApplied.length == 0) {
                new Sequence()
                    .effect()
                    .file(markerEffect)
                    .atLocation(token)
                    .scale(0.5)
                    .offset({ y: 100 })
                    .mirrorY()
                    .persist()
                    .name(`ase-crosshairs-marker-${token.id}`)
                    .play();
            }
        }
        for await (let token of tokensOutOfRange) {
            let markerApplied = Sequencer.EffectManager.getEffects({ name: `ase-crosshairs-marker-${token.id}` });
            if (markerApplied.length > 0) {
                Sequencer.EffectManager.endEffects({ name: `ase-crosshairs-marker-${token.id}` });
            }
        }
    }
}

export function cleanUpTemplateGridHighlights() {
    const ASETemplates = canvas.scene.templates.filter((template) => { return template.data.flags.advancedspelleffects });
    for (let template of ASETemplates) {
        const highlight = canvas.grid.getHighlightLayer(`Template.${template.id}`);
        if (highlight) {
            highlight.clear();
        }
    }
}
// function to detect when a line crosses another line
export function lineCrossesLine(a, b, c, d) {
    const aSide = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x) > 0;
    const bSide = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x) > 0;
    const cSide = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
    const dSide = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x) > 0;
    //console.log(aSide, bSide, cSide, dSide);
    return aSide !== bSide && cSide !== dSide;
};

export function lineCrossesCircle(pointA, pointB, circleCenter, radius) {


    const x = circleCenter.x;
    const y = circleCenter.y;
    const x1 = pointA.x;
    const y1 = pointA.y;
    const x2 = pointB.x;
    const y2 = pointB.y;

    let A = x - x1;
    let B = y - y1;
    let C = x2 - x1;
    let D = y2 - y1;

    let dot = A * C + B * D;
    let len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0)
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    let dx = x - xx;
    let dy = y - yy;
    let distanceToLine = Math.sqrt(dx * dx + dy * dy);
    //return true if distanceToLine < radius and at least one point is outside the circle grid y increases downwards
    return distanceToLine < radius && (Math.abs(x - x1) > radius || Math.abs(y - y1) > radius || Math.abs(x - x2) > radius || Math.abs(y - y2) > radius);
}

export function isPointOnLeft(a, b, c) {
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
}

export function isPointNearLine(linePointA, linePointB, checkPoint, range) {

    const x = checkPoint.x;
    const y = checkPoint.y;
    const x1 = linePointA.x;
    const y1 = linePointA.y;
    const x2 = linePointB.x;
    const y2 = linePointB.y;

    let A = x - x1;
    let B = y - y1;
    let C = x2 - x1;
    let D = y2 - y1;

    let dot = A * C + B * D;
    let len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0)
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    let dx = x - xx;
    let dy = y - yy;
    let distanceToLine = Math.sqrt(dx * dx + dy * dy);
    return distanceToLine <= range;
}

export function isPointInCircle(circleCenter, checkPoint, insideRange, outsideRange) {
    const x = circleCenter.x;
    const y = circleCenter.y;
    const x1 = checkPoint.x;
    const y1 = checkPoint.y;

    let dx = x - x1;
    let dy = y - y1;
    let distanceToPoint = Math.sqrt(dx * dx + dy * dy);
    //console.log('distance: ', distanceToPoint);
    return distanceToPoint > insideRange && distanceToPoint < outsideRange;
}

export function getCanvasMouse() {
    return game.release.generation === 11 ? canvas.app.renderer.plugins.interaction.pointer : canvas.app.renderer.plugins.interaction.mouse;
}