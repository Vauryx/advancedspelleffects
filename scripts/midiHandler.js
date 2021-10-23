import { ASEHandler } from "./ASEHandler.js"
export class midiHandler {
    static registerHooks() {
        if (game.modules.get("midi-qol")?.active) {
            Hooks.on("midi-qol.RollComplete", (workflow) => {
                console.log("MIDI Workflow: ", workflow);
                ASEHandler.handleASE(workflow)
            });
        }
    }
}