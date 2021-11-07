import * as utilFunctions from "./utilityFunctions.js";

export var aseSocket = undefined;

export function setupASESocket() {

    if (game.modules.get("socketlib")?.active) {
        aseSocket = window.socketlib.registerModule("advancedspelleffects");
        aseSocket.register("placeTiles", placeTiles);
        aseSocket.register("placeWalls", placeWalls);
        aseSocket.register("deleteTiles", deleteTiles);
        aseSocket.register("updateFlag", updateFlag);
        aseSocket.register("moveWalls", moveWalls);
        aseSocket.register("moveTile", moveTile);
    }
};

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

async function deleteTiles(tileIds) {
    await canvas.scene.deleteEmbeddedDocuments("Tile", tileIds);
}

async function placeTiles(tileData) {
    return (await canvas.scene.createEmbeddedDocuments("Tile", tileData));
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
        wallDocuments.push(wall.document.id);
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

async function moveTile(newLocation, tileId) {
    let tile = canvas.scene.tiles.get(tileId);

    const distance = utilFunctions.getDistanceClassic({ x: tile.data.x + canvas.grid.size, y: tile.data.y + canvas.grid.size }, { x: newLocation.x, y: newLocation.y });
    console.log('Distance: ', distance);

    const moveSpeed = Math.floor(distance / 50);
    console.log('Move Speed: ', moveSpeed);

    let moveTileSeq = new Sequence("Advanced Spell Effects")
        .animation()
        .on(tile)
        .moveTowards(newLocation,{ ease: "easeInOutQuint" })
        .offset({ x: -canvas.grid.size, y: -canvas.grid.size })
        .moveSpeed(moveSpeed)
    await moveTileSeq.play();

}

