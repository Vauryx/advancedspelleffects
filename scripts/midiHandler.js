import { ASEHandler } from "./ASEHandler.js"
export class midiHandler {
    static registerHooks() {
        if (game.modules.get("midi-qol")?.active) {
            Hooks.on("midi-qol.RollComplete", midiHandler._handleASE);
        }
    }
    static async _handleASE(workflow) {
        console.log("MIDI Workflow: ", workflow);
        ASEHandler.handleASE(workflow)
    }
}