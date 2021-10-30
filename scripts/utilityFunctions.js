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

export function measureDistance(pointA, pointB) {
    const ray = new Ray({ x: pointA.x, y: pointA.y }, { x: pointB.x, y: pointB.y });
    const segments = [{ ray }];
    let dist = canvas.grid.measureDistances(segments, { gridSpaces: true })[0]
    return dist;
}

export function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getCenter(pos) {
    return ({ x: pos.x + (canvas.grid.size / 2), y: pos.y + (canvas.grid.size / 2) })
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