export class summonCreature{
    static registerHooks(){
        return;
    }
    static async doSummon(midiData){
        async function myEffectFunction(template, effectInfo) {
            //console.log("Color: ", color);

            let portalAnimIntro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.intro.${effectInfo.magicSchoolColor}`;
            let portalAnimLoop = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.loop.${effectInfo.magicSchoolColor}`;
            let effectAAnim = `jb2a.eldritch_blast.${effectInfo.effectAColor}.05ft`;
            let effectBAnim = `jb2a.energy_strands.complete.${effectInfo.effectBColor}.01`;

            new Sequence("Advanced Spell Effects")
                .effect()
                .file(portalAnimIntro)
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .waitUntilFinished(-2000)
                .effect()
                .file(portalAnimLoop)
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .persist()
                .fadeOut(750, { ease: "easeInQuint" })
                .name("portalAnimLoop")
                .effect()
                .file(effectAAnim)
                .atLocation(template)
                .JB2A()
                .waitUntilFinished(-1000)
                .endTime(3300)
                .playbackRate(0.7)
                .scaleOut(0, 500)
                .scale(1.5)
                .zIndex(1)
                .center()
                .belowTokens()
                .effect()
                .file(effectBAnim)
                .atLocation(template)
                .zIndex(1)
                .scale(0.4)
                .fadeOut(500)
                .scaleIn(0, 1000, { ease: "easeInOutBack" })
                .waitUntilFinished(-2250)
                .play()
        }

        async function postEffects(template, token, effectInfo) {
            let portalAnimOutro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.outro.${effectInfo.magicSchoolColor}`;
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(portalAnimOutro)
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .thenDo(async () => {
                    Sequencer.EffectManager.endEffects({ name: "portalAnimLoop" });
                })
                .wait(500)
                .animation()
                .on(token)
                .fadeIn(1000, {ease: "easeInQuint"})
                .play()
        }
        //console.log("MIDI Data: ", midiData);
        const actorD = midiData.actor;
        const tokenD = canvas.tokens.get(midiData.tokenId);
        let item = midiData.item;
        let summonInfo = item.getFlag("advancedspelleffects", "effectOptions.summons");
        let effectInfo = item.getFlag("advancedspelleffects", "effectOptions");
        //console.log("Summon Info: ", summonInfo);
        let summonOptionsData = {
            buttons: [{ label: summonInfo.typeA.name, value: game.actors.get(summonInfo.typeA.actor).name },
            { label: summonInfo.typeB.name, value: game.actors.get(summonInfo.typeB.actor).name },
            { label: summonInfo.typeC.name, value: game.actors.get(summonInfo.typeC.actor).name }]
        };
        const warpgateOptions = { controllingActor: game.actors.get(midiData.actor._id) };
        let chosenSummon = await warpgate.buttonDialog(summonOptionsData, 'row');
        let summonEffectCallbacks = {
            pre: async (template, update) => {
                myEffectFunction(template, effectInfo);
                await warpgate.wait(1750);
            },
            post: async (template, token) => {
                postEffects(template, token, effectInfo);
                await warpgate.wait(500);
            }
        };
        let updates = {
            token: {
                'alpha': 0,
            }
        }
        await warpgate.spawn(chosenSummon, updates, summonEffectCallbacks, warpgateOptions);
    }
}