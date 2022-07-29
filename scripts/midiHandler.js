import { ASEHandler } from "./ASEHandler.js"
export class midiHandler {
    static registerHooks() {
        if (game.modules.get("midi-qol")?.active) {
            Hooks.on("midi-qol.preambleComplete", midiHandler._handleASE);
            Hooks.on("midi-qol.RollComplete", midiHandler._handleStateTransition);
            //Hooks.on("midi-qol.preItemRoll", midiHandler._getPreItemRollInfo);
            //Hooks.on("midi-qol.preAttackRoll", midiHandler._getPreAttackRollInfo);
            //Hooks.on("midi-qol.AttackRollComplete", midiHandler._getAttackRollCompleteInfo);
            //Hooks.on("midi-qol.preCheckHits", midiHandler._getPreCheckHitsInfo);
            //Hooks.on("midi-qol.preDamageRoll", midiHandler._getPreDamageRollInfo);
           // Hooks.on("midi-qol.preDamageRollComplete", midiHandler._getPreDamageRollComplete);
            //Hooks.on("midi-qol.damageRollComplete", midiHandler._getDamageRollComplete);
        }
    }
    static _getPreItemRollInfo(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE ITEM ROLL: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static _getPreAttackRollInfo(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE ATTACK ROLL: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static async _getAttackRollCompleteInfo(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE ATTACK ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static async _getPreCheckHitsInfo(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE CHECK HITS: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static async _getPreDamageRollInfo(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static async _getPreDamageRollComplete(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static async _getDamageRollComplete(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: DAMAGE ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
    }
    static async _handleASE(workflow) {
        //console.log("ASE: MIDI HANDLER: HANDLE ASE", workflow);
        const itemUUID = workflow.itemUuid;
        let dialogData;
        let currentItemState = game.ASESpellStateManager.getState(itemUUID);
        if (currentItemState) {
            //console.log("ASE: MIDI HANDLER: Item State Found!", currentItemState);
            if(currentItemState.active && !currentItemState.finished){
                return true;
            }
            else{
                //console.log("ASE: MIDI HANDLER: Item State Not Active!", currentItemState);
                return false;
            }
        }
        else {
            //console.log("ASE: MIDI HANDLER: Item State Not Found!");
            ASEHandler.handleASE(workflow);
            return false;
        }
    }

    static async _handleStateTransition(workflow) {
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: WORKFLOW", workflow);
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: WORKFLOW TARGETS", workflow.targets);
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: DAMAGE ROLL", workflow.damageRoll);
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: ATTACK ROLL", workflow.attackRoll);
        const itemUUID = workflow.itemUuid;
        const caster = workflow.token.document.id;
        const hitTargets = Array.from(workflow.hitTargets)
        let stateOptions = {};
        const targets = Array.from(workflow.targets);
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: TARGETS", targets);
        let currentItemState = game.ASESpellStateManager.getState(itemUUID);
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: CURRENT ITEM STATE", currentItemState);
        if (!currentItemState) {return;}
        if(currentItemState.active && !currentItemState.finished){
            if(currentItemState.options.sequenceBuilder){
                game.ASESpellStateManager.continueSequence(itemUUID, {intro: false, caster: caster, targets: targets, hit: hitTargets.length>0, effectOptions: currentItemState.options.effectOptions, type: "missile"});
            }
            if(currentItemState.options.rolls){
                stateOptions.rolls = {attackRoll: workflow.attackRoll, damageRoll: workflow.damageRoll, target: targets[0], hit: hitTargets.length>0};
            }
            console.log("ASE: MIDI HANDLER: STATE TRANSITION: STATE OPTIONS", stateOptions);
            game.ASESpellStateManager.nextState(itemUUID, stateOptions);
            return;
        }
    }
}