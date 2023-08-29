import * as utilFunctions from "../utilityFunctions.js";
export class mirrorImage {
    constructor(data) {
        this.params = data;
        this.actor = game.actors.get(this.params.actor.id);
        this.token = canvas.tokens.get(this.params.tokenId);
        this.item = this.params.item;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
    }
    static registerHooks() {
        if (utilFunctions.isMidiActive()) {
            Hooks.on("midi-qol.preCheckHits", mirrorImage.handlePreCheckHits);
        }
        Hooks.on("endedSequencerEffect", mirrorImage.handleMirrorImageEnded);
        return;
    }

    async cast() {
        // console.log("Casting ASE Mirror Image...");
        //console.log(this);
        await this.playSequence();
        await this.token.document.setFlag("advancedspelleffects", "mirrorImage", this.effectOptions);
        if (utilFunctions.isMidiActive()) {
        }
    }

    static async handlePreCheckHits(data) {

        //console.log(data);

        let target = Array.from(data.targets)[0];
        if (!target) return;

        const mirrorImages = Sequencer.EffectManager.getEffects().filter(effect => effect.data.name && effect.data.name.startsWith(`MirrorImage-${target.id}`));
        if (mirrorImages.length == 0) return;

        const effectOptions = target.document.getFlag("advancedspelleffects", "mirrorImage");
        if (!effectOptions) return;

        const mirrorImageEffectNames = mirrorImages.map(effect => effect.data.name);

        const attackRoll = data.attackRoll;
        //console.log("Arrack Roll: ", attackRoll.total);
        const targetAC = target.document.actor.system.attributes.ac.value;
        //console.log("Target AC: ", targetAC);

        const imagesRemaining = mirrorImages.length;
        const imageAC = 10 + target.actor.system.abilities.dex.mod;

        const roll = new Roll(`1d20`).evaluate({ async: false });
        //console.log("Mirror Image Roll: ", roll.total);

        let dc;
        if (imagesRemaining == 3) {
            dc = 6;

        }
        else if (imagesRemaining == 2) {
            dc = 8;
        }
        else if (imagesRemaining == 1) {
            dc = 11;
        }
        else {
            console.log("Error: Mirror Images remaining is not 1, 2, or 3.");
            return;
        }
        //console.log("Mirror Image DC: ", dc);

        if (roll.total < dc) {
            console.log("Mirror Image failed.");
            await warpgate.wait(500);
            await mirrorImage.updateChatCardFailed(data.itemCardId, target, roll.total);
            return;
        }
        else {
            console.log("Mirror Image succeeded.");
            data.noAutoDamage = true;
            if (attackRoll.total >= imageAC) {
                // console.log("Mirror Image hit.");
                await warpgate.wait(effectOptions.imageDestroyDelay);
                await Sequencer.EffectManager.endEffects({ name: mirrorImageEffectNames[0] });
                await mirrorImage.updateChatCard(data.itemCardId, target, roll.total, true);
                //console.log("------------Done Mirror Image Pre Check Hits------------");
                return;
            }
            else {
                await warpgate.wait(500);
                await mirrorImage.updateChatCard(data.itemCardId, target, roll.total, false);
                //console.log("------------Done Mirror Image Pre Check Hits------------");
                return;
            }
        }


    }

    static async handleMirrorImageEnded(effect) {
        // console.log(effect);
        if (!effect.data?.name) return;
        if (!effect.data.name.startsWith("MirrorImage")) return;
        //console.log(effect.sprite.getGlobalPosition());
        //console.log(effect.sprite.worldTransform);
        // console.log("Removing Mirror Image...");

        const targetID = effect.data.name.split("-")[1];
        const target = canvas.tokens.get(targetID);
        const effectOptions = target.document.getFlag("advancedspelleffects", "mirrorImage");
        // console.log(effectOptions);
        const imageDestroyEffect = `jb2a.impact.004.${effectOptions.imageDestroyEffectColor}`;
        const imageDestroySound = effectOptions.imageDestroySound ?? "";
        const imageDestroySoundDelay = effectOptions.imageDestroySoundDelay ?? 0;
        const imageDestroyVolume = effectOptions.imageDestroyVolume ?? 1;

        const spritePos = effect.sprite.worldTransform;
        const t = canvas.stage.worldTransform;
        const adjustedPos = {
            x: (spritePos.tx - t.tx) / canvas.stage.scale.x,
            y: (spritePos.ty - t.ty) / canvas.stage.scale.y
        }
        //console.log(adjustedPos)
        new Sequence()
            .effect(imageDestroyEffect)
            .atLocation(adjustedPos)
            .sound()
            .file(imageDestroySound)
            .volume(imageDestroyVolume)
            .delay(imageDestroySoundDelay)
            .playIf(imageDestroySound != "")
            .play()
    }

