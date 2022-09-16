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
        await this.playSequence();
    }

    async playSequence() {
        const caster = this.token;
        const target = this.target;
        const useRandomGlow = this.effectOptions.randomGlow;
        const glowColor = useRandomGlow ? utilFunctions.getRandomColor("0x") : utilFunctions.convertColorHexTo0x(this.effectOptions?.glowColor ?? "#f01414");
        const glowDistance = this.effectOptions?.glowDistance ?? 30;
        const glowOuterStrength = this.effectOptions?.glowOuterStrength ?? 2;
        const glowInnerStrength = this.effectOptions?.glowInnerStrength ?? 0.25;
        const fontFamily = this.effectOptions?.font ?? "Impact";
        const fontSize = this.effectOptions?.size ?? 38;
        const fontFillColorA = this.effectOptions?.fillColorA ?? "#f01414";
        const fontFillColorB = this.effectOptions?.fillColorB ?? "#931a1a";
        const soundFile = this.effectOptions?.sound ?? "";
        const soundDelay = this.effectOptions?.soundDelay ?? 0;
        const soundVolume = this.effectOptions?.soundVolume ?? 0.5;
        const textOptions = {
            "dropShadowAngle": 7.6,
            "fontFamily": fontFamily,
            "fontSize": fontSize,
            "fontStyle": "oblique",
            "fontVariant": "small-caps",
            "fontWeight": "bolder",
            "fill": [
                fontFillColorA,
                fontFillColorB
            ],
        };
        const distance = utilFunctions.getDistanceClassic({ x: caster.x, y: caster.y }, { x: target.x, y: target.y });
        let viciousMockerySeq = new Sequence();
        viciousMockerySeq
            .sound()
            .file(soundFile)
            .delay(soundDelay)
            .volume(soundVolume)
            .playIf(soundFile && soundFile !== "");

        for (let i = 0; i < utilFunctions.getRandomInt(5, 8); i++) {
            viciousMockerySeq.effect()
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
                .filter("Glow", { color: glowColor, distance: glowDistance, outerStrength: glowOuterStrength, innerStrength: glowInnerStrength })
                .wait(utilFunctions.getRandomInt(50, 75))
        }
        viciousMockerySeq.play();
    }

    makeCussWord() {
        let cussWordList = [];
        for (let i = 0; i < utilFunctions.getRandomInt(4, 10); i++) {
            cussWordList.push(this.cussVault[utilFunctions.getRandomInt(0, this.cussVault.length - 1)]);
        }
        let cussWord = cussWordList.join("");
        return cussWord;
    }

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        const effectFontOptions = [
            {"serif": "Serif"},
            {"Georgia serif": "Georgia"},
            {"Palatino": "Palatino"},
            {"Times New Roman": "Times New Roman"},
            {"Times": "Times"},
            {"sans-serif": "Sans-Serif"},
            {"Arial": "Arial"},
            {"Helvetica": "Helvetica"},
            {"Arial Black": "Arial Black"},
            {"Gadget": "Gadget"},
            {"Comic Sans MS": "Comic Sans MS"},
            {"cursive": "Cursive"},
            {"Impact": "Impact"},
            {"Charcoal": "Charcoal"},
            {"Lucida Sans Unicode": "Lucida Sans Unicode"},
            {"Lucida Grande": "Lucida Grande"},
            {"Tahoma": "Tahoma"},
            {"Geneva": "Geneva"},
            {"Trebuchet MS": "Trebuchet MS"},
            {"Verdana": "Verdana"},
            {"Courier New, monospace": "Courier New"},
            {"Courier": "Courier"},
            {"Monaco": "Monaco"},
            {"MS PGothic": "MS PGothic"},
            {"Indie Flower": "Indie Flower"},
        ];

        /* animOptions.push({
             label: game.i18n.localize("ASE.EffectSpeedLabel"),
             tooltip: game.i18n.localize("ASE.EffectSpeedTooltip"),
             type: 'rangeInput',
             name: 'flags.advancedspelleffects.effectOptions.speedModifier',
             flagName: 'speedModifier',
             flagValue: currFlags.speedModifier ?? 1,
             min: 0.1,
             max: 2,
             step: 0.1,
         });*/
         const spellDetails = {
            actionType: "save",
            target : {
                type: "creature",
                units: "",
                value: 1,
                width: null,
            }
        };
        animOptions.push({
            label: game.i18n.localize("ASE.EffectFontLabel"),
            tooltip: game.i18n.localize("ASE.EffectFontTooltip"),
            type: 'dropdown',
            options: effectFontOptions,
            name: 'flags.advancedspelleffects.effectOptions.font',
            flagName: 'font',
            flagValue: currFlags.font ?? 'Impact',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.FontSizeLabel"),
            tooltip: game.i18n.localize("ASE.FontSizeTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.size',
            flagName: 'size',
            flagValue: currFlags.size ?? 38,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectFillColorALabel"),
            tooltip: game.i18n.localize("ASE.EffectFillColorATooltip"),
            type: 'colorPicker',
            name: 'flags.advancedspelleffects.effectOptions.fillColorA',
            flagName: 'fillColorA',
            flagValue: currFlags.fillColorA ?? '#f01414',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectFillColorBLabel"),
            tooltip: game.i18n.localize("ASE.EffectFillColorBTooltip"),
            type: 'colorPicker',
            name: 'flags.advancedspelleffects.effectOptions.fillColorB',
            flagName: 'fillColorB',
            flagValue: currFlags.fillColorB ?? '#931a1a',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.RandomGlowLabel"),
            tooltip: game.i18n.localize("ASE.RandomGlowTooltip"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.randomGlow',
            flagName: 'randomGlow',
            flagValue: currFlags.randomGlow ?? true,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectGlowColorLabel"),
            tooltip: game.i18n.localize("ASE.EffectGlowColorTooltip"),
            type: 'colorPicker',
            name: 'flags.advancedspelleffects.effectOptions.glowColor',
            flagName: 'glowColor',
            flagValue: currFlags.glowColor ?? '#f01414',
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectGlowDistanceLabel"),
            tooltip: game.i18n.localize("ASE.EffectGlowDistanceTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.glowDistance',
            flagName: 'glowDistance',
            flagValue: currFlags.glowDistance ?? 30,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectGlowOuterStrengthLabel"),
            tooltip: game.i18n.localize("ASE.EffectGlowOuterStrengthTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.glowOuterStrength',
            flagName: 'glowOuterStrength',
            flagValue: currFlags.glowOuterStrength ?? 2,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.EffectGlowInnerStrengthLabel"),
            tooltip: game.i18n.localize("ASE.EffectGlowInnerStrengthTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.glowInnerStrength',
            flagName: 'glowInnerStrength',
            flagValue: currFlags.glowInnerStrength ?? 0.25,
        });

        soundOptions.push({
            label: game.i18n.localize("ASE.ViscousMockerySoundLabel"),
            tooltip: game.i18n.localize("ASE.ViscousMockerySoundTooltip"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.sound',
            flagName: 'sound',
            flagValue: currFlags.sound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ViscousMockerySoundDelayLabel"),
            tooltip: game.i18n.localize("ASE.ViscousMockerySoundDelayTooltip"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.soundDelay',
            flagName: 'soundDelay',
            flagValue: currFlags.soundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ViscousMockerySoundVolumeLabel"),
            tooltip: game.i18n.localize("ASE.ViscousMockerySoundVolumeTooltip"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.soundVolume',
            flagName: 'soundVolume',
            flagValue: currFlags.soundVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            requireDetails: spellDetails
        }

    }
}
