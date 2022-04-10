import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class detectStuff {
    constructor(data) {
        this.data = data;
        this.actor = game.actors.get(this.data.actor.id);
        this.token = canvas.tokens.get(this.data.token.id);
        this.item = this.data.item;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
    }
    static registerHooks() {
        Hooks.on("updateToken", detectStuff._updateToken);
    }
}