    static async updateChatCardFailed(itemCardId, target, attackRoll) {
        const chatMessage = await game.messages.get(itemCardId, target);
        // console.log(chatMessage);
        let chatMessageContent = $(await duplicate(chatMessage.data.content));
        // console.log(chatMessageContent);
        //chatMessageContent.find(".midi-qol-hits-display").empty();
        chatMessageContent.find(".midi-qol-hits-display").append(`<div class="midi-qol-flex-container">
                    <div>
                        Mirror Image Roll: <b>${attackRoll}</b>
                    </div>
                </div>`);
        await chatMessage.update({ content: chatMessageContent.prop('outerHTML') });
    }

    static async updateChatCard(itemCardId, target, attackRoll, hit) {

        const chatMessage = await game.messages.get(itemCardId, target);
        // console.log(chatMessage);
        let chatMessageContent = $(await duplicate(chatMessage.data.content));
        // console.log(chatMessageContent);
        chatMessageContent.find(".midi-qol-hits-display").empty();
        chatMessageContent.find(".midi-qol-hits-display").append(`<div class="midi-qol-flex-container">
                    <div>
                        Mirror Image Roll: <b>${attackRoll}</b>  - Attack ${hit ? 'hits' : 'misses'}
                    </div>
                    <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${target.id}"> ${target.name}'s Mirror Image!</div>
                    <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${target.id}"> ${target.name}'s Mirror Image!
                    </div>
                    <div><img src="${target.data.img}" width="30" height="30" style="border:0px">
                    </div>
                </div>`);
        await chatMessage.update({ content: chatMessageContent.prop('outerHTML') });
    }

