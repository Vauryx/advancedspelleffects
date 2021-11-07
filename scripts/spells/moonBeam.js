import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class moonBeam {
    static registerHooks() {
        Hooks.on("updateToken", moonBeam._updateToken);
        Hooks.on("updateCombat", moonBeam._updateCombat);
        return;
    }

    static async _updateToken(tokenDocument, updateData) {
        if ((!updateData.x && !updateData.y)) return;

        console.log('Update Token tokenDocument: ', tokenDocument);
        console.log('Update Token updateData: ', updateData);

        const moonbeamTiles = await Tagger.getByTag(`-moonbeam`);
        if (moonbeamTiles.length == 0) return;

        const token = canvas.tokens.get(tokenDocument.id);
        let newTokenPosition = { x: 0, y: 0 };
        newTokenPosition.x = (updateData.x) ? updateData.x : token.data.x;
        newTokenPosition.y = (updateData.y) ? updateData.y : token.data.y;
        newTokenPosition = utilFunctions.getCenter(newTokenPosition);

        let inTiles = token.document.getFlag("advancedspelleffects", "moonbeam.inTiles") ?? [];
        //iterate over every moonbeam tile
        for (let i = 0; i < moonbeamTiles.length; i++) {
            let moonbeamTile = moonbeamTiles[i];
            console.log('Moonbeam tile found: ', moonbeamTile);
            //check if token has entered the tile
            if (newTokenPosition.x >= moonbeamTile.x && newTokenPosition.x <= moonbeamTile.x + moonbeamTile.width && newTokenPosition.y >= moonbeamTile.y && newTokenPosition.y <= moonbeamTile.y + moonbeamTile.height) {
                //check if tile exists in inTiles which is an array of tiles
                if (inTiles.includes(moonbeamTile.id)) {

                    console.log(`${token.name} has already entered this tile this turn - ${moonbeamTile.id}`);
                    //do nothing
                }
                else {
                    console.log(`${token.name} is entering the space of a moonbeam tile - ${moonbeamTile.id}`);
                    //add the tile to the inTiles array
                    inTiles.push(moonbeamTile.id);
                }
            }
            // check if token was previously in the space of a moonbeam tile
            else if (inTiles.includes(moonbeamTile.id)) {
                console.log(`${token.name} is leaving the space of a moonbeam tile - ${moonbeamTile.id}`);
                //remove the tile from the inTiles array
                //inTiles.splice(inTiles.indexOf(moonbeamTile.id), 1);
            }
        }
        // iterate over every tile that token is in
        for (let i = 0; i < inTiles.length; i++) {

        }
        await token.document.setFlag("advancedspelleffects", "moonbeam.inTiles", inTiles);
    }

    static async _updateCombat(combat) {

        const moonbeamTiles = await Tagger.getByTag(`-moonbeam`);
        if (moonbeamTiles.length == 0) return;

        console.log("Updating Combat for ASE Moonbeam...");
        console.log(combat);
        const combatantToken = canvas.tokens.get(combat.current.tokenId);
        const combatantActor = combatantToken.actor;
        const combatantPosition = utilFunctions.getCenter(combatantToken.data);

        let inTiles = [];
        //iterate over every moonbeam tile
        for (let i = 0; i < moonbeamTiles.length; i++) {
            let moonbeamTile = moonbeamTiles[i];
            console.log('Moonbeam tile found: ', moonbeamTile);
            //check if token has entered the tile
            if (combatantPosition.x >= moonbeamTile.x && combatantPosition.x <= moonbeamTile.x + moonbeamTile.width && combatantPosition.y >= moonbeamTile.y && combatantPosition.y <= moonbeamTile.y + moonbeamTile.height) {
                //check if tile exists in inTiles which is an array of tiles
                console.log(`${combatantToken.name} is starting its turn in the space of a moonbeam tile - ${moonbeamTile.id}`);
                //add the tile to the inTiles array
                inTiles.push(moonbeamTile.id);
            }
        }
        await combatantToken.document.setFlag("advancedspelleffects", "moonbeam.inTiles", inTiles);
    }

    static async handleConcentration(casterActor, casterToken, effectOptions) {
        //console.log("Handling concentration removal for ASE Darknes...");
        let moonbeamTiles = await Tagger.getByTag(`${casterToken.id}-moonbeam`);
        if (moonbeamTiles.length > 0) {
            aseSocket.executeAsGM("deleteTiles", [moonbeamTiles[0].id]);
        }
        await warpgate.revert(casterToken.document, `${casterActor.id}-moonbeam`);
        ui.notifications.info(`Move Moonbeam has been removed from your At-Will spells.`);
    }

    static async callBeam(data) {
        const casterActor = data.actor;
        const casterToken = canvas.tokens.get(data.tokenId);
        const itemCardId = data.itemCardId;
        const spellItem = data.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        console.log(aseEffectOptions);
        const beamIntro = `jb2a.moonbeam.01.intro.${aseEffectOptions.moonbeamColor}`;
        const beamOutro = `jb2a.moonbeam.01.outro.${aseEffectOptions.moonbeamColor}`;
        const beamLoop = `jb2a.moonbeam.01.no_pulse.${aseEffectOptions.moonbeamColor}`;
        const updates = {
            embedded: {
                Item: {
                    "Move Moonbeam": {
                        "type": "spell",
                        "img": spellItem.img,
                        "data": {
                            "ability": "",
                            "actionType": "other",
                            "activation": { "type": 'action', "cost": 1 },
                            "damage": { "parts": [], "versatile": "" },
                            "level": data.itemLevel,
                            "preparation": { "mode": 'atwill', "prepared": true },
                            "range": { "value": null, "long": null, "units": "" },
                            "school": "evo",
                            "target": { "value": null, "width": null, "units": "", "type": "" },
                            "description": {
                                "value": "Command your Moonbeam to move up to 60 feet in any direction."
                            }
                        },
                        "flags": {
                            "advancedspelleffects": {
                                "enableASE": true,
                                'effectOptions': {
                                    'moonbeamColor': aseEffectOptions.moonbeamColor
                                }
                            }
                        }
                    }
                }
            }
        }

        let moonbeamLoc = await moonBeam.chooseBeamLocation(beamLoop);

        await warpgate.mutate(casterToken.document, updates, {}, { name: `${casterActor.id}-moonbeam` });
        ui.notifications.info(`Move Moonbeam has been added to your At-Will spells.`);

        let moonbeamTile = await placeBeam(moonbeamLoc, casterToken.id, beamLoop);
        console.log(moonbeamTile);

        let beamSeq = new Sequence("Advanced Spell Effects")
            .effect()
            .file(beamIntro)
            .atLocation(moonbeamLoc)
            .scale(0.5)
            .waitUntilFinished(-500)
            .animation()
            .on(moonbeamTile)
            .fadeIn(500)
        await beamSeq.play();

        async function placeBeam(templateData, tokenId, beamAnim) {
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;

            tileWidth = (templateData.width * canvas.grid.size);
            tileHeight = (templateData.width * canvas.grid.size);

            tileX = templateData.x - (tileWidth / 2);
            tileY = templateData.y - (tileHeight / 2);

            const animPath = Sequencer.Database.getEntry(beamAnim).file;

            let data = [{
                alpha: 0,
                width: tileWidth,
                height: tileHeight,
                img: animPath,
                overhead: true,
                occlusion: {
                    alpha: 0,
                    mode: 0,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tileX,
                y: tileY,
                z: 100,
                flags: { tagger: { tags: [`${tokenId}-moonbeam`] } }
            }]
            //console.log("Placing as tile: ", data);
            let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
            console.log("ASE MOONBEAM: Moonbeam Tile Created: ", createdTiles);
            return createdTiles[0];

        }
    }

    static async moveBeam(data) {
        const casterActor = data.actor;
        const casterToken = canvas.tokens.get(data.tokenId);
        const spellItem = data.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        console.log(aseEffectOptions);
        const beamLoop = `jb2a.moonbeam.01.loop.${aseEffectOptions.moonbeamColor}`;
        const gustAnim = "jb2a.gust_of_wind.veryfast";
        let moonbeamTiles = await Tagger.getByTag(`${casterToken.id}-moonbeam`);
        if (moonbeamTiles?.length == 0) {
            console.log("Moonbeam not found");
            ui.notifications.error(`Moonbeam not found.`);
            return;
        }
        let moonbeamTile = moonbeamTiles[0];

        let moonbeamLoc = await moonBeam.chooseBeamLocation(beamLoop);
        //console.log(moonbeamLoc);
        //console.log(moonbeamTile);

        await aseSocket.executeAsGM("moveTile", moonbeamLoc, moonbeamTile.id);

    }

    static async chooseBeamLocation(beamAnim) {
        const displayCrosshairs = async (crosshairs) => {
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(beamAnim)
                .attachTo(crosshairs)
                .persist()
                .scale(0.5)
                .opacity(0.5)
                .play()

        }
        let crosshairsConfig = {
            size: 2,
            label: 'Moonbeam',
            tag: 'moonbeam-crosshairs',
            drawIcon: false,
            drawOutline: false,
            interval: 1
        }
        let placedLoc = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
        return placedLoc;
    }
}