import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class viciousMockery {

    constructor(data) {
        this.params = data;
        this.actor = game.actors.get(this.params.actor.id);
        this.token = canvas.tokens.get(this.params.tokenId);
        this.item = this.params.item;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
        this.isMidiActive = utilFunctions.isMidiActive();
        this.target = Array.from(this.params.targets)[0];
        this.cussVault = ['!', '@', '#', '$', '%', '&'];
    }

    static registerHooks() {
        return;
    }

    async cast() {
        // console.log("Casting ASE Mirror Image...");
        //console.log(this);
        await this.playSequence();

    }

    async playSequence() {
        const caster = this.token;
        const target = this.target;
        const textOptions = {
            "dropShadowAngle": 7.6,
            "fontFamily": "Impact",
            "fontSize": 38,
            "fontStyle": "oblique",
            "fontVariant": "small-caps",
            "fontWeight": "bolder",
            "fill": [
                "#f01414",
                "#931a1a"
            ],
        };
        const distance = utilFunctions.getDistanceClassic({ x: caster.x, y: caster.y }, { x: target.x, y: target.y });
        let viciousMockerySeq = new Sequence();

        for (let i = 0; i < utilFunctions.getRandomInt(5, 8); i++) {
            viciousMockerySeq.effect()
                .rotateTowards(target)
                .moveTowards(target, { ease: "easeInOutElastic" })
                .moveSpeed(distance / 2.5)
                .atLocation(caster)
                .text(this.makeCussWord(), textOptions)
                .animateProperty("sprite", "rotation", { from: 0, to: 720, duration: 1200, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.x", { from: 0, to: 1, duration: 1200, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.y", { from: 0, to: 1, duration: 1200, ease: "easeInOutCubic" })
                .randomOffset()
                .animateProperty("sprite", "scale.x", { from: 1, to: 0, delay: 1250, duration: 600, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.y", { from: 1, to: 0, delay: 1250, duration: 600, ease: "easeInOutCubic" })
                .filter("Glow", { color: utilFunctions.rgbToHex(utilFunctions.getRandomInt(0, 155), utilFunctions.getRandomInt(0, 155), utilFunctions.getRandomInt(0, 155)), distance: 35, outerStrength: 2, innerStrength: 0.25 })
                .wait(utilFunctions.getRandomInt(50, 75))
        }

        viciousMockerySeq.play()
    }

    makeCussWord() {
        let cussWord = `${this.cussVault[utilFunctions.getRandomInt(0, this.cussVault.length - 1)]}${this.cussVault[utilFunctions.getRandomInt(0, this.cussVault.length - 1)]}${this.cussVault[utilFunctions.getRandomInt(0, this.cussVault.length - 1)]}${this.cussVault[utilFunctions.getRandomInt(0, this.cussVault.length - 1)]}`;
        //console.log(cussWord);
        return cussWord;
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}
