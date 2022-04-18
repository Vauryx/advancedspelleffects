import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
import baseSpellClass from "./baseSpellClass.js";
import { wallPanelDialog } from "../apps/wall-panel-dialog.js";


export class wallSpell extends baseSpellClass {
    constructor(data) {
        super();
        this.data = data;

        this.actor = game.actors.get(this.data.actor.id);
        this.token = canvas.tokens.get(this.data.tokenId);
        this.item = this.data.item;
        this.itemCardId = this.data.itemCardId;
        this.itemLevel = this.data.itemLevel;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions") ?? {};
        //console.log('effectOptions:', this.effectOptions);
        this.wallType = this.effectOptions.wallType.toLowerCase();
        this.wallCategory = "";
        this.wallOptions = {};
        this.chatMessage = {};
        this.baseTemplateData = {
            user: game.user.id,
            direction: 0,
            x: 0,
            y: 0,
            color: "#FFFFFF",
            fillColor: "#FFFFFF",
            flags: {
                tagger: { tags: [`wallSpell-${this.wallType}-${this.actor.id}`] },
                advancedspelleffects: {
                    wallSpellWallNum: 12,
                    dimensions: {},
                    wallType: this.wallType,
                    length: this.effectOptions.length,
                    wallOperationalData: {},
                    wallEffectData: this.effectOptions,
                    wallName: this.item.name
                }
            }
        }
    }

    async cast() {
        this._setWallCategory();
        this._setWallOptions();
        //console.log(this);
        const { dimensions, texture, type } = await warpgate.buttonDialog(this._getDialogData(), 'column');
        //console.log('dimensions:', dimensions);
        //console.log('texture:', texture);
        //console.log('type:', type);
        if (!dimensions || !texture) return;
        const chatMessage = await game.messages.get(this.itemCardId);
        if (chatMessage) {
            this.chatMessage = chatMessage.id;
        }
        this._setBaseTemplateData(dimensions, type);

        const aseData = {
            itemLevel: this.itemLevel,
            flags: this.effectOptions,
            caster: this.token,
            casterActor: this.actor,
            dimensions: dimensions,
            texture: texture,
        }
        //console.log("Dialog return type", type);
        if (type == "h-panels" || type == "v-panels") {
            let wallPanelDiag = new wallPanelDialog({ aseData: aseData, templateData: this.baseTemplateData, type: type }).render(true);
            let wallSpellPanelData = await wallPanelDiag.getData();
            //console.log('wallSpellPanelData:', wallSpellPanelData);
            Hooks.once('createMeasuredTemplate', async (template) => {
                await template.setFlag('advancedspelleffects', 'placed', true);
                wallSpell.placePanels(aseData, template, wallPanelDiag, type);
            });
            //console.log("template data:", this.baseTemplateData);
            const doc = new MeasuredTemplateDocument(this.baseTemplateData, { parent: canvas.scene });
            let template = new game.dnd5e.canvas.AbilityTemplate(doc);
            template.actorSheet = aseData.casterActor.sheet;
            template.drawPreview();
        } else {
            Hooks.once('createMeasuredTemplate', async (template) => {

                const direction = template.data.direction;
                const templateDimensions = template.getFlag('advancedspelleffects', 'dimensions') ?? {};
                const templateLength = templateDimensions?.length ?? 0;
                if ((direction == 0 || direction == 180 || direction == 90 || direction == 270) && templateLength > 0) {
                    await template.update({ distance: templateLength, flags: { advancedspelleffects: { placed: true } } });
                } else {
                    await template.setFlag('advancedspelleffects', 'placed', true);
                }

                wallSpell.playEffects(aseData, template);
                wallSpell.placeWalls(template);
                if (this.wallType.includes('fire')) {
                    await wallSpell.pickFireSide(template);
                }
                if (utilFunctions.isMidiActive()) {
                    wallSpell.handleOnCast(template);
                }
            });
            const doc = new MeasuredTemplateDocument(this.baseTemplateData, { parent: canvas.scene });
            let template = new game.dnd5e.canvas.AbilityTemplate(doc);
            template.actorSheet = aseData.casterActor.sheet;
            template.drawPreview();
        }
    }

    _setWallCategory() {
        if (this.wallType.includes('thorns') || this.wallType.includes('fire') || this.wallType.includes('light')
            || this.wallType.includes('sand') || this.wallType.includes('water')) {
            this.wallCategory = 'wall';
        } else if (this.wallType.includes('force') || this.wallType.includes('ice') || this.wallType.includes('stone')) {
            this.wallCategory = 'panels';
        }
    }

    _setWallOptions() {
        //console.log('wallCategory:', this.wallCategory);
        //console.log('effectOptions:', this.effectOptions);
        switch (this.wallCategory) {
            case "wall":
                this.wallOptions = {
                    wallCategory: "wall",
                    rect: {
                        dimensions: {
                            length: this.effectOptions.wallLength,
                            width: this.effectOptions.wallHeight
                        }
                    },
                    circle: {
                        dimensions: {
                            radius: this.effectOptions.wallRadius
                        }
                    }
                };
                break;
            case "panels":
                this.wallOptions = {
                    wallCategory: "panels",
                    rect: {
                        horizontal: {
                            dimensions: {
                                length: this.effectOptions.wallSegmentSize,
                                width: this.effectOptions.wallSegmentSize
                            }
                        },
                        vertical: {
                            dimensions: {
                                length: this.effectOptions.wallSegmentSize,
                                width: this.effectOptions.wallSegmentSize
                            }
                        }
                    },
                    circle: {
                        dimensions: {
                            radius: this.effectOptions.wallRadius
                        }
                    }
                }
                break;
            default:
                this.wallOptions = {
                    wallCategory: "wall",
                    rect: {
                        dimensions: {
                            length: this.effectOptions.wallLength,
                            height: this.effectOptions.wallHeight
                        }
                    },
                    circle: {
                        dimensions: {
                            radius: this.effectOptions.wallRadius
                        }
                    }
                };
                break;
        }
    }

