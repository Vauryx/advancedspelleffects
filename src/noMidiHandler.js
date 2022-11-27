import { ASEHandler } from "./ASEHandler.js";
import { concentrationHandler } from "./concentrationHandler.js";

export class noMidiHandler {
    static registerHooks() {
        if (!game.modules.get("midi-qol")?.active) {
            Hooks.on("preCreateChatMessage", noMidiHandler._handleASE);
        }
    }

    static async _handleASE(msg) {
        //console.log("Chat Message Data: ", msg);
        let caster = canvas.tokens.get(msg?.speaker?.token);
        let casterActor = caster?.actor;
        let spellItem;
        if(msg?.flags?.betterrolls5e){
            console.log("Detected Better Rolls...");
            spellItem = casterActor?.items?.get(msg.flags.betterrolls5e.itemId);
        }
        else {
            spellItem = casterActor?.items?.getName(msg.flavor);
        }
        let aseSpell = spellItem?.flags?.advancedspelleffects ?? false;
        if (!caster || !casterActor || !spellItem || !aseSpell) return;
        let chatContent = msg.content;
        let spellLevel = Number(chatContent.charAt(chatContent.indexOf("data-spell-level")+18));
        let spellTargets = Array.from(game.user.targets);
        let data = {
            actor: casterActor,
            token: caster,
            tokenId: msg?.speaker?.token,
            item: spellItem,
            itemLevel: spellLevel,
            targets: spellTargets,
            itemCardId: msg.id
        };
        if(spellItem.system.components.concentration){
            await concentrationHandler.addConcentration(casterActor, spellItem);
        }
        
        console.log("NO-MIDI DATA: ", data);
        ASEHandler.handleASE(data);
        //specialCaseAnimations(msg);
    }
}