    async playSequence() {

        const casterToken = this.token;
        const numberOfImages = 3;

        let casterTokenImg = casterToken.document.texture.src;


        const positions = [];

        const angles = [...Array(120).keys()].map(x => x * 3);
        for (let i = 0; i < numberOfImages; i++) {
            var centerOffset = 10 + Math.random() * this.effectOptions.orbitRadius;
            var rotationOffset = angles.length / numberOfImages * i;
            const trig = (formula) => {
                const pos = angles.map(angle => centerOffset * Math[formula](angle * (Math.PI / 180)));
                return [...pos.slice(rotationOffset), ...pos.slice(0, rotationOffset)];
            }
            positions.push({
                x: trig('cos'),
                y: trig('sin'),
            });
        }

        const castEffect = `jb2a.impact.004.${this.effectOptions.castEffectColor}`;
        const runeGlowColor = this.effectOptions.runeColor;
        const orbitDuration = this.effectOptions.orbitDuration;
        const imageOpacity = this.effectOptions.imageOpacity;
        const castEffectSound = this.effectOptions.castSound ?? "";
        const castEffectSoundDelay = this.effectOptions.castSoundDelay ?? 0;
        const castEffectVolume = this.effectOptions.castVolume ?? 1;


        const seq = new Sequence()
            .sound()
            .file(castEffectSound)
            .volume(castEffectVolume)
            .delay(castEffectSoundDelay)
            .playIf(castEffectSound != "")
            .effect()
            .file(castEffect)
            .atLocation(casterToken)
            .fadeIn(500)
            .effect()
            .file("jb2a.extras.tmfx.runes.circle.simple.illusion")
            .atLocation(casterToken)
            .duration(2000)
            .fadeIn(500)
            .fadeOut(500)
            .scale(0.5)
            .filter("Glow", {
                color: runeGlowColor
            })
            .scaleIn(0, 500, {
                ease: "easeOutCubic"
            })
            .waitUntilFinished(-1000);

        positions.forEach((position, index) => {
            seq.effect()
                .from(casterToken)
                .fadeIn(1000)
                .attachTo(casterToken)
                .loopProperty("sprite", "position.x", {
                    values: index % 2 ? position.x : position.x.slice().reverse(),
                    duration: orbitDuration,
                    pingPong: false,
                })
                .loopProperty("sprite", "position.y", {
                    values: index % 3 ? position.y : position.y.slice().reverse(),
                    duration: orbitDuration,
                    pingPong: false,
                })
                .persist()
                .scaleOut(0, 300, { ease: "easeInExpo" })
                .opacity(imageOpacity)
                .name(`MirrorImage-${casterToken.id}-${index}`);
        });

        seq.play()

    }
    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const burstEffectColorOptions = utilFunctions.getDBOptions('jb2a.impact.004');
        const runeColorOptions = {
            "0x3c1361": "Dark Purple",
            "0x00b4ff": "Blue",
            "0x1DD0DE": "Cyan",
            "0x1D8B16": "Green",
            "0xFFCE00": "Yellow",
            "0xFF9B00": "Orange",
            "0xFF0000": "Red",
            "0x7D1DFF": "Purple",
            "0xFF00FF": "Pink",
            "0xFFFFFF": "White",
            "0x000000": "Black"
        };

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageCreateEffectColorLabel"),
            type: 'dropdown',
            options: burstEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.castEffectColor',
            flagName: 'castEffectColor',
            flagValue: currFlags.castEffectColor ?? 'blue',
            tooltip: game.i18n.localize("ASE.MirrorImageCreateEffectColorTooltip"),
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MirrorImageCastSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.castSound',
            flagName: 'castSound',
            flagValue: currFlags.castSound ?? '',
            tooltip: game.i18n.localize("ASE.MirrorImageCastSoundTooltip"),
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MirrorImageCastSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.castSoundDelay',
            flagName: 'castSoundDelay',
            flagValue: currFlags.castSoundDelay ?? 0,
            tooltip: game.i18n.localize("ASE.MirrorImageCastSoundDelayTooltip"),
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MirrorImageCastVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.castVolume',
            flagName: 'castVolume',
            flagValue: currFlags.castVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
            tooltip: game.i18n.localize("ASE.MirrorImageCastVolumeTooltip"),
        });

        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageRuneColorLabel"),
            type: 'dropdown',
            options: runeColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.runeColor',
            flagName: 'runeColor',
            flagValue: currFlags.runeColor ?? '0x00b4ff',
            tooltip: game.i18n.localize("ASE.MirrorImageRuneColorTooltip"),
        });

        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageOrbitRadiusLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.orbitRadius',
            flagName: 'orbitRadius',
            flagValue: currFlags.orbitRadius ?? 40,
            tooltip: game.i18n.localize("ASE.MirrorImageOrbitRadiusTooltip"),
        });

        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageOrbitDurationLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.orbitDuration',
            flagName: 'orbitDuration',
            flagValue: currFlags.orbitDuration ?? 24,
            tooltip: game.i18n.localize("ASE.MirrorImageOrbitDurationTooltip"),
        });

        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageOpacityLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.imageOpacity',
            flagName: 'imageOpacity',
            flagValue: currFlags.imageOpacity ?? 0.5,
            min: 0,
            max: 1,
            step: 0.1,
            tooltip: game.i18n.localize("ASE.MirrorImageOpacityTooltip"),
        });

        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageDestroyDelay"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.imageDestroyDelay',
            flagName: 'imageDestroyDelay',
            flagValue: currFlags.imageDestroyDelay ?? 0,
            tooltip: game.i18n.localize("ASE.MirrorImageDestroyDelayTooltip"),
        });
        animOptions.push({
            label: game.i18n.localize("ASE.MirrorImageDestroyEffectColorLabel"),
            type: 'dropdown',
            options: burstEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.imageDestroyEffectColor',
            flagName: 'imageDestroyEffectColor',
            flagValue: currFlags.imageDestroyEffectColor ?? 'blue',
            tooltip: game.i18n.localize("ASE.MirrorImageDestroyEffectColorTooltip"),
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MirrorImageDestroySoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.imageDestroySound',
            flagName: 'imageDestroySound',
            flagValue: currFlags.imageDestroySound ?? '',
            tooltip: game.i18n.localize("ASE.MirrorImageDestroySoundTooltip"),
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MirrorImageDestroySoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.imageDestroySoundDelay',
            flagName: 'imageDestroySoundDelay',
            flagValue: currFlags.imageDestroySoundDelay ?? 0,
            tooltip: game.i18n.localize("ASE.MirrorImageDestroySoundDelayTooltip"),
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.MirrorImageDestroyVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.imageDestroyVolume',
            flagName: 'imageDestroyVolume',
            flagValue: currFlags.imageDestroyVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
            tooltip: game.i18n.localize("ASE.MirrorImageDestroyVolumeTooltip"),
        });



        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}