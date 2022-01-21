import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class animateDeadDialog extends FormApplication {
    constructor(corpses, options = { raiseLimit: 1, effectSettings: { summons: { skeleton: { actor: "" }, zombie: { actor: "" } }, effectAColor: "blue", effectBColor: "blue", magicSchool: "evocation", magicSchoolColor: "blue" } }) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        this.data = {};
        this.data.corpses = corpses;
        this.data.raiseLimit = this.options.raiseLimit;
        this.data.effectSettings = this.options.effectSettings;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/animate-dead-dialog.html',
            id: 'animate-dead-dialog',
            title: game.i18n.localize("ASE.AnimateDead"),
            resizable: true,
            width: "auto",
            height: "auto",
            close: () => { ui.notify }
        });
    }

    async getData() {
        let data = super.getData();
        data = foundry.utils.mergeObject(data, this.data);
        data.noCorpses = data.corpses.length === 0;
        return data;
    }

    async _updateObject(event, formData) {}

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
        const corpseType = event.currentTarget.innerText.toLowerCase();

        const effectAColor = document.getElementById("hdnEffectAColor").value;
        const effectASound = document.getElementById("hdnEffectASound").value;
        const effectASoundDelay = document.getElementById("hdnEffectASoundDelay").value;
        const effectASoundVolume = document.getElementById("hdnEffectASoundVolume").value;

        const effectBColor = document.getElementById("hdnEffectBColor").value;
        const effectBSound = document.getElementById("hdnEffectBSound").value;
        const effectBSoundDelay = document.getElementById("hdnEffectBSoundDelay").value;
        const effectBSoundVolume = document.getElementById("hdnEffectBSoundVolume").value;

        const magicSchool = document.getElementById("hdnMagicSchool").value;
        const magicSchoolColor = document.getElementById("hdnMagicSchoolColor").value;
        const magicSchoolSound = document.getElementById("hdnMagicSchoolSound").value;
        const magicSchoolSoundDelay = document.getElementById("hdnMagicSchoolSoundDelay").value;
        const magicSchoolVolume = document.getElementById("hdnMagicSchoolVolume").value;
        const magicSchoolSoundOutro = document.getElementById("hdnMagicSchoolSoundOutro").value;
        const magicSchoolSoundDelayOutro = document.getElementById("hdnMagicSchoolSoundDelayOutro").value;
        const magicSchoolVolumeOutro = document.getElementById("hdnMagicSchoolVolumeOutro").value;

        const effectSettings = {
            token: corpseToken,
            summonTokenData: {},
            colorA: effectAColor,
            soundA: effectASound,
            soundADelay: effectASoundDelay,
            soundAVolume: effectASoundVolume,
            colorB: effectBColor,
            soundB: effectBSound,
            soundBDelay: effectBSoundDelay,
            soundBVolume: effectBSoundVolume,
            magicSchool: magicSchool,
            magicSchoolColor: magicSchoolColor,
            magicSchoolSound: magicSchoolSound,
            magicSchoolSoundDelay: magicSchoolSoundDelay,
            magicSchoolVolume: magicSchoolVolume,
            magicSchoolSoundOutro: magicSchoolSoundOutro,
            magicSchoolSoundDelayOutro: magicSchoolSoundDelayOutro,
            magicSchoolVolumeOutro: magicSchoolVolumeOutro
        };

        const zombieActorId = document.getElementById("hdnZombieActorId").value;
        const skeletonActorId = document.getElementById("hdnSkeletonActorId").value;
        let zombieTokenData;
        let skeletonTokenData;
        if (zombieActorId && skeletonActorId) {
            zombieTokenData = (await game.actors.get(zombieActorId).getTokenData()).toObject();
            skeletonTokenData = (await game.actors.get(skeletonActorId).getTokenData()).toObject();
            delete zombieTokenData.x;
            delete zombieTokenData.y;
            delete skeletonTokenData.x;
            delete skeletonTokenData.y;
            zombieTokenData = mergeObject(corpseToken.data.toObject(), zombieTokenData, { inplace: false });
            skeletonTokenData = mergeObject(corpseToken.data.toObject(), skeletonTokenData, { inplace: false });
        }
        else {
            ui.notifications.error(game.i18n.localize("ASE.AssociatedActorNotFoundNotification"));
            return;
        }
        switch (corpseType) {
            case "zombie":
                effectSettings.summonTokenData = zombieTokenData;
                break;
            case "skeleton":
                effectSettings.summonTokenData = skeletonTokenData;
                break;
        }
        await playEffect(effectSettings);

        console.log(`Raised ${corpseToken.name} as a ${event.currentTarget.innerText}!`);
        document.getElementById("raiseLimit").value--;
        document.getElementById(corpseToken.id).remove();
        if (document.getElementById("raiseLimit").value == 0) {
            ui.notifications.info(game.i18n.localize("ASE.RaisedAllCorpsesNotification"));
            document.querySelector('button[type="submit"]').click();
        }
        async function playEffect(effectSettings) {

            console.log(effectSettings);
            const colorA = effectSettings.colorA;
            const soundA = effectSettings.soundA ?? "";
            const soundADelay = Number(effectSettings.soundADelay) ?? 0;
            const soundAVolume = effectSettings.soundAVolume == "" ? 1 : Number(effectSettings.soundAVolume);

            const colorB = effectSettings.colorB;
            const soundB = effectSettings.soundB ?? "";
            const soundBDelay = Number(effectSettings.soundBDelay) ?? 0;
            const soundBVolume = effectSettings.soundBVolume == "" ? 1 : Number(effectSettings.soundBVolume);

            const schoolName = effectSettings.magicSchool;
            const schoolColor = effectSettings.magicSchoolColor;
            const schoolSound = effectSettings.magicSchoolSound ?? "";
            const SchoolSoundDelay = Number(effectSettings.magicSchoolSoundDelay) ?? 0;
            const schoolVolume = effectSettings.magicSchoolVolume == "" ? 1 : Number(effectSettings.magicSchoolVolume);

            const schoolSoundOutro = effectSettings.magicSchoolSoundOutro ?? "";
            const schoolSoundDelayOutro = Number(effectSettings.magicSchoolSoundDelayOutro) ?? 0;
            const schoolVolumeOutro = effectSettings.magicSchoolVolumeOutro == "" ? 1 : Number(effectSettings.magicSchoolVolumeOutro);

            const token = effectSettings.token;
            const summonTokenData = effectSettings.summonTokenData;

            // console.log("Corpse to Mutate: ", corpseDoc);
            let animLoc = utilFunctions.getCenter(token);
            let portalAnimIntro = `jb2a.magic_signs.circle.02.${schoolName}.intro.${schoolColor}`;
            let portalAnimLoop = `jb2a.magic_signs.circle.02.${schoolName}.loop.${schoolColor}`;
            let portalAnimOutro = `jb2a.magic_signs.circle.02.${schoolName}.outro.${schoolColor}`;
            let effectAAnim = `jb2a.eldritch_blast.${colorA}.05ft`;
            let effectBAnim = `jb2a.energy_strands.complete.${colorB}.01`;

            new Sequence("Advanced Spell Effects")
                .sound()
                .file(schoolSound)
                .delay(SchoolSoundDelay)
                .volume(schoolVolume)
                .playIf(schoolSound != "")
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
                .sound()
                .file(soundA)
                .delay(soundADelay)
                .volume(soundAVolume)
                .playIf(soundA != "")
                .effect()
                .file(effectAAnim)
                .atLocation(animLoc)
                .waitUntilFinished(-1000)
                .endTime(3300)
                .playbackRate(0.7)
                .scaleOut(0, 500)
                .scale(1.5)
                .zIndex(1)
                .center()
                .sound()
                .file(soundB)
                .delay(soundBDelay)
                .volume(soundBVolume)
                .playIf(soundB != "")
                .effect()
                .file(effectBAnim)
                .atLocation(animLoc)
                .zIndex(1)
                .scale(0.4)
                .fadeOut(500)
                .scaleIn(0, 1000, { ease: "easeInOutBack" })
                .waitUntilFinished(-2250)
                .thenDo(async () => {
                    try {
                        let corpseDoc = token.document;
                        let summonActorData = game.actors.get(summonTokenData.actorId).data.toObject();
                        delete summonActorData.items;
                        delete summonActorData.effects;
                        delete summonActorData._id;
                        const sheet = token.actor.sheet;
                        await token.actor.sheet.close();
                        token.actor._sheet = null;
                        delete token.actor.apps[sheet.appId];
                        let mutateUpdates = { token: summonTokenData, actor: summonActorData };
                        await aseSocket.executeAsGM("checkGMAlwaysAccept");
                        await warpgate.mutate(corpseDoc, mutateUpdates);
                    }
                    catch (err) {
                        console.log(err);
                    };
                })
                .sound()
                .file(schoolSoundOutro)
                .delay(schoolSoundDelayOutro)
                .volume(schoolVolumeOutro)
                .playIf(schoolSoundOutro != "")
                .effect()
                .file(portalAnimOutro)
                .atLocation(animLoc)
                .belowTokens()
                .scale(0.25)
                .thenDo(async () => {
                    await Sequencer.EffectManager.endEffects({ name: "portalAnimLoop" });
                })
                .play()
        }
    }

}
export default animateDeadDialog;