    _getDialogData() {
        const wallType = this.wallType;
        const wallOptions = this.wallOptions;
        //console.log('wallOptions:', wallOptions);
        const wallCategory = this.wallCategory;
        const effectOptions = this.effectOptions;
        const useWebP = effectOptions.useWebP ?? false;
        let dialogData = {
            title: `Choose your Wall of ${this.wallType} shape`,
            buttons: []
        };

        if (!wallType.toLowerCase().includes("light") && !wallType.toLowerCase().includes("sand")) {
            dialogData.buttons.push({
                label: `Sphere/Dome/Ring(${wallOptions.circle.dimensions.radius}ft radius)`,
                value: {
                    dimensions: wallOptions.circle.dimensions,
                    texture: this._getTexture({ type: 'circle', effectData: this.effectOptions }, wallType, useWebP),
                    type: "circle"
                }
            });
        }
        switch (wallCategory) {
            case "wall":
                dialogData.buttons.push({
                    label: `Wall(${wallOptions.rect.dimensions.length}ft x ${wallOptions.rect.dimensions.width}ft)`,
                    value: {
                        dimensions: wallOptions.rect.dimensions,
                        texture: this._getTexture({ type: 'wall', effectData: this.effectOptions }, wallType, useWebP),
                        type: "ray"
                    }
                });
                break;
            case "panels":
                dialogData.buttons.push({
                    label: `Horizontal Panels(${wallOptions.rect.horizontal.dimensions.length}ft x ${wallOptions.rect.horizontal.dimensions.width}ft)`,
                    value: {
                        dimensions: wallOptions.rect.horizontal.dimensions,
                        texture: this._getTexture({ type: 'panel', subtype: 'horizontal', effectData: this.effectOptions }, wallType, useWebP),
                        type: "h-panels"
                    }
                });
                dialogData.buttons.push({
                    label: `Vertical Panels(${wallOptions.rect.vertical.dimensions.length}ft x ${wallOptions.rect.vertical.dimensions.width}ft)`,
                    value: {
                        dimensions: wallOptions.rect.vertical.dimensions,
                        texture: this._getTexture({ type: 'panel', subtype: 'vertical', effectData: this.effectOptions }, wallType, useWebP),
                        type: "v-panels"
                    }
                });
                break;
            default:
                break;
        }
        return dialogData;

    }

    _setBaseTemplateData(dimensions, type) {
        this.baseTemplateData.flags.advancedspelleffects.dimensions = dimensions;
        this.baseTemplateData.flags.tagger.tags.push('0');
        if (type == "circle") {
            this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.CIRCLE;
            this.baseTemplateData["distance"] = dimensions.radius;
        } else if (type == "ray") {
            this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
            this.baseTemplateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
            //this.baseTemplateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
            this.baseTemplateData["width"] = this.effectOptions.wallWidth;
        } else if (type == "v-panels") {
            this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
            this.baseTemplateData["distance"] = dimensions.length;
        } else if (type == "h-panels") {
            this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE;
            this.baseTemplateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
            this.baseTemplateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
        }
        switch (this.wallType) {
            case 'fire':
                let damageRoll;
                if (this.effectOptions.levelScaling) {
                    damageRoll = `${Number(this.itemLevel) + 1}d8`;
                } else {
                    damageRoll = `${this.effectOptions.dmgDieCount}${this.effectOptions.dmgDie}${this.effectOptions.dmgMod > 0 ? ` + ${this.effectOptions.dmgMod}` : ''}`;

                }

                this.baseTemplateData.flags.advancedspelleffects.wallOperationalData = {
                    savingThrowOnCast: true,
                    savingThrow: 'dex',
                    halfDamOnSave: true,
                    damage: damageRoll,
                    damageType: 'fire',
                    damageOnTouch: true,
                    savingThrowOnTouch: false,
                    checkForTouch: true,
                    damageSide: '',
                    damageInArea: true,
                    damageArea: {},
                    damageOnCast: true,
                    savingThrowDC: this.actor.data.data.attributes.spelldc ?? 0,
                    chatMessage: this.chatMessage,
                    item: this.item.id,
                    casterActor: this.actor.id,
                    range: this.effectOptions?.range ?? 10,
                    casterToken: this.token.id
                }
        }

    }

    _getTexture(options, wallType, useWebP = false) {
        let texture = "";
        //console.log('options:', options);
        switch (wallType) {
            case "thorns":
                if (useWebP) {
                    texture = 'modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Brown_Thumb.webp';
                } else {
                    texture = 'jb2a.entangle.brown';
                }
                break;
            case "fire":
                if (options.type == "circle") {
                    if (useWebP) {
                        texture = `modules/jb2a_patreon/Library/Generic/Fire/FireRing_01_Circle_${options.effectData.fireColor == "yellow" ? "red" : options.effectData.fireColor}_Thumb.webp`;
                    } else {
                        texture = `jb2a.fire_ring.900px.${options.effectData.fireColor == "yellow" ? "red" : options.effectData.fireColor}`;
                    }
                } else if (options.type == "wall") {
                    if (useWebP) {
                        texture = `modules/jb2a_patreon/Library/4th_Level/Wall_Of_Fire/WallOfFire_01_${options.effectData.fireColor}_Thumb.webp`;
                    } else {
                        texture = `jb2a.wall_of_fire.300x100.${options.effectData.fireColor}`;
                    }
                }
                break;
            case "force":
                if (options.type == "circle") {
                    if (useWebP) {
                        texture = `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${options.effectData.forceColor}_Sphere_Thumb.webp`;
                    } else {
                        texture = `jb2a.wall_of_force.sphere.${options.effectData.forceColor}`;
                    }
                } else if (options.type == "panel") {
                    if (options.subtype == "horizontal") {
                        if (useWebP) {
                            texture = `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${options.effectData.forceColor}_H_Thumb.webp`;
                        } else {
                            texture = `jb2a.wall_of_force.horizontal.${options.effectData.forceColor}`;
                        }
                    } else if (options.subtype == "vertical") {
                        if (useWebP) {
                            texture = `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${options.effectData.forceColor}_V_Thumb.webp`;
                        } else {
                            texture = `jb2a.wall_of_force.vertical.${options.effectData.forceColor}`;
                        }
                    }
                }
                break;
        }
        return texture;
    }

