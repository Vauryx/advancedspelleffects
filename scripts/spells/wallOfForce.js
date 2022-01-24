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
        if (wallOfForceTemplate.length > 0) {
            aseSocket.executeAsGM("deleteTemplates", [wallOfForceTemplate[0].id]);
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
                        texture: "jb2a.wall_of_force.sphere." + aseData.flags.color,
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
                        texture: "jb2a.wall_of_force.horizontal." + aseData.flags.color,
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
                        texture: "jb2a.wall_of_force.horizontal." + aseData.flags.color,
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
                        texture: "jb2a.wall_of_force.vertical." + aseData.flags.color,
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
                        texture: "jb2a.wall_of_force.vertical." + aseData.flags.color,
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
                        texture: "jb2a.wall_of_force.horizontal." + aseData.flags.color,
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
                        texture: "jb2a.wall_of_force.horizontal." + aseData.flags.color,
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
            //wallOfForce._placePanels(aseData, templateData, type);
            new wofPanelDialog(aseData.flags.wallOfForcePanelCount, { aseData: aseData, templateData: templateData, type: type }).render(true);
        }
        else {
            console.log("ASE DATA: ", aseData);
            Hooks.once('createMeasuredTemplate', (template) => this._placeWallOfForce(aseData, template));
        }


        const doc = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });
        let template = new game.dnd5e.canvas.AbilityTemplate(doc);
        template.actorSheet = aseData.casterActor.sheet;
        template.drawPreview();

    }

    static _placePanels(aseData, templateData, type) {

    }

    static async _placeWallOfForce(aseData, templateDocument) {

        this._playEffects(aseData, templateDocument);
        this._placeWalls(templateDocument);

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

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}

