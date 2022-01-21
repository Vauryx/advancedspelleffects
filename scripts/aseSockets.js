import * as utilFunctions from "./utilityFunctions.js";

export var aseSocket = undefined;

export function setupASESocket() {

    if (game.modules.get("socketlib")?.active) {
        aseSocket = window.socketlib.registerModule("advancedspelleffects");
        aseSocket.register("placeTiles", placeTiles);
        aseSocket.register("placeWalls", placeWalls);
        aseSocket.register("deleteTiles", deleteTiles);
        aseSocket.register("updateFlag", updateFlag);
        aseSocket.register("removeFlag", removeFlag);
        aseSocket.register("moveWalls", moveWalls);
        aseSocket.register("moveTile", moveTile);
        aseSocket.register("fadeTile", fadeTile);
        aseSocket.register("placeSounds", placeSounds);
        aseSocket.register("moveSound", moveSound);
        aseSocket.register("updateDocument", updateDocument);
        aseSocket.register("checkGMAlwaysAccept", checkGMAlwaysAccept);
    }
};

async function checkGMAlwaysAccept() {

    const alwaysAccept = game.settings.get("warpgate", "alwaysAccept");
    console.log("GM Always Accept: ", alwaysAccept);
    if (!alwaysAccept) {
        ui.notifications.info("Warpgate 'Always Accept' is disabled. You must manually accept the mutation.");
    }
}

async function updateDocument(objectId, updateData) {
    let object = canvas.scene.tiles.get(objectId)
        || canvas.scene.tokens.get(objectId)
        || canvas.scene.drawings.get(objectId)
        || canvas.scene.walls.get(objectId)
        || canvas.scene.lights.get(objectId)
        || game.scenes.get(objectId)
        || game.users.get(objectId)
        || game.actors.get(objectId);
    await object.update(updateData, { animate: false });
}

async function updateFlag(objectId, flag, value) {
    let object = canvas.scene.tiles.get(objectId)
        || canvas.scene.tokens.get(objectId)
        || canvas.scene.drawings.get(objectId)
        || canvas.scene.walls.get(objectId)
        || canvas.scene.lights.get(objectId)
        || game.scenes.get(objectId)
        || game.users.get(objectId);
    await object.setFlag("advancedspelleffects", flag, value);
}

async function removeFlag(objectId, flag) {
    let object = canvas.scene.tiles.get(objectId)
        || canvas.scene.tokens.get(objectId)
        || canvas.scene.drawings.get(objectId)
        || canvas.scene.walls.get(objectId)
        || canvas.scene.lights.get(objectId)
        || game.scenes.get(objectId)
        || game.users.get(objectId);
    await object.unsetFlag("advancedspelleffects", flag);
}

async function placeTiles(tileData) {
    return (await canvas.scene.createEmbeddedDocuments("Tile", tileData));
}

async function deleteTiles(tileIds) {
    await canvas.scene.deleteEmbeddedDocuments("Tile", tileIds);
}

async function moveTile(newLocation, tileId) {
    let tile = canvas.scene.tiles.get(tileId);
    const distance = utilFunctions.getDistanceClassic({ x: tile.data.x + canvas.grid.size, y: tile.data.y + canvas.grid.size }, { x: newLocation.x, y: newLocation.y });
    //console.log('Distance: ', distance);

    const moveSpeed = Math.floor(distance / 50);
    //console.log('Move Speed: ', moveSpeed);

    let moveTileSeq = new Sequence("Advanced Spell Effects")
        .animation()
        .on(tile)
        .moveTowards(newLocation, { ease: "easeInOutQuint" })
        .offset({ x: -canvas.grid.size, y: -canvas.grid.size })
        .moveSpeed(moveSpeed)
    await moveTileSeq.play();


}

async function fadeTile(fade, tileId) {
    //console.log("Fading in Moonbeam Tile...");
    let tile = canvas.scene.tiles.get(tileId);
    if (!tile) {
        ui.notifications.error(game.i18n.localize("ASE.TileNotFound"));
        return;
    }
    let fadeTileSeq = new Sequence("Advanced Spell Effects")
        .animation()
        .on(tile);
    if (fade.type == "fadeIn") {
        fadeTileSeq.fadeIn(fade.duration);
    }
    else if (fade.type == "fadeOut") {
        fadeTileSeq.fadeOut(fade.duration);
    }

    await fadeTileSeq.play();

}

async function placeWalls(wallData) {
    return (await canvas.scene.createEmbeddedDocuments("Wall", wallData));
}

async function moveWalls(tileId, wallType, numWalls) {
    let tileD = await canvas.scene.tiles.get(tileId);
    let placedX = tileD.data.x + (tileD.data.width / 2);
    let placedY = tileD.data.y + (tileD.data.height / 2);
    let outerCircleRadius = tileD.data.width / 2.2;
    let wall_angles = 2 * Math.PI / numWalls;
    let walls = [];
    let wallDocuments = [];
    let wallPoints = [];

    walls = await Tagger.getByTag([`${wallType}Wall-${tileD.id}`]);
    walls.forEach((wall) => {
        wallDocuments.push(wall.id);
    });
    walls = [];
    if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
        await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
        for (let i = 0; i < numWalls; i++) {
            let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
            let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
            wallPoints.push({ x: x, y: y });
        }
        for (let i = 0; i < wallPoints.length; i++) {
            if (i < wallPoints.length - 1) {
                walls.push({
                    c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                    flags: { tagger: { tags: [`${wallType}Wall-${tileD.id}`] } },
                    move: 0
                })
            }
            else {
                walls.push({
                    c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                    flags: { tagger: { tags: [`${wallType}Wall-${tileD.id}`] } },
                    move: 0
                })
            }
        }

    }
    await canvas.scene.createEmbeddedDocuments("Wall", walls);
}

async function placeSounds(soundData, delay) {
    await warpgate.wait(delay);
    return (await canvas.scene.createEmbeddedDocuments("AmbientSound", soundData));
}

async function moveSound(sourceId, newLoc) {
    let source = canvas.scene.tiles.get(sourceId)
        || canvas.scene.tokens.get(sourceId);
    if (!source) {
        ui.notifications.error(game.i18n.localize("ASE.SoundSourceNotFound"));
        return;
    }
    if (source.getFlag("advancedspelleffects", "moving")) {
        return;
    }
    const attachedSounds = (await Tagger.getByTag([`ase-source-${sourceId}`]));
    if (!attachedSounds.length > 0) {
        ui.notifications.error(game.i18n.localize("ASE.SoundNotFound"));
        return;
    }
    const oldSoundData = attachedSounds[0].data;
    //console.log('Old Sound Data: ', oldSoundData);
    const sourceWidth = source.data.hitArea?.width || source.data.width;
    const sourceHeight = source.data.hitArea?.height || source.data.height;
    const newSoundData = [{
        easing: oldSoundData.easing,
        path: oldSoundData.path,
        radius: oldSoundData.radius,
        type: oldSoundData.type,
        volume: oldSoundData.volume,
        x: newLoc.x,
        y: newLoc.y,
        flags: oldSoundData.flags
    }];
    //console.log('New Sound Data: ', newSoundData);
    if (oldSoundData.x != newSoundData[0].x || oldSoundData.y != newSoundData[0].y) {
        await canvas.scene.createEmbeddedDocuments("AmbientSound", newSoundData);
        if (canvas.scene.getEmbeddedDocument("AmbientSound", attachedSounds[0].id)) {
            await canvas.scene.deleteEmbeddedDocuments("AmbientSound", attachedSounds.map(s => s.id));
        }
    }

}