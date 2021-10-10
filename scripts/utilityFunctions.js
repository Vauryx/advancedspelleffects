export function checkModules() {
    let error = false;

    if (!(game.modules.get("jb2a_patreon"))) {
        error = `You need to have JB2A's patreon only module installed to cast this spell!`;
    }
    if (!game.modules.get("advanced-macros")?.active) {
        let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
        error = `You need to have Advanced Macros ${installed} to cast this spell!`;
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