    static registerHooks() {
        if (!game.user.isGM) return;
        Hooks.on("updateMeasuredTemplate", wallSpell.updateMeasuredTemplate);
        Hooks.on("deleteMeasuredTemplate", wallSpell.deleteMeasuredTemplate);
        Hooks.on("preUpdateToken", wallSpell.preUpdateToken);
        Hooks.on("updateCombat", wallSpell.updateCombat);
        return;
    }

    static async updateCombat(combat) {
        const isGM = utilFunctions.isFirstGM();
        //console.log("Is first GM: ", isGM);
        if (!isGM) return;
        //console.log("Updating combat: ", combat);
        const token = canvas.tokens.get(combat.previous.tokenId);
        if (!token) return;
        const grid = canvas?.scene?.data.grid;
        if (!grid) return false;
        const tokenPos = { x: token.data.x, y: token.data.y };
        await token.document.unsetFlag("advancedspelleffects", "wallTouchedData.wallsTouched");
        const wallTemplates = canvas.templates.placeables.filter(template =>
        (template.document.getFlag('advancedspelleffects', 'wallOperationalData.damageOnTouch') == true
            || template.document.getFlag('advancedspelleffects', 'wallOperationalData.savingThrowOnTouch') == true));
        //console.log("wall templates: ", wallTemplates);
        if (wallTemplates.length && wallTemplates.length > 0) {
            for await (let wallTemplate of wallTemplates) {
                const templateDocument = wallTemplate.document;
                if (!templateDocument) return;
                //console.log(templateDocument.data);
                const templateData = templateDocument.data;
                if (!templateData) return;
                const aseData = templateDocument.getFlag("advancedspelleffects", 'wallOperationalData');
                const aseEffectData = templateDocument.getFlag("advancedspelleffects", 'wallEffectData');
                if (!aseData || !aseData.damageOnTouch) return;
                if (!aseData.checkForTouch) return;
                const wallData = {
                    wallName: templateDocument.getFlag("advancedspelleffects", "wallName") ?? "",
                    wallTemplateId: templateDocument.id,
                    wallType: templateDocument.getFlag("advancedspelleffects", 'wallType') ?? '',
                    wallOperationalData: aseData,
                    wallEffectData: aseEffectData,
                }
                const wallName = templateDocument.getFlag("advancedspelleffects", "wallName") ?? "";
                const mTemplate = templateDocument.object;
                const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: templateData.t, distance: mTemplate.data.distance };
                //console.log("Wall template details: ", templateDetails);
                if (templateDetails.shape == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
                    //console.log("Circle template detected...");
                    let templateCenter = { x: templateDetails.x, y: templateDetails.y };
                    let templateRadius = (templateDetails.distance / 5) * grid;
                    const sideToCheck = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.damageSide");
                    //console.log("Side to check: ", sideToCheck);

                    const startX = token.data.width >= 1 ? 0.5 : (token.data.width / 2);
                    const startY = token.data.height >= 1 ? 0.5 : (token.data.height / 2);

                    widthLoop: for (let x = startX; x < token.data.width; x++) {
                        for (let y = startY; y < token.data.height; y++) {
                            const currGrid = {
                                x: tokenPos.x + x * grid,
                                y: tokenPos.y + y * grid,
                            };
                            let inRange = false;
                            if (sideToCheck == "inside") {
                                inRange = utilFunctions.isPointInCircle(templateCenter, currGrid, 0, templateRadius);
                            } else if (sideToCheck == "outside") {
                                const outerRadius = templateRadius + ((aseData.range / 5) * grid);
                                inRange = utilFunctions.isPointInCircle(templateCenter, currGrid, templateRadius, outerRadius);
                            }
                            if (inRange) {
                                wallSpell.activateWallEffect(token, wallData);
                                break widthLoop;
                            } else {
                                console.log("Token not in range of wall circle: ", token.name);
                            }

                        }
                    }
                }
                else {
                    let templatePointA = { x: templateDetails.x, y: templateDetails.y };
                    const templateAngle = (templateData.direction) * (Math.PI / 180.0);
                    const templateLength = ((templateData.distance) * grid) / 5.0;
                    const templatePointBX = templatePointA.x + (templateLength * Math.cos(templateAngle));
                    const templatePointBY = templatePointA.y + (templateLength * Math.sin(templateAngle));
                    let templatePointB = { x: templatePointBX, y: templatePointBY };
                    if ((templatePointA.x > templatePointB.x && templatePointA.y > templatePointB.y) || (templatePointA.x < templatePointB.x && templatePointA.y > templatePointB.y)) {
                        const temp = templatePointA;
                        templatePointA = templatePointB;
                        templatePointB = temp;
                    } else if (templatePointA.x == templatePointB.x) {
                        if (templatePointA.y > templatePointB.y) {
                            const temp = templatePointA;
                            templatePointA = templatePointB;
                            templatePointB = temp;
                        }
                    } else if (templatePointA.y == templatePointB.y) {
                        if (templatePointA.x > templatePointB.x) {
                            const temp = templatePointA;
                            templatePointA = templatePointB;
                            templatePointB = temp;
                        }
                    }
                    //console.log("Template Point A: ", templatePointA);
                    //console.log("Template Point B: ", templatePointB);
                    const sideToCheck = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.damageSide");
                    //console.log("Side to check: ", sideToCheck);
                    const startX = token.data.width >= 1 ? 0.5 : (token.data.width / 2);
                    const startY = token.data.height >= 1 ? 0.5 : (token.data.height / 2);

                    widthLoop: for (let x = startX; x < token.data.width; x++) {
                        for (let y = startY; y < token.data.height; y++) {
                            const currGrid = {
                                x: tokenPos.x + x * grid,
                                y: tokenPos.y + y * grid,
                            };
                            const inRange = utilFunctions.isPointNearLine(templatePointA, templatePointB, currGrid, (aseData.range / 5) * grid);
                            if (inRange) {
                                let isOnSide = false;
                                if (sideToCheck == 'bottom' || sideToCheck == 'left') {
                                    isOnSide = utilFunctions.isPointOnLeft(templatePointA, templatePointB, currGrid);
                                } else if (sideToCheck == 'top' || sideToCheck == 'right') {
                                    isOnSide = utilFunctions.isPointOnLeft(templatePointB, templatePointA, currGrid);
                                }
                                if (isOnSide) {
                                    wallSpell.activateWallEffect(token, wallData);
                                    break widthLoop;
                                } else {
                                    console.log("Token not on side of wall: ", token.name);
                                }
                            } else {
                                console.log("Token not in range of wall: ", token.name);
                            }

                        }
                    }
                }
            }
        }


    }

    static async preUpdateToken(tokenDocument, updateData) {
        const isGM = utilFunctions.isFirstGM();
        if (!isGM) return;

        if ((!updateData.x && !updateData.y)) return;
        const token = tokenDocument;
        const grid = canvas?.scene?.data.grid;
        if (!grid) return false;

        const oldPos = { x: tokenDocument.data.x, y: tokenDocument.data.y };
        let newPos = { x: 0, y: 0 };
        newPos.x = (updateData.x) ? updateData.x : tokenDocument.data.x;
        newPos.y = (updateData.y) ? updateData.y : tokenDocument.data.y;
        const movementRay = new Ray(oldPos, newPos);

        const templates = Array.from(canvas?.scene?.templates ?? {});
        if (templates.length == 0) return;
        let templateDocument = {};

        let wallsTouched = token.getFlag("advancedspelleffects", "wallTouchedData.wallsTouched") ?? [];
        let wallName = "";
        for (let i = 0; i < templates.length; i++) {

            templateDocument = templates[i];
            const templateData = templateDocument.data;
            if (!templateData) return;
            const aseData = templateDocument.getFlag("advancedspelleffects", 'wallOperationalData');
            const aseEffectData = templateDocument.getFlag("advancedspelleffects", 'wallEffectData');
            if (!aseData || !aseData.damageOnTouch) return;
            if (!aseData.checkForTouch) return;
            wallName = templateDocument.getFlag("advancedspelleffects", "wallName") ?? "";
            const mTemplate = templateDocument.object;
            const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance };
            const templatePointA = { x: templateDetails.x, y: templateDetails.y };
            const templateAngle = (templateData.direction) * (Math.PI / 180.0);
            const templateLength = ((templateData.distance) * grid) / 5.0;
            const templatePointBX = templatePointA.x + (templateLength * Math.cos(templateAngle));
            const templatePointBY = templatePointA.y + (templateLength * Math.sin(templateAngle));
            const templatePointB = { x: templatePointBX, y: templatePointBY };

            const startX = token.data.width >= 1 ? 0.5 : (token.data.width / 2);
            const startY = token.data.height >= 1 ? 0.5 : (token.data.height / 2);

            widthLoop: for (let x = startX; x < token.data.width; x++) {
                for (let y = startY; y < token.data.height; y++) {

                    const currGrid = {
                        x: newPos.x + x * grid - templatePointA.x,
                        y: newPos.y + y * grid - templatePointA.y,
                    };
                    const oldCurrGrid = {
                        x: oldPos.x + x * grid - templatePointA.x,
                        y: oldPos.y + y * grid - templatePointA.y,
                    }
                    let previousContains = templateDetails.shape?.contains(oldCurrGrid.x, oldCurrGrid.y);
                    let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);
                    if (templateData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
                        previousContains = false;
                        contains = false;
                    }
                    let crossed = false;
                    if (!contains) {
                        const dragCoordOld = {
                            x: movementRay.A.x + x * grid,
                            y: movementRay.A.y + y * grid,
                        };
                        const dragCoordNew = {
                            x: movementRay.B.x + x * grid,
                            y: movementRay.B.y + y * grid,
                        };
                        //console.log("Drag Coord Old: ", dragCoordOld);
                        //console.log("Drag Coord New: ", dragCoordNew);
                        if (templateData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {

                            crossed = utilFunctions.lineCrossesCircle(dragCoordOld, dragCoordNew, templatePointA, (templateDetails.distance / 5) * grid);
                        } else {
                            crossed = utilFunctions.lineCrossesLine(dragCoordOld, dragCoordNew, templatePointA, templatePointB);
                        }
                    }

                    if (((previousContains && contains) || (!previousContains)) && (crossed || contains)) {
                        //console.log("Token touched wall!");
                        if (wallsTouched.includes(templateDocument.id)) {
                            console.log(`${token.name} has already been effected by this ${wallName} this turn - ${templateDocument.id}`);
                            ui.notifications.info(game.i18n.format("ASE.WallSpellAlreadyEffected", { name: token.name, wallName: wallName }));
                            break widthLoop;
                        } else {
                            console.log(`${token.name} touched ${wallName} - ${templateDocument.id}`);
                            ui.notifications.info(game.i18n.format("ASE.WallSpellTouchingWall", { name: token.name, wallName: wallName }));
                            wallsTouched.push(templateDocument.id);
                            const wallData = {
                                wallName: wallName,
                                wallTemplateId: templateDocument.id,
                                wallType: templateDocument.getFlag("advancedspelleffects", 'wallType') ?? '',
                                wallOperationalData: aseData,
                                wallEffectData: aseEffectData,
                            }
                            //await token.setFlag("advancedspelleffects", "wallTouchedData", tokenFlagData);
                            await wallSpell.activateWallEffect(token, wallData);
                            break widthLoop;
                        }
                    } else {
                        //console.log("Token did not cross template area...");
                    }
                }
            }
        }
        await token.setFlag("advancedspelleffects", "wallTouchedData.wallsTouched", wallsTouched);
    }

    static async activateWallEffect(token, wallData) {
        //console.log("Activating Wall Effect...");
        //console.log("Token: ", token);
        //console.log("Wall Data: ", wallData);
        const wallOperationalData = wallData.wallOperationalData;
        const wallEffectData = wallData.wallEffectData;
        function addTokenToText(token, damageTotal) {

            return `<div class="midi-qol-flex-container">
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
      <div>
      ${game.i18n.format("ASE.TookDamageMessage", { damageTotal: damageTotal })}
        
      </div>
      <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
    </div>`;

        }

        const casterActor = game.actors.get(wallOperationalData.casterActor);
        const casterToken = canvas.tokens.get(wallOperationalData.casterToken);
        const spellItem = casterActor.items.get(wallOperationalData.item);
        //console.log("Caster Token: ", casterToken);
        //console.log("Caster Actor: ", casterActor);
        //console.log("Spell Item: ", spellItem);

        let itemData = spellItem.data;
        itemData.data.components.concentration = false;

        if (utilFunctions.isMidiActive()) {
            const damageRoll = await new Roll(wallOperationalData.damage).evaluate({ async: true });
            //console.log(damageRoll);
            if (game.modules.get("dice-so-nice")?.active) {
                game.dice3d?.showForRoll(damageRoll);
            }
            let midiData;
            midiData = await new MidiQOL.DamageOnlyWorkflow(casterActor, casterToken.document, damageRoll.total, wallOperationalData.damageType, [token],
                damageRoll, {
                flavor: `${wallData.wallName} - Damage Roll (${wallOperationalData.damage} ${wallOperationalData.damageType})`,
                itemCardId: "new",
                itemData: spellItem.data
            });
            const chatMessage = await game.messages.get(midiData.itemCardId);
            let chatMessageContent = await duplicate(chatMessage.data.content);
            let newChatmessageContent = $(chatMessageContent);

            newChatmessageContent.find(".midi-qol-hits-display").empty();
            newChatmessageContent.find(".midi-qol-hits-display").append(
                $(addTokenToText(token, damageRoll.total))
            );
            await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });
            await ui.chat.scrollBottom();
        }
        new Sequence("Advanced Spell Effects")
            .sound()
            .file(wallEffectData.wallSpellDmgSound)
            .delay(Number(wallEffectData.wallSpellDmgSoundDelay) ?? 0)
            .volume(wallEffectData.wallSpellDmgVolume ?? 0.5)
            .playIf(wallEffectData.wallSpellDmgSound && wallEffectData.wallSpellDmgSound != "")
            .effect()
            .file(`jb2a.impact.004.${wallEffectData?.fireImpactColor ?? 'orange'}`)
            .attachTo(token)
            .randomRotation()
            .scaleIn(0.5, 200)
            .scaleToObject()
            .animateProperty("sprite", "rotation", { duration: 1000, from: 0, to: 45 })
            .randomOffset(0.5)
            .repeats(4, 100, 250)
            .play()
        return;
    }

    static async updateMeasuredTemplate(template, changes) {
        if (template.getFlag("advancedspelleffects", "wallSpellWallNum") && (changes.x !== undefined || changes.y !== undefined || changes.direction !== undefined)) {
            wallSpell.placeWalls(template, true);
        }
    }

    static async deleteMeasuredTemplate(template) {
        //console.log('template', template);
        const walls = Tagger.getByTag([`wallSpell-${template.getFlag("advancedspelleffects", "wallType")}-Wall${template.id}`]).map(wall => wall.id);
        if (walls.length) {
            await canvas.scene.deleteEmbeddedDocuments("Wall", walls);
        }
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        let wallSpellTemplates = Tagger.getByTag(`wallSpell-${effectOptions.wallType}-${casterActor.id}`);
        let wsTemplateIds = [];
        if (wallSpellTemplates.length > 0) {
            wallSpellTemplates.forEach(template => {
                wsTemplateIds.push(template.id);
            });
            await aseSocket.executeAsGM("deleteTemplates", wsTemplateIds);
        }
        //loop through every token and remove the templateID from the flag wallTouchedData.wallsTouched that matches wsTemplateIds
        const tokens = canvas.tokens.placeables;
        let tokenDocument = {};
        let wallsTouched = [];
        for (let i = 0; i < tokens.length; i++) {
            tokenDocument = tokens[i].document;
            wallsTouched = tokenDocument.getFlag("advancedspelleffects", "wallTouchedData.wallsTouched");
            if (!wallsTouched || wallsTouched.length == 0) continue;
            wallsTouched = wallsTouched.filter(wallId => !wsTemplateIds.includes(wallId));
            await tokenDocument.setFlag("advancedspelleffects", "wallTouchedData.wallsTouched", wallsTouched);
        }
    }

    static async placeWalls(templateDocument, deleteOldWalls = false) {
        //console.log("placing walls...");
        if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE) return;

        const wallType = templateDocument.getFlag("advancedspelleffects", "wallType") ?? "";
        //console.log('wallType: ', wallType);
        if (wallType != "force") return;

        if (deleteOldWalls) {
            const walls = Tagger.getByTag([`wallSpell-${wallType}-Wall${templateDocument.id}`]).map(wall => wall.id);
            if (walls.length) {
                await canvas.scene.deleteEmbeddedDocuments("Wall", walls);
            }
        }

        const template = templateDocument.object;
        //console.log('template: ', template);

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
                        flags: { tagger: { tags: [`wallSpell-${wallType}-Wall${templateDocument.id}`] } },
                        move: 20,
                        sight: 0,
                        light: 0,
                        sound: 0
                    })
                }
                lastPoint = [...currentPoint]
                if (!firstPoint) firstPoint = [...currentPoint]
            }

            walls.push({
                c: [...lastPoint, ...firstPoint],
                flags: { tagger: { tags: [`wallSpell-${wallType}-Wall${templateDocument.id}`] } },
                move: 20,
                sight: 0,
                light: 0,
                sound: 0
            })

        } else {

            const startPoint = template.ray.A;
            const endPoint = template.ray.B;

            walls.push({
                c: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
                flags: {
                    tagger: { tags: [`wallSpell-${wallType}-Wall${templateDocument.id}`] },
                    wallHeight: {
                        wallHeightTop: templateDocument.getFlag('advancedspelleffects', 'dimensions').width,
                        wallHeightBottom: 0
                    }
                },
                move: 20,
                sight: 0,
                light: 0,
                sound: 0
            })

        }
        //console.log('walls: ', walls);
        await aseSocket.executeAsGM("placeWalls", walls);

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
        //console.log("topSpots: ", topSpots);
        // console.log("leftSpots: ", leftSpots);
        //console.log("bottomSpots: ", bottomSpots);
        //console.log("rightSpots: ", rightSpots);
        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            ...bottomSpots,
            ...leftSpots,
            ...topSpots,
            ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
        ];
        //console.log("allSpots: ", allSpots);
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

    static async pickFireSide(templateDocument) {
        const wallData = templateDocument?.data;
        if (!wallData) return;
        let buttonDialogData;
        if (wallData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
            buttonDialogData = {
                title: "Pick dome/ring/sphere damaging side",
                buttons: [
                    {
                        label: "Inside",
                        value: 'inside'
                    },
                    {
                        label: "Outside",
                        value: 'outside'
                    },
                ]
            };
        } else {
            const direction = wallData.direction;
            if ((direction == 0 || direction == 180)) {
                buttonDialogData = {
                    title: "Pick wall damaging side",
                    buttons: [
                        {
                            label: "Top",
                            value: 'top'
                        },
                        {
                            label: "Bottom",
                            value: 'bottom'
                        },
                    ]
                };
            } else {
                buttonDialogData = {
                    title: "Pick wall damaging side",
                    buttons: [
                        {
                            label: "Left",
                            value: 'left'
                        },
                        {
                            label: "Right",
                            value: 'right'
                        },
                    ]
                };
            }

        }
        let damageSidePicked = await warpgate.buttonDialog(buttonDialogData, 'column');
        if (!damageSidePicked) return;
        await templateDocument.setFlag('advancedspelleffects', 'wallOperationalData.damageSide', damageSidePicked);
        //console.log("damageSidePicked: ", damageSidePicked);
    }

    static async handleOnCast(templateDocument) {
        const wallData = templateDocument.getFlag('advancedspelleffects', 'wallOperationalData');
        if (!wallData) return;
        const wallEffectData = templateDocument.getFlag('advancedspelleffects', 'wallEffectData');
        const grid = canvas?.scene?.data.grid;
        if (!grid) return false;
        const damageOnCast = wallData.damageOnCast;
        const damageType = wallData.damageType;
        const wallDamage = wallData.damage;
        const halfDamOnSave = wallData.halfDamOnSave ?? true;
        const savingThrowOnCast = wallData.savingThrowOnCast;
        const mTemplate = templateDocument.object;
        const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance };
        const chatMessageId = templateDocument.getFlag('advancedspelleffects', 'wallOperationalData.chatMessage');
        const chatMessage = await game.messages.get(chatMessageId);
        const casterActorId = templateDocument.getFlag('advancedspelleffects', 'wallOperationalData.casterActor');
        const casterActor = await game.actors.get(casterActorId);
        const wallItemId = templateDocument.getFlag('advancedspelleffects', 'wallOperationalData.item');
        const wallItem = await casterActor.items.get(wallItemId);
        //console.log(wallItem);
        if (!chatMessage) {
            ui.notifications.info(`No chat message found for wall spell, no damage will be applied`);
            return;
        }
        if (savingThrowOnCast) {
            const saveType = wallData.savingThrow;
            const saveDC = wallData.savingThrowDC;
            const tokens = canvas.tokens.placeables;
            const targets = [];
            if (tokens.length > 0) {
                for (let i = 0; i < tokens.length; i++) {
                    const token = tokens[i];
                    const startX = token.data.width >= 1 ? 0.5 : (token.data.width / 2);
                    const startY = token.data.height >= 1 ? 0.5 : (token.data.height / 2);
                    widthLoop: for (let x = startX; x < token.data.width; x++) {
                        for (let y = startY; y < token.data.height; y++) {
                            const currGrid = {
                                x: token.data.x + x * grid - templateDetails.x,
                                y: token.data.y + y * grid - templateDetails.y,
                            };
                            let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);

                            if (contains) {
                                targets.push(token);
                                break widthLoop;
                            } else {
                                //console.log("Token did not cross template area...");
                            }
                        }
                    }
                }
            }
            //console.log("targets: ", targets);
            //game.user.updateTokenTargets(targets);
            if (targets.length && targets.length > 0) {
                //console.log('chat message', chatMessage);
                let chatMessageContent = await duplicate(chatMessage.data.content);
                let targetTokens = new Set();
                let saves = new Set();
                let newChatmessageContent = $(chatMessageContent);
                newChatmessageContent.find(".midi-qol-saves-display").empty();
                if (halfDamOnSave) {
                    let damage = await new Roll(wallDamage).evaluate({ async: true });
                    for await (let targetToken of targets) {
                        let targetTokenAbilities = targetToken?.actor?.data?.data?.abilities ?? {};
                        let targetTokenSaveMod = targetTokenAbilities[saveType]?.save ?? 0;
                        let saveRoll = await new Roll("1d20+@mod", { mod: targetTokenSaveMod }).evaluate({ async: true });
                        let save = saveRoll.total;
                        targetTokens.add(targetToken)
                        if (save >= saveDC) {
                            saves.add(targetToken)
                        }
                        //console.log("Adding token to chat card...");
                        newChatmessageContent.find(".midi-qol-saves-display").append(
                            $(wallSpell.addTokenToText(targetToken, save, saveDC, damage))
                        );
                        //console.log("Wall Effect Data: ", wallEffectData);
                        new Sequence("Advanced Spell Effects")
                            .sound()
                            .file(wallEffectData.wallSpellDmgSound)
                            .delay(Number(wallEffectData.wallSpellDmgSoundDelay) ?? 0)
                            .volume(wallEffectData.wallSpellDmgVolume ?? 0.5)
                            .playIf(wallEffectData.wallSpellDmgSound && wallEffectData.wallSpellDmgSound != "")
                            .effect()
                            .file(`jb2a.impact.004.${wallEffectData?.fireImpactColor ?? 'orange'}`)
                            .attachTo(targetToken)
                            .randomRotation()
                            .scaleIn(0.5, 200)
                            .animateProperty("sprite", "rotation", { duration: 1000, from: 0, to: 45 })
                            .randomOffset(0.5)
                            .repeats(4, 100, 250)
                            .play()
                    }
                    await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });
                    await ui.chat.scrollBottom();
                    MidiQOL.applyTokenDamage(
                        [{ damage: damage.total, type: damageType }],
                        damage.total,
                        targetTokens,
                        wallItem,
                        saves
                    );
                }
            }

        }
    }

    static addTokenToText(token, roll, dc, damageRoll) {
        //console.log(damageRoll);
        let saveResult = roll >= dc ? true : false;

        return `<div class="midi-qol-flex-container">
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
      <div>
      ${saveResult ? game.i18n.format("ASE.SavePassMessage", { saveTotal: roll, damageTotal: Math.floor(damageRoll.total / 2) }) : game.i18n.format("ASE.SaveFailMessage", { saveTotal: roll, damageTotal: damageRoll.total })}
      </div>
      <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
    </div>`;
    }

    static async placePanels(aseData, template, panelDiag, type) {

        wallSpell.playEffects(aseData, template);
        wallSpell.placeWalls(template);
        /*console.log("wofPanelDiag: ", panelDiag);
        console.log("type: ", type);
        console.log("aseData: ", aseData);
        console.log("template: ", template);*/

        const gridSize = canvas.grid.h;
        const previousTemplateData = template.data;
        //console.log("previousTemplateData: ", previousTemplateData);
        let panelsRemaining = panelDiag.data.aseData.flags.panelCount;
        //console.log("Panels Remaining: ", panelsRemaining);

        const nextTemplateData = template.toObject();
        nextTemplateData.flags.advancedspelleffects['placed'] = false;
        delete nextTemplateData["_id"];
        //console.log("nextTemplateData: ", nextTemplateData);
        //console.log("previousTemplateData: ", previousTemplateData);
        nextTemplateData.flags.tagger.tags[1] = (Number(nextTemplateData.flags.tagger.tags[1]) + 1).toString();
        if (panelsRemaining < 2 || !panelDiag.rendered) {
            panelDiag.submit();
            return
        };

        panelDiag.data.aseData.flags.panelCount--;
        panelDiag.render(true);

        let previousTemplateCenter = {};
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
            square = wallSpell.sourceSquare({ x: previousTemplateCenter.x, y: previousTemplateCenter.y },
                previousTemplateWidthSquares, previousTemplateHeightSquares);



        } else if (type == "v-panels") {

            square = wallSpell.sourceSquareV({ x: previousTemplateData.x, y: previousTemplateData.y },
                previousTemplateData.distance, previousTemplateData.direction);
            nextTemplateData.x = square.x;
            nextTemplateData.y = square.y;
        }
        const displayTemplateData = JSON.parse(JSON.stringify(nextTemplateData));
        delete displayTemplateData.flags.advancedspelleffects["wallSpellWallNum"];
        let displayTemplate = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [displayTemplateData]))[0];
        // console.log("square: ", square);
        let currentSpotIndex = 0;
        updateTemplateLocation = async (crosshairs) => {
            //console.log("crosshairs: ", crosshairs);
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
                    placed: true
                }
            }
        }
        if (type == "v-panels") {
            newFlags.flags.advancedspelleffects["wallSpellWallNum"] = nextTemplateData.flags.advancedspelleffects["wallSpellWallNum"]
        }

        await displayTemplate.update(newFlags);
        wallSpell.placePanels(aseData, displayTemplate, panelDiag, type);

    }

    static playEffects(aseData, template) {
        //console.log("Playing effects...");
        //console.log("template: ", template);
        //console.log("aseData: ", aseData);
        if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {

            new Sequence()
                .sound()
                .file(aseData.flags.wallSpellSound)
                .delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0)
                .volume(aseData.flags.wallSpellVolume ?? 0.5)
                .playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "")
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
                .sound()
                .file(aseData.flags.wallSpellSound)
                .delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0)
                .volume(aseData.flags.wallSpellVolume ?? 0.5)
                .playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "")
                .effect(aseData.texture)
                .attachTo(template)
                .scaleToObject()
                .fadeIn(250)
                .fadeOut(250)
                .tilingTexture({
                    x: aseData.flags.wallSegmentSize / 10,
                    y: aseData.flags.wallSegmentSize / 10
                })
                .belowTokens()
                .zIndex(-1000)
                .persist()
                .play()

        } else {

            new Sequence()
                .sound()
                .file(aseData.flags.wallSpellSound)
                .delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0)
                .volume(aseData.flags.wallSpellVolume ?? 0.5)
                .playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "")
                .effect(aseData.texture)
                .attachTo(template)
                .stretchTo(template, { attachTo: true, onlyX: true })
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

        const dieOptions = {
            'd4': 'd4',
            'd6': 'd6',
            'd8': 'd8',
            'd10': 'd10',
            'd12': 'd12',
            'd20': 'd20',
        };

        const wallTypeOptions = {
            //'thorns': "Wall of Thorns",
            'fire': "Wall of Fire",
            'force': "Wall of Force",
            //'ice': "Wall of Ice",
            //'light': "Wall of Light",
            //'sand': "Wall of Sand",
            //'stone': "Wall of Stone",
            //'water': "Wall of Water"
        };

        const wallType = currFlags.wallType ?? 'fire';
        spellOptions.push({
            label: game.i18n.localize("ASE.WallTypeOptionsLabel"),
            tooltip: game.i18n.localize("ASE.WallTypeOptionsTooltip"),
            type: 'dropdown',
            options: wallTypeOptions,
            name: 'flags.advancedspelleffects.effectOptions.wallType',
            flagName: 'wallType',
            flagValue: currFlags.wallType ?? 'fire',
        });
        animOptions.push({
            label: game.i18n.localize("ASE.WallUseWebPLabel"),
            tooltip: game.i18n.localize("ASE.WallUseWebPTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.useWebP',
            flagName: 'useWebP',
            flagValue: currFlags.useWebP,
        });

        if (wallType == 'fire') {
            spellOptions.push({
                label: game.i18n.localize("ASE.ScaleWithLevelLabel"),
                tooltip: game.i18n.localize("ASE.ScaleWithLevelTooltip"),
                type: 'checkbox',
                name: 'flags.advancedspelleffects.effectOptions.levelScaling',
                flagName: 'levelScaling',
                flagValue: currFlags.levelScaling ?? true,
            });
            spellOptions.push({
                label: game.i18n.localize("ASE.DamageDieCountLabel"),
                tooltip: game.i18n.localize("ASE.DamageDieCountTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.dmgDieCount',
                flagName: 'dmgDieCount',
                flagValue: currFlags.dmgDieCount ?? 5,
            });
            spellOptions.push({
                label: game.i18n.localize("ASE.DamageDieLabel"),
                tooltip: game.i18n.localize("ASE.DamageDieTooltip"),
                type: 'dropdown',
                options: dieOptions,
                name: 'flags.advancedspelleffects.effectOptions.dmgDie',
                flagName: 'dmgDie',
                flagValue: currFlags.dmgDie ?? 'd8',
            });

            spellOptions.push({
                label: game.i18n.localize("ASE.DamageBonusLabel"),
                tooltip: game.i18n.localize("ASE.DamageBonusTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.dmgMod',
                flagName: 'dmgMod',
                flagValue: currFlags.dmgMod ?? 0,
            });
            spellOptions.push({
                label: game.i18n.localize("ASE.WallLengthLabel"),
                tooltip: game.i18n.localize("ASE.WallLengthTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.wallLength',
                flagName: 'wallLength',
                flagValue: currFlags.wallLength ?? 60,
            });

            spellOptions.push({
                label: game.i18n.localize("ASE.WallHeightLabel"),
                tooltip: game.i18n.localize("ASE.WallHeightTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.wallHeight',
                flagName: 'wallHeight',
                flagValue: currFlags.wallHeight ?? 20,
            });
            spellOptions.push({
                label: game.i18n.localize("ASE.WallWidthLabel"),
                tooltip: game.i18n.localize("ASE.WallWidthTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.wallWidth',
                flagName: 'wallWidth',
                flagValue: currFlags.wallWidth ?? 1,
            });
            animOptions.push({
                label: game.i18n.localize("ASE.WallOfFireColorLabel"),
                tooltip: game.i18n.localize("ASE.WallOfFireColorTooltip"),
                type: 'dropdown',
                options: utilFunctions.getDBOptions('jb2a.wall_of_fire.300x100'),
                name: 'flags.advancedspelleffects.effectOptions.fireColor',
                flagName: 'fireColor',
                flagValue: currFlags.fireColor,
            });
            animOptions.push({
                label: game.i18n.localize("ASE.WallOfFireImpactColorLabel"),
                tooltip: game.i18n.localize("ASE.WallOfFireImpactColorTooltip"),
                type: 'dropdown',
                options: utilFunctions.getDBOptions('jb2a.impact.004'),
                name: 'flags.advancedspelleffects.effectOptions.fireImpactColor',
                flagName: 'fireImpactColor',
                flagValue: currFlags.fireImpactColor,
            });
            soundOptions.push({
                label: game.i18n.localize("ASE.WallSpellDamageEffectSoundLabel"),
                tooltip: game.i18n.localize("ASE.WallSpellDamageEffectSoundTooltip"),
                type: 'fileInput',
                name: 'flags.advancedspelleffects.effectOptions.wallSpellDmgSound',
                flagName: 'wallSpellDmgSound',
                flagValue: currFlags.wallSpellDmgSound ?? '',
            });
            soundOptions.push({
                label: game.i18n.localize("ASE.WallSpellDamageEffectSoundDelayLabel"),
                tooltip: game.i18n.localize("ASE.WallSpellDamageEffectSoundDelayTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.wallSpellDmgSoundDelay',
                flagName: 'wallSpellDmgSoundDelay',
                flagValue: currFlags.wallSpellDmgSoundDelay ?? 0,
            });
            soundOptions.push({
                label: game.i18n.localize("ASE.WallSpellDamageEffectVolumeLabel"),
                tooltip: game.i18n.localize("ASE.WallSpellDamageEffectVolumeTooltip"),
                type: 'rangeInput',
                name: 'flags.advancedspelleffects.effectOptions.wallSpellDmgVolume',
                flagName: 'wallSpellDmgVolume',
                flagValue: currFlags.wallSpellDmgVolume ?? 0.5,
                min: 0,
                max: 1,
                step: 0.01,
            });
        }

        spellOptions.push({
            label: game.i18n.localize("ASE.WallRadiusLabel"),
            tooltip: game.i18n.localize("ASE.WallRadiusTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.wallRadius',
            flagName: 'wallRadius',
            flagValue: currFlags.wallRadius ?? 10,
        });

        if (wallType == 'force') {
            spellOptions.push({
                label: game.i18n.localize("ASE.WallSegmentSizeLabel"),
                tooltip: game.i18n.localize("ASE.WallSegmentSizeTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.wallSegmentSize',
                flagName: 'wallSegmentSize',
                flagValue: currFlags.wallSegmentSize ?? 10,
            });

            spellOptions.push({
                label: game.i18n.localize("ASE.WallPanelCountLabel"),
                tooltip: game.i18n.localize("ASE.WallPanelCountTooltip"),
                type: 'numberInput',
                name: 'flags.advancedspelleffects.effectOptions.panelCount',
                flagName: 'panelCount',
                flagValue: currFlags.panelCount ?? 10,
            });
            animOptions.push({
                label: game.i18n.localize("ASE.WallOfForceColorLabel"),
                type: 'dropdown',
                options: utilFunctions.getDBOptions('jb2a.wall_of_force.horizontal'),
                name: 'flags.advancedspelleffects.effectOptions.forceColor',
                flagName: 'forceColor',
                flagValue: currFlags.forceColor,
            });
        }


        soundOptions.push({
            label: game.i18n.localize("ASE.WallSpellInitialSoundLabel"),
            tooltip: game.i18n.localize("ASE.WallSpellInitialSoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.wallSpellSound',
            flagName: 'wallSpellSound',
            flagValue: currFlags.wallSpellSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.WallSpellInitialSoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.WallSpellInitialSoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.wallSpellSoundDelay',
            flagName: 'wallSpellSoundDelay',
            flagValue: currFlags.wallSpellSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.WallSpellInitialVolumeLabel"),
            tooltip: game.i18n.localize("ASE.WallSpellInitialVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.wallSpellVolume',
            flagName: 'wallSpellVolume',
            flagValue: currFlags.wallSpellVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });
        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}