import { ASEHandler } from "./ASEHandler.js"
export class midiHandler {
    static registerHooks() {
        if (game.modules.get("midi-qol")?.active) {
            Hooks.on("midi-qol.preambleComplete", midiHandler._handleASEPreamble);
            Hooks.on("midi-qol.RollComplete", midiHandler._handleStateTransition);
            //Hooks.on("midi-qol.preItemRoll", midiHandler._getPreItemRollInfo);
            //Hooks.on("midi-qol.preAttackRoll", midiHandler._getPreAttackRollInfo);
            //Hooks.on("midi-qol.AttackRollComplete", midiHandler._getAttackRollCompleteInfo);
            //Hooks.on("midi-qol.preCheckHits", midiHandler._getPreCheckHitsInfo);
            //Hooks.on("midi-qol.preDamageRoll", midiHandler._getPreDamageRollInfo);
            Hooks.on("midi-qol.preDamageRollComplete", midiHandler._damageRollComplete);
            //Hooks.on("midi-qol.damageRollComplete", midiHandler._damageRollComplete);
            Hooks.on("midi-qol.preCheckSaves", midiHandler._preCheckSaves);
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
    static async _damageRollComplete(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL COMPLETE: WORKFLOW -------- ", workflow);
        console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
        const itemUUID = workflow.itemUuid;
        const item = await fromUuid(itemUUID);
        const spellEffect = item.getFlag("advancedspelleffects", "spellEffect");
        const aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
        const castItem = item.getFlag("advancedspelleffects", "castItem") ?? false;
        const castStage = item.getFlag("advancedspelleffects", "castStage") ?? '';
        if (spellEffect && aseEnabled) {
            let currentItemState = game.ASESpellStateManager.getSpell(itemUUID);
            if (currentItemState) {
                if(currentItemState.options.damInterrupt) {
                    console.log("ASE: MIDI HANDLER: Interrupting Damage Roll");
                    let newData = await ASEHandler.handleASE(workflow, {damInterrupt: true});
                    console.log("ASE: MIDI HANDLER: Interrupting Damage Roll New Data", newData);
                    if(newData) {
                        if(newData.newDamageType){
                            console.log("ASE: MIDI HANDLER: DAMAGE DETAIL: ", workflow.damageDetail);
                            workflow.damageDetail[0].type = newData.newDamageType.toLowerCase();
                            workflow.defaultDamageType = newData.newDamageType.toLowerCase();
                        } 
                        if(newData.newTargets){
                            currentItemState.options.nextTargets = newData.newTargets;
                        }
                    }
                    return true;
                }
            } else if (castItem && castStage === "preDamage") {
                ASEHandler.handleASE(workflow);
            }
        }
    }
    static async _preCheckSaves(workflow) {
        console.log(" --------  ASE: MIDI HANDLER: PRE CHECK SAVES: WORKFLOW -------- ", workflow);
        const itemUUID = workflow.itemUuid;
        const item = await fromUuid(itemUUID);
        const spellEffect = item.getFlag("advancedspelleffects", "spellEffect");
        const aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
        const castItem = item.getFlag("advancedspelleffects", "castItem") ?? false;
        const savesRequired = item.getFlag("advancedspelleffects", "savesRequired") ?? false;
        const targets = Array.from(workflow.targets) ?? [];
        if(spellEffect && aseEnabled && castItem && savesRequired) {
            console.log("ASE: MIDI HANDLER: Cast Item Found!", item);
            let newMidiData = await ASEHandler.handleASE(workflow);
            console.log("ASE: MIDI HANDLER: Cast Item Found! New Midi Data", newMidiData);
            //check if targets is an array
            if(!Array.isArray(targets)) return true;
            if(targets.length === 0){
                let newTargets = new Set();
                newMidiData.targets.forEach(target => {
                    newTargets.add(target);
                });
                console.log("ASE: MIDI HANDLER: Cast Item Found! New Targets", newTargets);
                workflow.targets = newTargets;
                workflow.hitTargets = newTargets;
                workflow.failedSaves = newTargets;
                console.log("ASE: MIDI HANDLER: Cast Item Found! New Workflow", workflow);
            }
            return true;
        } else {
            return true;
        }
    }
    static async _handleASEPreamble(workflow) {
        console.log("ASE: MIDI HANDLER: PREAMBLE: ", workflow);
        console.log(" --------  ASE: MIDI HANDLER: PREAMBLE: WORKFLOW TARGETS -------- ", workflow.optionalTestField);
        const itemUUID = workflow.itemUuid;
        const item = await fromUuid(itemUUID);
        const spellEffect = item.getFlag("advancedspelleffects", "spellEffect");
        const aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
        const castItem = item.getFlag("advancedspelleffects", "castItem") ?? false;
        const castStage = item.getFlag("advancedspelleffects", "castStage") ?? '';
        const savesRequired = item.getFlag("advancedspelleffects", "savesRequired") ?? false;
        const allowInitialMidiCall = item.getFlag("advancedspelleffects", "effectOptions.allowInitialMidiCall") ?? true;
        console.log("ASE: MIDI HANDLER: PREAMBLE: Allow Initial Midi Call", allowInitialMidiCall);
        console.log("ASE: MIDI HANDLER: PREAMBLE: Cast Item", castItem);
        console.log("ASE: MIDI HANDLER: PREAMBLE: ASE Enabled", aseEnabled);
        console.log("ASE: MIDI HANDLER: PREAMBLE: Spell Effect", spellEffect);
        if (spellEffect && aseEnabled && !(castItem && savesRequired)) {
            let currentItemState = game.ASESpellStateManager.getSpell(itemUUID);
            if (currentItemState) {
                console.log("ASE: MIDI HANDLER: Item State Found!", currentItemState.state);
                console.log("ASE: MIDI HANDLER: STATE ACTIVE?", currentItemState.active);
                console.log("ASE: MIDI HANDLER: STATE FINISHED?", currentItemState.finished);
                if(!castItem){
                    console.log("ASE: MIDI HANDLER: PREAMBLE: NOT CAST ITEM!");
                    if(currentItemState.active && !currentItemState.finished){
                        return true;
                    }
                    else{
                        //console.log("ASE: MIDI HANDLER: Item State Not Active!", currentItemState);
                        return false;
                    }
                } else {
                    console.log("ASE: MIDI HANDLER: PREAMBLE: CAST ITEM!");
                    if(currentItemState.active && !currentItemState.finished){
                        console.log("ASE: MIDI HANDLER: PREAMBLE: CAST ITEM! STATE ACTIVE!");
                        return true;
                    }
                    else{
                        console.log("ASE: MIDI HANDLER: PREAMBLE: CAST ITEM! STATE NOT ACTIVE!");
                        //console.log("ASE: MIDI HANDLER: Item State Not Active!", currentItemState);
                        ASEHandler.handleASE(workflow);
                        if(allowInitialMidiCall) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            } else {
                console.log("ASE: MIDI HANDLER: Item State Not Found!");
                if(castStage !== "preDamage"){
                    ASEHandler.handleASE(workflow);
                }
                if(allowInitialMidiCall) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return true;
        }
    }
        

    static async _handleStateTransition(workflow) {
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: WORKFLOW", workflow);
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: WORKFLOW TARGETS", workflow.targets);
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: DAMAGE ROLL", workflow.damageRoll);
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: ATTACK ROLL", workflow.attackRoll);
        const itemUUID = workflow.itemUuid;
        const caster = workflow.token.document.id;
        const hitTargets = Array.from(workflow.hitTargets)
        let stateOptions = {};
        const targets = Array.from(workflow.targets);
        let targetUuid = "";
        let target;
        let iterateListKey = "";
        let currStateIndex = 0;
        //console.log("ASE: MIDI HANDLER: STATE TRANSITION: TARGETS", targets);
        let currentItemState = game.ASESpellStateManager.getSpell(itemUUID);
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: CURRENT ITEM STATE", currentItemState);
        if (!currentItemState) {return;}
        if(currentItemState.active && !currentItemState.finished && currentItemState.options.iterate){
            console.log("ASE: MIDI HANDLER: STATE TRANSITION: ITERATE...");
            if(!targets || targets.length === 0){
                iterateListKey = currentItemState.options.iterate;
                currStateIndex = currentItemState.state - 1;
                targetUuid = currentItemState.options[iterateListKey][currStateIndex];
                target = await fromUuid(targetUuid);
            } else {
                target = targets[0];
            }
            if(currentItemState.options.sequenceBuilder){
                game.ASESpellStateManager.continueSequence(itemUUID, {intro: false, caster: caster, targets: [target], hit: !workflow.attackRoll ? true : hitTargets.length>0, effectOptions: currentItemState.options.effectOptions, type: "missile"});
            }
            if(currentItemState.options.rolls){
                stateOptions.rolls = {attackRoll: workflow.attackRoll, damageRoll: workflow.damageRoll, target: target, hit: hitTargets.length>0};
            }
            game.ASESpellStateManager.nextState(itemUUID, stateOptions);
            return;
        } else if (currentItemState.active && !currentItemState.finished && currentItemState.options.targetted){
            console.log("ASE: MIDI HANDLER: STATE TRANSITION: TARGETTED...");
            if(!currentItemState.options.repeat){
                stateOptions.finished = true;
            }
            //move uuid of each token from workflow.failedSaves into stateOptions.failedSaves

            if(currentItemState.options.failedSaves){
                stateOptions.failedSaves = [];
                workflow.failedSaves.forEach(target => {
                    stateOptions.failedSaves.push(target.document.uuid);
                });
            }
            game.ASESpellStateManager.nextState(itemUUID, stateOptions);
        } else if (currentItemState.active && !currentItemState.finished && currentItemState.options.repeat && currentItemState.options.nextTargets){
            console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT...");
            game.ASESpellStateManager.nextState(itemUUID, {targets: currentItemState.options.nextTargets});
        } else if (currentItemState.active && !currentItemState.finished && currentItemState.options.castItem){
            console.log("ASE: MIDI HANDLER: STATE TRANSITION: CAST ITEM...");
            currentItemState.finished = true;
            game.ASESpellStateManager.removeSpell(itemUUID);
        }
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: FINISHED");
    }
}
