// create class to track state uuid to item state in a globally accessible variable
import * as utilFunctions from "./utilityFunctions.js";
import { aseSocket } from "./aseSockets.js";
export class SpellStateMachine {
    constructor() {
        this.spells = [];
    }
    //get current state of spell
    getSpell(uuid) {
        //return state of spell with uuid
        return this.spells.find(spell => spell.uuid === uuid) ?? false;
    }
    
    // add spell to state machine
    addSpell(uuid, options) {
        this.spells.push({ uuid: uuid, state: 0 , active: true, finished: false, options: options});
        this.nextState(uuid);
    }
    // remove spell from state machine
    removeSpell(uuid) {
        this.spells = this.spells.filter(spell => spell.uuid !== uuid);
    }

    continueSequence(uuid, options){
        let spell = this.spells.find(spell => spell.uuid === uuid);
        if (spell.options.sequenceBuilder) {
            if(!spell.options.sequences){
                spell.options.sequences = [];
            }
            spell.options.sequences.push(spell.options.sequenceBuilder(options));
        }
    }

    //add chat info
    buildChatCard(uuid){
        let spell = this.spells.find(spell => spell.uuid === uuid);
        let chatContent = spell.options.chatBuilder({rolls: spell.options.rolls, casterId: spell.options.casterId, attacks: spell.options.attacks});
        return chatContent;
    }

    //move to next state
    async nextState(uuid, spellOptions = {}) {
        let spell = this.spells.find(spell => spell.uuid === uuid);
        let getGM = game.users.find(i => i.isGM);
        if (spell) {
            //find how many times to iterate
            const item = await fromUuid(spell.uuid);
            if(spell.options.iterate){
                let iterateListKey = spell.options.iterate;
                if(iterateListKey && spell.state < spell.options[iterateListKey].length){
                    if(spellOptions.rolls){
                        if(spell.options.rolls){
                            spell.options.rolls.push(spellOptions.rolls);
                        }
                    }
                    game.user.updateTokenTargets([]);
                    let options = {
                        "targetUuids": [spell.options[iterateListKey][spell.state]],
                        "configureDialog": false,
                        "workflowOptions":  {
                                                "autoRollAttack": true,
                                                "autoFastAttack": true,
                                                "autoRollDamage": "always",
                                                "autoFastDamage": true,
                                            }
                    };
                    //console.log("ASE: SPELLSTATEMACHINE: midi options", options.targetUuids);
                    if(spell.options.attacks){
                        const attackType = spell.options.attacks[spell.state]?.type;
                        //console.log("ASE: SPELLSTATEMACHINE: attack type: ", attackType);
                        if(attackType && attackType != ""){
                            options.workflowOptions[attackType] = attackType;
                        }
                    }
                    //console.log("ASE: MIDI HANDLER: STATE TRANSITION: MIDI SETTINGS", options);
                    spell.state++;
                    await MidiQOL.completeItemRoll(item, options);
                } else if(iterateListKey && spell.state >= spell.options[iterateListKey].length) {
                    spell.active = false;
                    spell.finished = true;
                    if(spell.options.sequences.length && spell.options.sequences.length > 0){
                        for await (const sequence of spell.options.sequences) {
                            sequence.play();
                            await warpgate.wait(utilFunctions.getRandomInt(50, 150));
                        }
                    }
                    if(spellOptions.rolls){
                        if(spell.options.rolls){
                            spell.options.rolls.push(spellOptions.rolls);
                        }
                    }
                    if(spell.options.chatBuilder){
                        let chatContent = await this.buildChatCard(uuid);
                        //console.log("ASE: MIDI HANDLER: CHAT CONTENT", chatContent);
                        await aseSocket.executeAsGM("createGMChat", {content: chatContent});
                    }
                    this.removeSpell(uuid);
                }
            } else if (spell.options.concentration){
                game.user.updateTokenTargets([]);
                if(spell.options.castItem){
                    let castItem = await fromUuid(spell.options.castItem);
                    let options = {
                        "targetUuids": spell.options.targets,
                        "configureDialog": false
                    };
                    spell.state++;
                    await MidiQOL.completeItemRoll(castItem, options);
                }
            } else if (spell.options.targetted){
                if(!spellOptions.finished){
                    game.user.updateTokenTargets([]);
                    let options = {
                        "targetUuids": spell.options.targets,
                        "configureDialog": false
                    };
                    spell.state++;
                    await MidiQOL.completeItemRoll(item, options);
                } else if (spellOptions.finished){
                    spell.active = false;
                    spell.finished = true;
                    if(spellOptions.failedSaves){
                        spell.options.failedSaves = spellOptions.failedSaves;
                    }
                    this.continueSequence(uuid, spell.options);
                    console.log("ASE: MIDI HANDLER: STATE TRANSITION: TARGETTED SPELL FINISHED", spell);
                    if(spell.options.sequences.length && spell.options.sequences.length > 0){
                        for await (const sequence of spell.options.sequences) {
                            sequence.play();
                        }
                    }
                    this.removeSpell(uuid);
                    console.log("ASE: MIDI HANDLER: STATE TRANSITION: FINISHED: ", spell);
                }
            } else if (spell.options.repeat){
                console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT", spell);
                console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT: STATE", spell.state);
                if(!spellOptions.finished){
                    game.user.updateTokenTargets([]);
                    let options = {
                        "configureDialog": false,
                        "workflowOptions":  {
                            "autoRollDamage": "always"
                        }

                    };
                    if(spellOptions.targets){
                        options.targetUuids = spellOptions.targets;
                    } else {
                        options.targetUuids = spell.options.targets;
                    }
                    console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT: OPTIONS", options);
                    spell.state++;
                    await MidiQOL.completeItemRoll(item, options);
                }
            }
        }
    }
        
}