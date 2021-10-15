import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class animateDeadDialog extends FormApplication {
    constructor(corpses, options = { raiseLimit: 1, effectSettings: { summons: { skeleton: { actor: "" }, zombie: { actor: "" } }, effectAColor: "blue", effectBColor: "blue", magicSchool: "evocation", magicSchoolColor: "blue" } }) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        //console.log(this);
        this.data = {};
        this.data.corpses = corpses;
        this.data.raiseLimit = this.options.raiseLimit;
        this.data.effectSettings = this.options.effectSettings;
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/animate-dead-dialog.html',
            id: 'animate-dead-dialog',
            title: "Animate Dead",
            resizable: true,
            width: "auto",
            height: "auto",
            close: () => { ui.notify }
        });
    }
    async getData() {
        return {
            data: this.data
        };

    }
    async _updateObject(event, formData) {
        console.log(formData);

    }
    activateListeners(html) {
        //console.log(html);
        super.activateListeners(html);
        html.find('.corpseToken').on("mouseenter", function (e) {
            let token = canvas.tokens.get($(this).attr('id'));
            token._onHoverIn(e);
        });
        html.find('.corpseToken').on("mouseleave", function (e) {
            let token = canvas.tokens.get($(this).attr('id'));
            token._onHoverOut(e);
        });
        html.find('.raiseCorpse').on("click", this._raiseCorpse);
    }

    async _raiseCorpse(event) {
        let corpseToken = canvas.tokens.get($(this).attr('id'));
        let corpseType = event.currentTarget.innerText.toLowerCase();
        let effectAColor = document.getElementById("hdnEffectAColor").value;
        let effectBColor = document.getElementById("hdnEffectBColor").value;
        let magicSchool = document.getElementById("hdnMagicSchool").value;
        let magicSchoolColor = document.getElementById("hdnMagicSchoolColor").value;
        let zombieActorId = document.getElementById("hdnZombieActorId").value;
        let skeletonActorId = document.getElementById("hdnSkeletonActorId").value;
        let zombieTokenData;
        let skeletonTokenData;
        if (zombieActorId && skeletonActorId) {
            zombieTokenData = await game.actors.get(zombieActorId).getTokenData();
            skeletonTokenData = await game.actors.get(skeletonActorId).getTokenData();
        }
        else {
            ui.notifications.error("Associated actor for summon not found!");
            return;
        }
        switch (corpseType) {
            case "zombie":
                await playEffect(corpseToken, zombieTokenData, effectAColor, effectBColor, magicSchool, magicSchoolColor);
                break;
            case "skeleton":
                await playEffect(corpseToken, skeletonTokenData, effectAColor, effectBColor, magicSchool, magicSchoolColor);
                break;
        }

        console.log(`Raised ${corpseToken.name} as a ${event.currentTarget.innerText}!`);
        document.getElementById("raiseLimit").value--;
        document.getElementById(corpseToken.id).remove();
        if (document.getElementById("raiseLimit").value == 0) {
            ui.notifications.info("Raised all corpses!");
            document.querySelector('button[type="submit"]').click();
        }
        async function playEffect(token, summonTokenData, colorA, colorB, schoolName, schoolColor) {
            let animLoc = utilFunctions.getCenter(token);
            let corpseId = token.id;
            let portalAnimIntro = `jb2a.magic_signs.circle.02.${schoolName}.intro.${schoolColor}`;
            let portalAnimLoop = `jb2a.magic_signs.circle.02.${schoolName}.loop.${schoolColor}`;
            let portalAnimOutro = `jb2a.magic_signs.circle.02.${schoolName}.outro.${schoolColor}`;
            let effectAAnim = `jb2a.eldritch_blast.${colorA}.05ft`;
            let effectBAnim = `jb2a.energy_strands.complete.${colorB}.01`;
            let warpGateUpdates = {
                token: {
                    'alpha': 0,
                }
            };
            let summonCallbacks = {
                post: async (location, spawnedToken) => {
                    await new Sequence("Advanced Spell Effects")
                        .animation()
                        .on(spawnedToken)
                        .fadeIn(1000, { ease: "easeInQuint" })
                        .effect()
                        .file(portalAnimOutro)
                        .name(`animateDeadAnimOutro-${corpseId}`)
                        .atLocation(location)
                        .belowTokens()
                        .scale(0.25)
                        .thenDo(async () => {
                            let aseSeqADHookId = Hooks.on("endedSequencerEffect", async (effectData) => {
                                if(effectData.name == `animateDeadAnimOutro-${corpseId}`){
                                    let corpseToDelete = canvas.tokens.get(corpseId);
                                    await corpseToDelete.delete();
                                    Hooks.off("endedSequencerEffect", aseSeqADHookId);
                                }
                            });
                            Sequencer.EffectManager.endEffects({ name: "portalAnimLoop" });
                        })
                        .animation()
                        .on(token)
                        .fadeOut(250, { ease: "easeInQuint" })
                        .waitUntilFinished()
                        .play()
                }
            };
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(portalAnimIntro)
                .atLocation(animLoc)
                .belowTokens()
                .scale(0.25)
                .waitUntilFinished(-2000)
                .effect()
                .file(portalAnimLoop)
                .atLocation(animLoc)
                .belowTokens()
                .scale(0.25)
                .persist()
                .fadeOut(750, { ease: "easeInQuint" })
                .name("portalAnimLoop")
                .effect()
                .file(effectAAnim)
                .atLocation(animLoc)
                .JB2A()
                .waitUntilFinished(-1000)
                .endTime(3300)
                .playbackRate(0.7)
                .scaleOut(0, 500)
                .scale(1.5)
                .zIndex(1)
                .center()
                .effect()
                .file(effectBAnim)
                .atLocation(animLoc)
                .zIndex(1)
                .scale(0.4)
                .fadeOut(500)
                .scaleIn(0, 1000, { ease: "easeInOutBack" })
                .waitUntilFinished(-2250)
                .thenDo(async () => {
                    await warpgate.spawnAt(animLoc, summonTokenData, warpGateUpdates, summonCallbacks);
                })
                .play()
        }
    }

}
export default animateDeadDialog;