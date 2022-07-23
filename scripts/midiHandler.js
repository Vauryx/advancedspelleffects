import { ASEHandler } from "./ASEHandler.js"
export class midiHandler {
    static registerHooks() {
        if (game.modules.get("midi-qol")?.active) {
            Hooks.on("midi-qol.preambleComplete", midiHandler._handleASE);
            Hooks.on("midi-qol.RollComplete", midiHandler._handleStateTransition);
            Hooks.on("midi-qol.preAttackRoll", midiHandler._getPreAttackInfo);
        }
    }

    static _getPreAttackInfo(workflow) {
        console.log("ASE: MIDI HANDLER: PRE ATTACK INFO", workflow);
    }

    static async _handleASE(workflow) {
        console.log("ASE: MIDI HANDLER: HANDLE ASE", workflow);
        const itemUUID = workflow.itemUuid;
        let dialogData;
        let currentItemState = game.ASESpellStateManager.getState(itemUUID);
        if (currentItemState) {
            console.log("ASE: MIDI HANDLER: Item State Found!", currentItemState);
            if(currentItemState.active){
                return true;
            }
        }
        else {
            console.log("ASE: MIDI HANDLER: Item State Not Found!");
            dialogData = await ASEHandler.handleASE(workflow);
            if(!dialogData?.iterate) return;
            console.log("ASE: MIDI Handler: dialogData: ", dialogData);
            game.ASESpellStateManager.addSpell(itemUUID, {iterate: dialogData.iterate, 
                                                            casterId: dialogData.casterId, 
                                                            targets: dialogData.targets, 
                                                            itemCardId: dialogData.itemCardId});
            currentItemState = game.ASESpellStateManager.getState(itemUUID);
            console.log("ASE: MIDI HANDLER: Current Item State: ", currentItemState);
            game.ASESpellStateManager.nextState(itemUUID);
            return false;
        }
    }

    static async _handleStateTransition(workflow) {
        console.log("ASE: MIDI HANDLER: STATE TRANSITION", workflow);
        const itemUUID = workflow.itemUuid;
        let currentItemState = game.ASESpellStateManager.getState(itemUUID);
        if (!currentItemState) {return;}
        if(currentItemState.active){
            game.ASESpellStateManager.nextState(itemUUID);
            return;
        }
    }
}