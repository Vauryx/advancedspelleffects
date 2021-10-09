export var aseSocket = undefined;

export function setupASESocket() {

    if (game.modules.get("socketlib")?.active) {
        aseSocket = window.socketlib.registerModule("advancedspelleffects");
        aseSocket.register("placeTiles", placeTiles);
        aseSocket.register("placeWalls", placeWalls);
        aseSocket.register("deleteTiles", deleteTiles);
        aseSocket.register("updateFlag", updateFlag);
        aseSocket.register("moveWalls", moveWalls);
    }
};

async function updateFlag(objectId, flag, value) {
let object = canvas.scene.tiles.get(objectId) || canvas.scene.tokens.get(objectId) || canvas.scene.drawings.get(objectId) || canvas.scene.walls.get(objectId) || canvas.scene.lights.get(objectId);
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
async function moveDarknessWalls(tileId) {
    let tileD = await canvas.scene.tiles.get(tileId);
    let wall_number = 12;
    let placedX = tileD.data.x + (tileD.data.width / 2);
    let placedY = tileD.data.y + (tileD.data.height / 2);
    let outerCircleRadius = tileD.data.width / 2.2;
    let wall_angles = 2 * Math.PI / wall_number;
    let walls = [];
    let wallDocuments = [];
    let wallPoints = [];

    walls = await Tagger.getByTag([`DarknessWall-${tileD.id}`]);
    walls.forEach((wall) => {
        wallDocuments.push(wall.document.id);
    });
    walls = [];
    if (wallDocuments.length > 0) {
        await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
        for (let i = 0; i < wall_number; i++) {
            let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
            let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
            wallPoints.push({ x: x, y: y });
        }

        for (let i = 0; i < wallPoints.length; i++) {
            if (i < wallPoints.length - 1) {
                walls.push({
                    c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                    flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                    move: 0
                })
            }
            else {
                walls.push({
                    c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                    flags: { tagger: { tags: [`DarknessWall-${tileD.id}`] } },
                    move: 0
                })
            }
        }

    }
    if (walls.length > 0) {
        await canvas.scene.createEmbeddedDocuments("Wall", walls);
    }

}

async function moveWalls(tileId, wallType, numWalls){
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