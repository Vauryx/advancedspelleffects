// create class to track state uuid to item state in a globally accessible variable
export class SpellStateMachine {
    constructor() {
        this.spells = [];
    }
    //get current state of spell
    getState(uuid) {
        //return state of spell with uuid
        return this.spells.find(spell => spell.uuid === uuid) ?? false;
    }
    
    // add spell to state machine
    addSpell(uuid, options) {
        this.spells.push({ uuid: uuid, state: 0 , active: true, options: options});
    }
    // remove spell from state machine
    removeSpell(uuid) {
        this.spells = this.spells.filter(spell => spell.uuid !== uuid);
    }

    //move to next state
    async nextState(uuid) {
        let spell = this.spells.find(spell => spell.uuid === uuid);
        if (spell) {
            console.log("ASE: Spell State Machine: Current State: ", spell.state, spell);
            //find how many times to iterate
            let iterateListKey = spell.options.iterate;
            console.log("ASE: Spell State Machine: Iterate List Length: ", spell.options[iterateListKey].length);
            if(spell.state < spell.options[iterateListKey].length){
                const item = await fromUuid(spell.uuid);
                console.log("ASE: Spell State Machine: Next State: item: ", item);
                game.user.updateTokenTargets([]);
                MidiQOL.completeItemRoll(item, {targetUuids: [spell.options[iterateListKey][spell.state]]});
                spell.state++;
            } else {
                spell.active = false;
                this.removeSpell(uuid);
            }
        }
    }
        
}