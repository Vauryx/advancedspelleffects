import { aseSocket } from "../aseSockets.js";

export class darkness {

    static registerHooks() {
        if (!game.user.isGM) return;
        Hooks.on("updateTile", darkness._updateTile);
        Hooks.on("deleteTile", darkness._deleteTile);
    }

    static async _updateTile(tileD) {
        await aseSocket.executeAsGM("moveWalls", tileD.id, 'Darkness', 12);
    }

    static async _deleteTile(tileD) {
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

    static async handleConcentration(casterActor, casterToken, effectOptions){
        //console.log("Handling concentration removal for ASE Darknes...");
        let darknessTiles = await Tagger.getByTag(`DarknessTile-${casterActor.id}`);
        if (darknessTiles.length > 0) {
            aseSocket.executeAsGM("deleteTiles", [darknessTiles[0].id]);
        }
    }

    static async createDarkness(midiData) {
        let item = midiData.item;
        const displayCrosshairs = async (crosshairs) => {
            new Sequence("Advanced Spell Effects")
                .effect()
                .file("jb2a.darkness.black")
                .attachTo(crosshairs)
                .persist()
                .opacity(0.5)
                .play()

        }
        let crosshairsConfig = {
            size: 6,
            icon: item.img,
            label: 'Darkness',
            tag: 'darkness-crosshairs',
            drawIcon: true,
            drawOutline: false,
            interval: 1
        }
        let template = await warpgate.crosshairs.show(crosshairsConfig, {show: displayCrosshairs});
        let caster = await canvas.tokens.get(midiData.tokenId);
        let casterActor = caster.actor;
        await placeCloudAsTile(template, casterActor.id);
        //await changeSelfItemMacro();

        async function placeCloudAsTile(templateData, casterId) {
            // console.log("Template given: ", template);
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;
            let placedX = templateData.x;
            let placedY = templateData.y;
            let wallPoints = [];
            let walls = [];
            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);

            let outerCircleRadius = tileWidth / 2.2;
            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);

            data = [{
                alpha: 1,
                width: tileWidth,
                height: tileHeight,
                img: "modules/jb2a_patreon/Library/2nd_Level/Darkness/Darkness_01_Black_600x600.webm",
                overhead: true,
                occlusion: {
                    alpha: 0,
                    mode: 3,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tileX,
                y: tileY,
                z: 100,
                flags: { tagger: { tags: [`DarknessTile-${casterId}`] } }
            }]
            //console.log("Placing as tile: ", data);
            let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
            let tileId = createdTiles[0].id ?? createdTiles[0]._id;
            //console.log("ASE DARKNESS: Darknes Tile Created: ",tileD);
            let wall_number = 12;
            let wall_angles = 2 * Math.PI / wall_number
            for (let i = 0; i < wall_number; i++) {
                let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                wallPoints.push({ x: x, y: y });
            }

            for (let i = 0; i < wallPoints.length; i++) {
                if (i < wallPoints.length - 1) {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileId}`] } },
                        move: 0
                    })
                }
                else {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                        flags: { tagger: { tags: [`DarknessWall-${tileId}`] } },
                        move: 0
                    })
                }
            }

            await aseSocket.executeAsGM("placeWalls", walls);
        }
    }
    
}
