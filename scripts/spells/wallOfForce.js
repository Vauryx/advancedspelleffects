import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
import { wofPanelDialog } from "../apps/wof-panel-dialog.js";
export class wallOfForce {

    static registerHooks() {
        if (!game.user.isGM) return;
        Hooks.on("updateMeasuredTemplate", wallOfForce._updateMeasuredTemplate);
        Hooks.on("deleteMeasuredTemplate", wallOfForce._deleteMeasuredTemplate);
    }

    static async _updateMeasuredTemplate(template, changes) {
        if (template.getFlag("advancedspelleffects", "wallOfForceWallNum") && (changes.x !== undefined || changes.y !== undefined || changes.direction !== undefined)) {
            wallOfForce._placeWalls(template, true);
        }
    }

    static async _deleteMeasuredTemplate(template) {
        const walls = Tagger.getByTag([`WallOfForce-Wall${template.id}`]).map(wall => wall.id);
        if (walls.length) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", walls);
        }
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let wallOfForceTemplate = Tagger.getByTag(`WallOfForce-${casterActor.id}`);
        let wofTemplateIds = [];
        if (wallOfForceTemplate.length > 0) {
            wallOfForceTemplate.forEach(template => {
                wofTemplateIds.push(template.id);
            });
            aseSocket.executeAsGM("deleteTemplates", wofTemplateIds);
        }
    }

    static async createWallOfForce(midiData) {

        const aseData = {
            itemLevel: midiData.itemLevel,
            flags: midiData.item.getFlag("advancedspelleffects", 'effectOptions'),
            caster: canvas.tokens.get(midiData.tokenId),
            casterActor: canvas.tokens.get(midiData.tokenId).actor
        }

        const { dimensions, texture, type } = await warpgate.buttonDialog({
            title: 'Choose your Wall of Force shape:',
            buttons: [
                {
                    label: `Sphere/Dome (${aseData.flags.wallOfForceRadius}ft radius)`,
                    value: {
                        dimensions: {
                            radius: aseData.flags.wallOfForceRadius
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_Sphere_Thumb.webp`
                            : "jb2a.wall_of_force.sphere." + aseData.flags.color,
                        type: "sphere"
                    }
                },
                {
                    label: `Horizontal Wall (${aseData.flags.wallOfForceSegmentSize * 5}x${aseData.flags.wallOfForceSegmentSize * 2})`,
                    value: {
                        dimensions: {
                            length: aseData.flags.wallOfForceSegmentSize * 5,
                            width: aseData.flags.wallOfForceSegmentSize * 2
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_H_Thumb.webp`
                            : "jb2a.wall_of_force.horizontal." + aseData.flags.color,
                        type: "horizontal"
                    }
                },
                {
                    label: `Horizontal Wall (${aseData.flags.wallOfForceSegmentSize * 10}x${aseData.flags.wallOfForceSegmentSize})`,
                    value: {
                        dimensions: {
                            length: aseData.flags.wallOfForceSegmentSize * 10,
                            width: aseData.flags.wallOfForceSegmentSize
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_H_Thumb.webp`
                            : "jb2a.wall_of_force.horizontal." + aseData.flags.color,
                        type: "horizontal"
                    }
                },
                {
                    label: `Vertical Wall (${aseData.flags.wallOfForceSegmentSize * 5}x${aseData.flags.wallOfForceSegmentSize * 2})`,
                    value: {
                        dimensions: {
                            length: aseData.flags.wallOfForceSegmentSize * 5,
                            height: aseData.flags.wallOfForceSegmentSize * 2
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_V_Thumb.webp`
                            : "jb2a.wall_of_force.vertical." + aseData.flags.color,
                        type: "vertical"
                    }
                },
                {
                    label: `Vertical Wall (${aseData.flags.wallOfForceSegmentSize * 10}x${aseData.flags.wallOfForceSegmentSize})`,
                    value: {
                        dimensions: {
                            length: aseData.flags.wallOfForceSegmentSize * 10,
                            height: aseData.flags.wallOfForceSegmentSize
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_V_Thumb.webp`
                            : "jb2a.wall_of_force.vertical." + aseData.flags.color,
                        type: "vertical"
                    }
                },
                {
                    label: `Place Horizontal Panels (${aseData.flags.wallOfForceSegmentSize}x${aseData.flags.wallOfForceSegmentSize})`,
                    value: {
                        dimensions: {
                            length: aseData.flags.wallOfForceSegmentSize,
                            width: aseData.flags.wallOfForceSegmentSize
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_H_Thumb.webp`
                            : "jb2a.wall_of_force.horizontal." + aseData.flags.color,
                        type: "h-panels"
                    }
                },
                {
                    label: `Place Vertical Panels (${aseData.flags.wallOfForceSegmentSize}x${aseData.flags.wallOfForceSegmentSize})`,
                    value: {
                        dimensions: {
                            length: aseData.flags.wallOfForceSegmentSize,
                            width: aseData.flags.wallOfForceSegmentSize
                        },
                        texture: aseData.flags.useWebP
                            ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_V_Thumb.webp`
                            : "jb2a.wall_of_force.vertical." + aseData.flags.color,
                        type: "v-panels"
                    }
                }
            ]
        }, 'column');

        if (!dimensions || !texture) return;

        aseData.dimensions = dimensions;
        aseData.texture = texture;

        const templateData = {
            user: game.user.id,
            direction: 0,
            x: 0,
            y: 0,
            color: "#FFFFFF",
            fillColor: "#FFFFFF",
            flags: {
                tagger: { tags: [`WallOfForce-${aseData.casterActor.id}`] },
                advancedspelleffects: {
                    wallOfForceWallNum: 12,
                    dimensions: aseData.dimensions
                }
            }
        }

        if (type == "sphere") {
            templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.CIRCLE;
            templateData["distance"] = dimensions.radius;
        } else if (type == "vertical") {
            templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
            templateData["distance"] = dimensions.length;
        } else if (type == "horizontal") {
            templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE;
            templateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
            templateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
        }
        if (type == "h-panels" || type == "v-panels") {
            if (type == "h-panels") {
                templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE;
                templateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
                templateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
            } else if (type == "v-panels") {
                templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
                templateData["distance"] = dimensions.length;
            }
            templateData.flags.tagger.tags.push('0');
            let wofPanelDiag = new wofPanelDialog({ aseData: aseData, templateData: templateData, type: type }).render(true);

            let wofPanelData = await wofPanelDiag.getData();

            Hooks.once('createMeasuredTemplate', async (template) => {
                await template.setFlag('advancedspelleffects', 'placed', true);
                wallOfForce._placePanels(aseData, template, wofPanelDiag, type);
            });
            console.log("template data:", templateData);
            const doc = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });
            let template = new game.dnd5e.canvas.AbilityTemplate(doc);
            template.actorSheet = aseData.casterActor.sheet;
            template.drawPreview();


        }
        else {
            console.log("ASE DATA: ", aseData);
            Hooks.once('createMeasuredTemplate', async (template) => {
                await template.setFlag('advancedspelleffects', 'placed', true);
                wallOfForce._placeWallOfForce(aseData, template);
            });
            console.log("template data:", templateData);
            const doc = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });
            let template = new game.dnd5e.canvas.AbilityTemplate(doc);
            template.actorSheet = aseData.casterActor.sheet;
            template.drawPreview();
        }

    }

    static sourceSquareV(center, distance, direction) {
        const gridSize = canvas.grid.h;
        const length = (distance / 5) * gridSize;

        const x = center.x + length * Math.cos(direction * Math.PI / 180);
        const y = center.y + length * Math.sin(direction * Math.PI / 180);
        //console.log(`x: ${x}, y: ${y}`);
        return { x: x, y: y };
    }

    static sourceSquare(center, widthSquares, heightSquares) {

        const gridSize = canvas.grid.h;
        const h = gridSize * heightSquares;
        const w = gridSize * widthSquares;

        const bottom = center.y + h / 2;
        const left = center.x - w / 2;
        const top = center.y - h / 2;
        const right = center.x + w / 2;

        const rightSpots = [...new Array(1)].map((_, i) => ({
            direction: 45,
            x: right,
            y: top,
        }));
        const bottomSpots = [...new Array(1)].map((_, i) => ({
            direction: 45,
            x: left,
            y: bottom,
        }));
        const leftSpots = [...new Array(1)].map((_, i) => ({
            direction: 135,
            x: left,
            y: top,
        }));
        const topSpots = [...new Array(1)].map((_, i) => ({
            direction: 225,
            x: right,
            y: top,
        }));
        console.log("topSpots: ", topSpots);
        console.log("leftSpots: ", leftSpots);
        console.log("bottomSpots: ", bottomSpots);
        console.log("rightSpots: ", rightSpots);
        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            ...bottomSpots,
            ...leftSpots,
            ...topSpots,
            ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
        ];
        console.log("allSpots: ", allSpots);
        return {
            x: left,
            y: top,
            center,
            top,
            bottom,
            left,
            right,
            h,
            w,
            heightSquares,
            widthSquares,
            allSpots,
        };
    };
    static async _placePanels(aseData, template, panelDiag, type) {

        wallOfForce._playEffects(aseData, template);
        wallOfForce._placeWalls(template);
        /*console.log("wofPanelDiag: ", panelDiag);
        console.log("type: ", type);
        console.log("aseData: ", aseData);
        console.log("template: ", template);*/

        const gridSize = canvas.grid.h;
        const previousTemplateData = template.data;
        let panelsRemaining = panelDiag.data.aseData.flags.wallOfForcePanelCount;
        //console.log("Panels Remaining: ", panelsRemaining);
        await template.unsetFlag("advancedspelleffects", 'placed');
        const nextTemplateData = template.toObject();

        delete nextTemplateData["_id"];
        //console.log("nextTemplateData: ", nextTemplateData);
        //console.log("previousTemplateData: ", previousTemplateData);
        nextTemplateData.flags.tagger.tags[1] = (Number(nextTemplateData.flags.tagger.tags[1]) + 1).toString();
        if (panelsRemaining < 2 || !panelDiag.rendered) {
            panelDiag.submit();
            return
        };

        panelDiag.data.aseData.flags.wallOfForcePanelCount--;
        panelDiag.render(true);

        let previousTemplateCenter;
        let square;

        let updateTemplateLocation;

        if (type == "h-panels") {
            if (previousTemplateData.direction == 45) {
                previousTemplateCenter = {
                    x: previousTemplateData.x + (((previousTemplateData.flags.advancedspelleffects.dimensions.length / 5) * canvas.grid.size)) / 2,
                    y: previousTemplateData.y + (((previousTemplateData.flags.advancedspelleffects.dimensions.width / 5) * canvas.grid.size)) / 2
                };
            } else if (previousTemplateData.direction == 135) {
                previousTemplateCenter = {
                    x: previousTemplateData.x - (((previousTemplateData.flags.advancedspelleffects.dimensions.length / 5) * canvas.grid.size)) / 2,
                    y: previousTemplateData.y + (((previousTemplateData.flags.advancedspelleffects.dimensions.width / 5) * canvas.grid.size)) / 2
                };
            } else if (previousTemplateData.direction == 225) {
                previousTemplateCenter = {
                    x: previousTemplateData.x - (((previousTemplateData.flags.advancedspelleffects.dimensions.length / 5) * canvas.grid.size)) / 2,
                    y: previousTemplateData.y - (((previousTemplateData.flags.advancedspelleffects.dimensions.width / 5) * canvas.grid.size)) / 2
                };
            }
            const previousTemplateWidthSquares = previousTemplateData.flags.advancedspelleffects.dimensions.length / 5;
            const previousTemplateHeightSquares = previousTemplateData.flags.advancedspelleffects.dimensions.width / 5;
            square = wallOfForce.sourceSquare({ x: previousTemplateCenter.x, y: previousTemplateCenter.y },
                previousTemplateWidthSquares, previousTemplateHeightSquares);



        } else if (type == "v-panels") {

            square = wallOfForce.sourceSquareV({ x: previousTemplateData.x, y: previousTemplateData.y },
                previousTemplateData.distance, previousTemplateData.direction);
            nextTemplateData.x = square.x;
            nextTemplateData.y = square.y;
        }
        const displayTemplateData = JSON.parse(JSON.stringify(nextTemplateData));
        delete displayTemplateData.flags.advancedspelleffects["wallOfForceWallNum"];
        let displayTemplate = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [displayTemplateData]))[0];
        // console.log("square: ", square);
        let currentSpotIndex = 0;
        updateTemplateLocation = async (crosshairs) => {
            console.log("crosshairs: ", crosshairs);
            while (crosshairs.inFlight) {
                if (!panelDiag.rendered) {
                    crosshairs.inFlight = false;
                    return;
                }
                await warpgate.wait(100);
                //console.log(displayTemplate);
                if (!displayTemplate) return;
                const verticalTemplate = displayTemplate.data.t == CONST.MEASURED_TEMPLATE_TYPES.RAY;
                //console.log("Vertical Template:", verticalTemplate);
                let ray;
                let angle;
                if (!verticalTemplate) {
                    const totalSpots = square.allSpots.length;
                    const radToNormalizedAngle = (rad) => {
                        let angle = (rad * 180 / Math.PI) % 360;

                        // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
                        if (square.heightSquares % 2 === 1 && square.widthSquares % 2 === 1) {
                            angle -= (360 / totalSpots) / 2;
                        }
                        const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
                        return normalizedAngle < 0
                            ? normalizedAngle + 360
                            : normalizedAngle;
                    }

                    ray = new Ray(square.center, crosshairs);
                    angle = radToNormalizedAngle(ray.angle);
                    const spotIndex = Math.ceil(angle / 360 * totalSpots);

                    if (spotIndex === currentSpotIndex) {
                        continue;
                    }

                    currentSpotIndex = spotIndex;
                    const spot = square.allSpots[currentSpotIndex];

                    if (!displayTemplate) return;
                    await displayTemplate.update({ ...spot });
                } else {
                    ray = new Ray(square, crosshairs);
                    angle = (ray.angle * 180 / Math.PI);

                    if (angle == displayTemplate.data.direction) {
                        continue;
                    }
                    if (!displayTemplate) return;
                    await displayTemplate.update({ direction: angle });
                }
            }
        }

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
            interval: 20
        }
        const rotateCrosshairs = await warpgate.crosshairs.show(
            targetConfig,
            {
                show: updateTemplateLocation
            });
        if (rotateCrosshairs.cancelled) {
            if (canvas.scene.templates.get(displayTemplate.id)) {
                await displayTemplate.delete();
            }
            game.user.updateTokenTargets();
            panelDiag.submit();
            return;
        }
        const newFlags = {
            flags: {
                advancedspelleffects: {
                    placed: true,
                    wallOfForceWallNum: nextTemplateData.flags.advancedspelleffects["wallOfForceWallNum"]
                }
            }
        }
        await displayTemplate.update(newFlags);
        wallOfForce._placePanels(aseData, displayTemplate, panelDiag, type);

    }

    static async _placeWallOfForce(aseData, templateDocument) {

        wallOfForce._playEffects(aseData, templateDocument);
        wallOfForce._placeWalls(templateDocument);

    }

    static async _placeWalls(templateDocument, deleteOldWalls = false) {

        if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE) return;

        if (deleteOldWalls) {
            const walls = Tagger.getByTag([`WallOfForce-Wall${templateDocument.id}`]).map(wall => wall.id);
            if (walls.length) {
                await canvas.scene.deleteEmbeddedDocuments("Wall", walls);
            }
        }

        const template = templateDocument.object;

        const walls = [];

        if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {

            const placedX = template.x;
            const placedY = template.y;

            let wall_number = 12;
            let wall_angles = 2 * Math.PI / wall_number

            let outerCircleRadius = template.shape.radius;

            let lastPoint = false;
            let firstPoint;
            for (let i = 0; i < wall_number; i++) {
                const currentPoint = [
                    placedX + outerCircleRadius * Math.cos(i * wall_angles),
                    placedY + outerCircleRadius * Math.sin(i * wall_angles)
                ]
                if (lastPoint) {
                    walls.push({
                        c: [...lastPoint, ...currentPoint],
                        flags: { tagger: { tags: [`WallOfForce-Wall${templateDocument.id}`] } },
                        move: 20,
                        sight: 0
                    })
                }
                lastPoint = [...currentPoint]
                if (!firstPoint) firstPoint = [...currentPoint]
            }

            walls.push({
                c: [...lastPoint, ...firstPoint],
                flags: { tagger: { tags: [`WallOfForce-Wall${templateDocument.id}`] } },
                move: 20,
                sight: 0
            })

        } else {

            const startPoint = template.ray.A;
            const endPoint = template.ray.B;

            walls.push({
                c: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
                flags: {
                    tagger: { tags: [`WallOfForce-Wall${templateDocument.id}`] },
                    wallHeight: {
                        wallHeightTop: templateDocument.getFlag('advancedspelleffects', 'dimensions').height,
                        wallHeightBottom: 0
                    }
                },
                move: 20,
                sight: 0,
            })

        }

        await aseSocket.executeAsGM("placeWalls", walls);

    }

    static _playEffects(aseData, template) {

        if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {

            new Sequence()
                .effect(aseData.texture)
                .attachTo(template)
                .scaleToObject()
                .fadeIn(250)
                .fadeOut(250)
                .zIndex(1000)
                .persist()
                .play()

        } else if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE) {

            new Sequence()
                .effect(aseData.texture)
                .attachTo(template)
                .scaleToObject()
                .fadeIn(250)
                .fadeOut(250)
                .tilingTexture({
                    x: aseData.flags.wallOfForceSegmentSize / 10,
                    y: aseData.flags.wallOfForceSegmentSize / 10
                })
                .belowTokens()
                .zIndex(-1000)
                .persist()
                .play()

        } else {
            new Sequence()
                .effect(aseData.texture)
                .attachTo(template)
                .stretchTo(template, { attachTo: true, onlyX: true })
                .tilingTexture({
                    x: aseData.flags.wallOfForceSegmentSize / 10
                })
                .fadeIn(250)
                .fadeOut(250)
                .persist()
                .play()
        }

    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        spellOptions.push({
            label: game.i18n.localize("ASE.WallOfForceRadiusLabel"),
            tooltip: game.i18n.localize("ASE.WallOfForceRadiusTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.wallOfForceRadius',
            flagName: 'wallOfForceRadius',
            flagValue: currFlags.wallOfForceRadius ?? 10,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.WallOfForceSegmentSizeLabel"),
            tooltip: game.i18n.localize("ASE.WallOfForceSegmentSizeTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.wallOfForceSegmentSize',
            flagName: 'wallOfForceSegmentSize',
            flagValue: currFlags.wallOfForceSegmentSize ?? 10,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.WallOfForcePanelCountLabel"),
            tooltip: game.i18n.localize("ASE.WallOfForcePanelCountTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.wallOfForcePanelCount',
            flagName: 'wallOfForcePanelCount',
            flagValue: currFlags.wallOfForcePanelCount ?? 10,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.WallOfForceColorLabel"),
            type: 'dropdown',
            options: utilFunctions.getDBOptions('jb2a.wall_of_force.horizontal'),
            name: 'flags.advancedspelleffects.effectOptions.color',
            flagName: 'color',
            flagValue: currFlags.color,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.WallOfForceUseWebPLabel"),
            tooltip: game.i18n.localize("ASE.WallOfForceUseWebPTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.useWebP',
            flagName: 'useWebP',
            flagValue: currFlags.useWebP,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}

