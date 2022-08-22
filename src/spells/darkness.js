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
            wallDocuments.push(wall.id);
        });
        //console.log("Deleting walls: " + wallDocuments);
        if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
        }
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        //console.log("Handling concentration removal for ASE Darknes...");
        let darknessTiles = await Tagger.getByTag(`DarknessTile-${casterActor.id}`);
        if (darknessTiles.length > 0) {
            aseSocket.executeAsGM("deleteTiles", [darknessTiles[0].id]);
        }
    }

    static async createDarkness(midiData) {
        const item = midiData.item;
        const displayCrosshairs = async (crosshairs) => {
            //console.log("Displaying crosshairs...");
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
            label: game.i18n.localize("ASE.Darkness"),
            tag: 'darkness-crosshairs',
            drawIcon: true,
            drawOutline: false,
            interval: 1
        }
        let template = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
        const caster = await canvas.tokens.get(midiData.tokenId);
        const casterActor = caster.actor;
        const effectOptions = item.getFlag("advancedspelleffects", "effectOptions");
        const sound = effectOptions.darknessSound ?? "";
        const soundDelay = Number(effectOptions.darknessSoundDelay) ?? 0;
        const volume = effectOptions.darknessVolume ?? 1;

        const soundOptions = {
            sound: sound,
            volume: volume,
            delay: soundDelay
        };

        await placeCloudAsTile(template, casterActor.id, soundOptions);
        //await changeSelfItemMacro();

        async function placeCloudAsTile(templateData, casterId, soundOptions) {
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

            let data = [{
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
            new Sequence("Advanced Spell Effects")
                .sound()
                .file(soundOptions.sound)
                .delay(soundOptions.delay)
                .volume(soundOptions.volume)
                .playIf(soundOptions.sound !== "")
                .play();
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

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        soundOptions.push({
            label: game.i18n.localize("ASE.DarknessSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.darknessSound',
            flagName: 'darknessSound',
            flagValue: currFlags.darknessSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DarknessSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.darknessSoundDelay',
            flagName: 'darknessSoundDelay',
            flagValue: currFlags.darknessSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DarknessVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.darknessVolume',
            flagName: 'darknessVolume',
            flagValue: currFlags.darknessVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: true
        }

    }

}
