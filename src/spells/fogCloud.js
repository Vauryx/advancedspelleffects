import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class fogCloud {

    static registerHooks() {
        if (!game.user.isGM) return;
        Hooks.on("updateTile", fogCloud._updateTile);
        Hooks.on("deleteTile", fogCloud._deleteTile);
    }

    static async _updateTile(tileD) {
        if (tileD.getFlag("advancedspelleffects", "fogCloudWallNum")) {
            let wallNum = tileD.getFlag("advancedspelleffects", "fogCloudWallNum");
            await aseSocket.executeAsGM("moveWalls", tileD.id, 'FogCloud', wallNum);
        }
    }

    static async _deleteTile(tileD) {
        let walls = [];
        let wallDocuments = [];
        walls = await Tagger.getByTag([`FogCloudWall-${tileD.id}`]);
        walls.forEach((wall) => {
            //console.log(wall);
            wallDocuments.push(wall.id);
        });
        if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
        }
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        //console.log(casterActor.id);
        let fogCloudTiles = await Tagger.getByTag(`FogCloudTile-${casterActor.id}`);
        if (fogCloudTiles.length > 0) {
            aseSocket.executeAsGM("deleteTiles", [fogCloudTiles[0].id]);
        }
    }

    static async createFogCloud(midiData) {
        let item = midiData.item;

        let itemLevel = midiData.itemLevel;
        let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
        let caster = await canvas.tokens.get(midiData.tokenId);
        let casterActor = caster.actor;
        let cloudSize;
        if (aseFlags.scaleWithLevel === undefined || aseFlags.scaleWithLevel) {
            cloudSize = ((Number(aseFlags.fogCloudRadius ?? 20) / 2.5) * itemLevel);
        }
        else {
            cloudSize = Number(aseFlags.fogCloudRadius ?? 20) / 2.5;
        }
        if (cloudSize < 2.5) cloudSize = 2.5;

        const sound = aseFlags?.fogCloudSound ?? "";
        const soundDelay = Number(aseFlags?.fogCloudSoundDelay) ?? 0;
        const volume = aseFlags?.fogCloudVolume ?? 1;

        const soundOptions = {
            sound: sound,
            volume: volume,
            delay: soundDelay
        };
        const displayCrosshairs = async (crosshairs) => {
            //console.log("Warpgate Crosshairs...", crosshairs);
            new Sequence("Advanced Spell Effects")
                .effect()
                .file("jb2a.fog_cloud.1.white")
                .attachTo(crosshairs)
                .persist()
                .scaleToObject()
                .opacity(0.5)
                .play()
        }
        let crosshairsConfig = {
            size: cloudSize,
            icon: item.img,
            label: game.i18n.localize("ASE.FogCloud"),
            tag: 'fog-cloud-crosshairs',
            drawIcon: false,
            drawOutline: false,
            interval: 1
        }
        let fogCloudTemplate = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });

        await placeCloudAsTile(fogCloudTemplate, casterActor.id, itemLevel, soundOptions);

        async function placeCloudAsTile(template, casterId, spellLevel, soundOptions) {
            let templateData = template;
            console.log(templateData);
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;
            let placedX = templateData.x;
            let placedY = templateData.y;
            let wallPoints = [];
            let walls = [];

            let wall_number = aseFlags.wallNumber * spellLevel;
            let wall_angles = 2 * Math.PI / wall_number
            tileWidth = (templateData.width * canvas.grid.size) + (canvas.grid.size / 2);
            tileHeight = (templateData.width * canvas.grid.size) + (canvas.grid.size / 2);

            let outerCircleRadius = (templateData.width * canvas.grid.size) / 2;
            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);
            let data = [{
                alpha: 1,
                width: tileWidth,
                height: tileHeight,
                img: "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
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
                flags: { tagger: { tags: [`FogCloudTile-${casterId}`] }, advancedspelleffects: { fogCloudWallNum: wall_number } }
            }]
            let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
            let tileId = createdTiles[0].id ?? createdTiles[0]._id;
            new Sequence("Advanced Spell Effects")
                .sound()
                .file(soundOptions.sound)
                .delay(soundOptions.delay)
                .volume(soundOptions.volume)
                .playIf(soundOptions.sound !== "")
                .play();
            for (let i = 0; i < wall_number; i++) {
                let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
                let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
                wallPoints.push({ x: x, y: y });
            }
            for (let i = 0; i < wallPoints.length; i++) {
                if (i < wallPoints.length - 1) {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
                        flags: { tagger: { tags: [`FogCloudWall-${tileId}`] } },
                        move: 0,
                        dir: 2
                    })
                }
                else {
                    walls.push({
                        c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
                        flags: { tagger: { tags: [`FogCloudWall-${tileId}`] } },
                        move: 0,
                        dir: 2
                    })
                }
            }

            await aseSocket.executeAsGM("placeWalls", walls);
        }
    }
    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const spellDetails = {
            actionType: "other",
            target : {
                type: "",
                units: "",
                value: null,
                width: null,
            }
        };

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        animOptions.push({
            label: game.i18n.localize("ASE.WallsLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.wallNumber',
            flagName: 'wallNumber',
            flagValue: currFlags.wallNumber ?? 12,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ScaleWithLevelLabel"),
            tooltip: game.i18n.localize("ASE.ScaleWithLevelTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.scaleWithLevel',
            flagName: 'scaleWithLevel',
            flagValue: currFlags.scaleWithLevel ?? true,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.FogCloudRadiusLabel"),
            tooltip: game.i18n.localize("ASE.FogCloudRadiusTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.fogCloudRadius',
            flagName: 'fogCloudRadius',
            flagValue: currFlags.fogCloudRadius ?? 20,
        });

        soundOptions.push({
            label: game.i18n.localize("ASE.FogCloudSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.fogCloudSound',
            flagName: 'fogCloudSound',
            flagValue: currFlags.fogCloudSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.FogCloudSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.fogCloudSoundDelay',
            flagName: 'fogCloudSoundDelay',
            flagValue: currFlags.fogCloudSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.FogCloudVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.fogCloudVolume',
            flagName: 'fogCloudVolume',
            flagValue: currFlags.fogCloudVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: true,
            requireDetails: spellDetails
        }

    }
}

