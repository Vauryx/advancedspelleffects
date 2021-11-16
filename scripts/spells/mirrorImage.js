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
            Hooks.on("midi-qol.preDamageRollComplete", mirrorImage.handlePreDamageRoll);
        }
        Hooks.on("endedSequencerEffect", mirrorImage.handleMirrorImageEnded);
        return;
    }

    async cast() {
        console.log("Casting ASE Mirror Image...");
        //console.log(this);
        await this.playSequence();
        if (utilFunctions.isMidiActive()) {
        }
    }

    static async handleMirrorImageEnded(effect) {
        console.log(effect);
        if (!effect.data?.name) return;
        if (!effect.data.name.startsWith("MirrorImage")) return;
        //console.log(effect.sprite.getGlobalPosition());
        //console.log(effect.sprite.worldTransform);
        console.log("Removing Mirror Image...");
        const spritePos = effect.sprite.worldTransform;
        const t = canvas.stage.worldTransform;
        const adjustedPos = {
            x: (spritePos.tx - t.tx) / canvas.stage.scale.x,
            y: (spritePos.ty - t.ty) / canvas.stage.scale.y
        }
        //console.log(adjustedPos)
        new Sequence()
            .effect("jb2a.impact.004.dark_purple")
            .atLocation(adjustedPos)
            .JB2A()
            .play()
    }


    static async handlePreDamageRoll(data) {
        console.log("Handling ASE Mirror Image...");
        //console.log(item);
        console.log(data);

        let target = Array.from(data.targets)[0];

        const mirrorImages = await Sequencer.EffectManager.getEffects().filter(effect => effect.data.name.startsWith(`MirrorImage-${target.id}`));
        console.log("Mirror Images: ", mirrorImages);

        if (mirrorImages.length == 0) return;

        const attackRoll = data.attackRoll;
        console.log("Arrack Roll: ", attackRoll);

        const imagesRemaining = mirrorImages.length;
        const imageAC = 10 + target.actor.data.data.abilities.dex.mod;

        const roll = await new Roll(`1d20`).evaluate({ async: true });

        console.log("Roll: ", roll);
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
        console.log("DC: ", dc);

        if (roll.total < dc) {
            console.log("Mirror Image failed.");
            await mirrorImage.updateChatCardMissed(data.itemCardId, target, roll.total);
            return;
        }
        else {
            console.log("Mirror Image succeeded.");
            const zeroDamageRoll = await new Roll(`0`).evaluate({ async: true });
            data.damageTotal = zeroDamageRoll.total;
            data.damageDetail[0].damage = zeroDamageRoll.total;
            data.damageRoll = zeroDamageRoll;
            if (attackRoll.total >= imageAC) {
                console.log("Mirror Image hit.");
                await Sequencer.EffectManager.endEffects({ name: `MirrorImage-${target.id}-${mirrorImages.length - 1}` });
                await mirrorImage.updateChatCard(data.itemCardId, target, roll.total, true);
                return;
            }
            else {
                await mirrorImage.updateChatCard(data.itemCardId, target, roll.total, false);
            }
        }

    }

    static async updateChatCardMissed(itemCardId, target, attackRoll) {
        const chatMessage = await game.messages.get(itemCardId, target);
        console.log(chatMessage);
        let chatMessageContent = $(await duplicate(chatMessage.data.content));
        console.log(chatMessageContent);
        //chatMessageContent.find(".midi-qol-hits-display").empty();
        chatMessageContent.find(".midi-qol-hits-display").append(`<div class="midi-qol-flex-container">
                    <div>
                        Mirror Image Roll: <b>${attackRoll}</b>  - Attack hits
                    </div>
                    <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${target.id}"> ${target.name}!</div>
                    <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${target.id}"> ${target.name}!
                    </div>
                    <div><img src="${target.data.img}" width="30" height="30" style="border:0px">
                    </div>
                </div>`);
        await chatMessage.update({ content: chatMessageContent.prop('outerHTML') });
    }

    static async updateChatCard(itemCardId, target, attackRoll, hit) {

        const chatMessage = await game.messages.get(itemCardId, target);
        console.log(chatMessage);
        let chatMessageContent = $(await duplicate(chatMessage.data.content));
        console.log(chatMessageContent);
        //chatMessageContent.find(".midi-qol-hits-display").empty();
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

        let casterTokenImg = casterToken.data.img;


        const positions = [];

        const angles = [...Array(120).keys()].map(x => x * 3);
        for (let i = 0; i < numberOfImages; i++) {
            var centerOffset = 10 + Math.random() * 40;
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

        const seq = new Sequence();
        seq.effect()
            .file("jb2a.impact.004.dark_purple")
            .atLocation(casterToken)
            .fadeIn(500);
        seq.effect()
            .file("jb2a.extras.tmfx.runes.circle.simple.illusion")
            .atLocation(casterToken)
            .duration(2000)
            .fadeIn(500)
            .fadeOut(500)
            .scale(0.5)
            .filter("Glow", {
                color: 0x3c1361
            })
            .scaleIn(0, 500, {
                ease: "easeOutCubic"
            })
            .waitUntilFinished(-1000);

        positions.forEach((position, index) => {
            seq.effect()
                .file(casterTokenImg)
                .fadeIn(1000)
                .attachTo(casterToken)
                .loopProperty("sprite", "position.x", {
                    values: index % 2 ? position.x : position.x.slice().reverse(),
                    duration: 24,
                    pingPong: false,
                })
                .loopProperty("sprite", "position.y", {
                    values: index % 3 ? position.y : position.y.slice().reverse(),
                    duration: 24,
                    pingPong: false,
                })
                .loopProperty("sprite", "alpha", { from: 0.7, to: 0.35, duration: (index * 1000) + 2000, pingPong: true })
                .persist()
                .scaleToObject(1)
                .opacity(0.7)
                .name(`MirrorImage-${casterToken.id}-${index}`);
        });

        seq.play()

    }
    static async getRequiredSettings(currFlags) {
        const primaryColorOptions = utilFunctions.getDBOptions('jb2a.chain_lightning.primary');
        const secondaryColorOptions = utilFunctions.getDBOptions('jb2a.chain_lightning.secondary');
        const failSaveEffectColorOptions = utilFunctions.getDBOptions('jb2a.static_electricity.02');

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