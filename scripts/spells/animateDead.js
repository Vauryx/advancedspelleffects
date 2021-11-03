import { animateDeadDialog } from "../apps/animte-dead-dialog.js"
import ASESettings from "../apps/aseSettings.js";
import * as utilFunctions from "../utilityFunctions.js";

export class animateDead {
    static registerHooks() {
        if (game.settings.get("advancedspelleffects", "preloadFiles")) {
            //console.log("Starting Preload of ASE Animate Dead...");
            Hooks.on("sequencer.ready", animateDead._preloadAssets);
        }
        return;
    }
    static async _preloadAssets() {
        /* BULK PRELOADER 
        console.log('Preloading assets for ASE Animate Dead...');
        let assetDBPaths = [
            "jb2a.magic_signs.circle.02",
            "jb2a.eldritch_blast",
            "jb2a.energy_strands.complete",
            "jb2a.portals.vertical.vortex",
            "jb2a.impact.010"
        ];
        let assetFilePaths = await utilFunctions.getAssetFilePaths(assetDBPaths);
        //console.log('Files about to be preloaded...', assetDBPaths);
        await Sequencer.Preloader.preloadForClients(assetFilePaths, true);
        console.log(`Preloaded ${assetFilePaths.length} assets!`);
        */
        // iterate over all actors in game.actors and find all items with the ASE Animate Dead effect
        // and preload the assets for the effect 
        console.log('Preloading assets for ASE Animate Dead...');
        let assetDBPaths = [];
        let animateDeadItems = utilFunctions.getAllItemsNamed("Animate Dead");
        if (animateDeadItems.length > 0) {
            animateDeadItems.forEach(async function (item) {
                let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
                //console.log(aseSettings);
                
                let portalAnimIntro = `jb2a.magic_signs.circle.02.${aseSettings.magicSchool}.intro.${aseSettings.magicSchoolColor}`;
                let portalAnimLoop = `jb2a.magic_signs.circle.02.${aseSettings.magicSchool}.loop.${aseSettings.magicSchoolColor}`;
                let portalAnimOutro = `jb2a.magic_signs.circle.02.${aseSettings.magicSchool}.outro.${aseSettings.magicSchoolColor}`;
                let effectAAnim = `jb2a.eldritch_blast.${aseSettings.effectAColor}.05ft`;
                let effectBAnim = `jb2a.energy_strands.complete.${aseSettings.effectBColor}.01`;

                if(!assetDBPaths)
                //Add animation to assetDBPaths if it is not already in the list
                if (!assetDBPaths.includes(portalAnimIntro)) assetDBPaths.push(portalAnimIntro);
                if(!assetDBPaths.includes(portalAnimLoop)) assetDBPaths.push(portalAnimLoop);
                if(!assetDBPaths.includes(portalAnimOutro)) assetDBPaths.push(portalAnimOutro);
                if(!assetDBPaths.includes(effectAAnim)) assetDBPaths.push(effectAAnim);
                if(!assetDBPaths.includes(effectBAnim)) assetDBPaths.push(effectBAnim);
            });
        }
        //console.log('DB Paths about to be preloaded...', assetDBPaths);
        //console.log('Files about to be preloaded...', assetFilePaths);
        console.log(`Preloaded ${assetDBPaths.length} assets for Animate Dead!`);
        await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
        return;
    }
    static async rise(midiData) {

        const actorD = midiData.actor;
        const tokenD = canvas.tokens.get(midiData.tokenId);
        const itemD = actorD.items.getName(midiData.item.name);
        let aseSettings = itemD.getFlag("advancedspelleffects", "effectOptions");
        const spellLevel = midiData.itemLevel ? Number(midiData.itemLevel) : 3;
        const spellSaveDC = midiData.actor?.data?.data?.attributes?.spelldc ?? 10;
        const raiseLimit = (2 * spellLevel) - 5;

        let corpses = canvas.tokens.placeables.filter(function (target) {
            return target?.actor?.data?.data?.attributes?.hp?.value == 0
                && utilFunctions.measureDistance(utilFunctions.getCenter(tokenD.data), utilFunctions.getCenter(target.data)) <= 10
                && target !== tokenD
        });

        console.log("Detected corpses in range: ", corpses);
        new animateDeadDialog(corpses, { raiseLimit: raiseLimit, effectSettings: aseSettings }).render(true);

    }
}