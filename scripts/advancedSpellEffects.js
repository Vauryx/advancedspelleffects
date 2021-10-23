import * as utilFunctions from "./utilityFunctions.js";
import { setupASESocket } from "./aseSockets.js";
import { aseSocket } from "./aseSockets.js";
import { concentrationHandler } from "./concentrationHandler.js";
// Importing spells
import { darkness } from "./spells/darkness.js";
import { detectMagic } from "./spells/detectMagic.js";
import { callLightning } from "./spells/callLightning.js";
import { fogCloud } from "./spells/fogCloud.js";
import { spiritualWeapon } from "./spells/spiritualWeapon.js";
import { steelWindStrike } from "./spells/steelWindStrike.js";
import { thunderStep } from "./spells/thunderStep.js";
import { summonCreature } from "./spells/summonCreature.js";
import { animateDead } from "./spells/animateDead.js";
import { witchBolt } from "./spells/witchBolt.js";

//Setting up socketlib Functions to be run as GM
Hooks.once('setup', function () {
    setupASESocket();
});

Hooks.on('init', () => {
    //Hook onto MIDI- roll complete to activate effects
    if (game.modules.get("midi-qol")?.active) {
        Hooks.on("midi-qol.RollComplete", (workflow) => {
            console.log("MIDI Workflow: ", workflow);
            handleASEMIDI(workflow)
        });
    }
    else {
        Hooks.on("preCreateChatMessage", async (msg) => {
            //console.log("Chat Message Data: ", msg);
            let caster = canvas.tokens.get(msg.data.speaker.token);
            let casterActor = caster?.actor;
            let spellItem = casterActor?.items?.getName(msg.data.flavor);
            let aseSpell = spellItem?.data?.flags?.advancedspelleffects ?? false;
            if (!caster || !casterActor || !spellItem || !aseSpell) return;
            let chatContent = msg.data.content;
            let spellLevel = chatContent.charAt(chatContent.indexOf("data-spell-level")+18);
            let spellTargets = Array.from(game.user.targets);
            let data = {
                actor: casterActor,
                token: caster,
                tokenId: msg.data.speaker.token,
                item: spellItem,
                itemLevel: spellLevel,
                targets: spellTargets
            };
            if(spellItem.data.data.components.concentration){
                await addConcentration(casterActor, spellItem);
            }
            
            console.log(data);
            handleASENOMIDI(data);
            //specialCaseAnimations(msg);
        });
    }

    function getSelfTarget(actor) {
        if (actor.token)
            return actor.token;
        const speaker = ChatMessage.getSpeaker({ actor });
        if (speaker.token)
            return canvas.tokens?.get(speaker.token);
        return new CONFIG.Token.documentClass(actor.getTokenData(), { actor });
    }

    async function addConcentration(actor, item) {
        //console.log("item in addConcentration: ", item);
        let selfTarget = item.actor.token ? item.actor.token.object : getSelfTarget(item.actor);
        if (!selfTarget)
            return;

        let concentrationName = "Concentrating";
        const inCombat = (game.combat?.turns.some(combatant => combatant.token?.id === selfTarget.id));
        const effectData = {
            changes: [],
            origin: item.uuid,
            disabled: false,
            icon: "modules/advancedspelleffects/icons/concentrate.png",
            label: concentrationName,
            duration: {},
            flags: { "advancedspelleffects": { isConcentration: item?.uuid } }
        };
        const convertedDuration = utilFunctions.convertDuration(item.data.data.duration, inCombat);
        if (convertedDuration?.type === "seconds") {
            effectData.duration = { seconds: convertedDuration.seconds, startTime: game.time.worldTime };
        }
        else if (convertedDuration?.type === "turns") {
            effectData.duration = {
                rounds: convertedDuration.rounds,
                turns: convertedDuration.turns,
                startRound: game.combat?.round,
                startTurn: game.combat?.turn
            };
        }
        await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
        //console.log("Done creating and adding effect to actor...");
        return true;
        // return await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

    }

    async function handleASEMIDI(midiData) {
        // check if the spell being rolled is marked as an ASE spell
        let item = midiData.item;
        let aseFlags = item?.data?.flags?.advancedspelleffects ?? false;
        if (!aseFlags.enableASE) return;

        // check for required modules
        let missingModule = utilFunctions.checkModules();
        if (missingModule) {
            ui.notifications.error(missingModule);
            return;
        }
        //Activate spell
        switch (item.name) {
            case "Darkness":
                await darkness.createDarkness(midiData);
                return;
            case "Detect Magic":
                await detectMagic.activateDetectMagic(midiData);
                return;
            case "Call Lightning":
                if (!midiData.flavor?.includes("Lightning Bolt")) {
                    await callLightning.createStormCloud(midiData);
                }
                return;
            case "Fog Cloud":
                await fogCloud.createFogCloud(midiData);
                return;
            case "Spiritual Weapon":
                await spiritualWeapon.createSpiritualWeapon(midiData);
                return;
            case "Steel Wind Strike":
                if (!midiData.flavor?.includes("Steel Wind Strike")) {
                    await steelWindStrike.doStrike(midiData);
                }
                return;
            case "Thunder Step":
                await thunderStep.doTeleport(midiData);
                return;
            case "Animate Dead":
                await animateDead.rise(midiData);
                return;
            case 'Witch Bolt':
                if (midiData.flavor != "Witch Bolt - Damage Roll (1d12 Lightning)" || !midiData.flavor) {
                    console.log('Casting Witch Bolt!', midiData.flavor);
                    await witchBolt.cast(midiData);
                }
                else {
                    console.log('Activating Witch Bolt!', midiData.flavor);
                    await witchBolt.activateBolt(midiData);
                }
                return;
        }
        if (item.name.includes("Summon")) {
            await summonCreature.doSummon(midiData);
            return;
        }
        else {
            console.log("--SPELL NAME NOT RECOGNIZED--");
            return;
        }
    }

    async function handleASENOMIDI(msgData) {
        let item = msgData.item;
        let aseFlags = item?.data?.flags?.advancedspelleffects ?? false;
        if (!aseFlags.enableASE) return;

        // check for required modules
        let missingModule = utilFunctions.checkModules();
        if (missingModule) {
            ui.notifications.error(missingModule);
            return;
        }
        switch (item.name) {
            case "Darkness":
                await darkness.createDarkness(msgData);
                return;
            case "Detect Magic":
                await detectMagic.activateDetectMagic(msgData);
                return;
            case "Call Lightning":
                if (!msgData.flavor?.includes("Lightning Bolt")) {
                    await callLightning.createStormCloud(msgData);
                }
                return;
            case "Fog Cloud":
                await fogCloud.createFogCloud(msgData);
                return;
            case "Spiritual Weapon":
                await spiritualWeapon.createSpiritualWeapon(msgData);
                return;
            case "Steel Wind Strike":
                if (!msgData.flavor?.includes("Steel Wind Strike")) {
                    await steelWindStrike.doStrike(msgData);
                }
                return;
            case "Thunder Step":
                await thunderStep.doTeleport(msgData);
                return;
            case "Animate Dead":
                await animateDead.rise(msgData);
                return;
            case 'Witch Bolt':
                if (msgData.flavor != "Witch Bolt - Damage Roll (1d12 Lightning)" || !msgData.flavor) {
                    console.log('Casting Witch Bolt!', msgData.flavor);
                    await witchBolt.cast(msgData);
                }
                else {
                    console.log('Activating Witch Bolt!', msgData.flavor);
                    await witchBolt.activateBolt(msgData);
                }
                return;
        }
        if (item.name.includes("Summon")) {
            await summonCreature.doSummon(msgData);
            return;
        }
        else {
            console.log("--SPELL NAME NOT RECOGNIZED--");
            return;
        }
    }
});


//Take care of Setup
const aseModules = {
    callLightning,
    concentrationHandler,
    detectMagic,
    fogCloud,
    darkness,
    spiritualWeapon,
    steelWindStrike,
    thunderStep,
    summonCreature,
    animateDead,
    witchBolt
}
Hooks.once('ready', async function () {
    Object.values(aseModules).forEach(cl => cl.registerHooks());
});
