export class summonCreature {
    static registerHooks() {
        return;
    }
    static async doSummon(midiData) {
        async function myEffectFunction(template, effectInfo) {
            //console.log("Color: ", color);

            let portalAnim = `jb2a.portals.vertical.vortex.${effectInfo.portalColor}`;
            let magicSignIntro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.intro.${effectInfo.magicSchoolColor}`;
            let magicSignLoop = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.loop.${effectInfo.magicSchoolColor}`;
            let effectAAnim = `jb2a.eldritch_blast.${effectInfo.effectAColor}.05ft`;
            let portalCloseAnim = `jb2a.impact.010.${effectInfo.portalImpactColor}`;
            let baseScale = 0.75;
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(magicSignIntro)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .waitUntilFinished(-2000)
                .effect()
                .file(magicSignLoop)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .persist()
                .fadeOut(750, { ease: "easeInQuint" })
                .name("magicSignLoop")
                .effect()
                .file(effectAAnim)
                .offset({ x: 0, y: canvas.grid.size })
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
                .belowTokens()
                .atLocation(template)
                .file(portalAnim)
                .fadeIn(500)
                .offset({ x: 0, y: canvas.grid.size })
                .scale(0)
                .animateProperty("sprite", "scale.x", { from: 0, to: baseScale, delay: 200, duration: 500, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.y", { from: 0, to: baseScale, duration: 700, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.x", { from: baseScale, to: 0, delay: 2500, duration: 500, ease: "easeInElastic" })
                .animateProperty("sprite", "scale.y", { from: baseScale, to: 0, delay: 2300, duration: 700, ease: "easeInElastic" })
                .wait(3150)
                .effect()
                .file(portalCloseAnim)
                .atLocation(template)
                .offset({ x: 0, y: canvas.grid.size })
                .play()
        }

        async function postEffects(template, token, effectInfo) {
            let magicSignOutro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.outro.${effectInfo.magicSchoolColor}`;
            new Sequence("Advanced Spell Effects")
                .effect()
                .file(magicSignOutro)
                .offset({ x: 0, y: canvas.grid.size })
                .atLocation(template)
                .belowTokens()
                .scale(0.25)
                .thenDo(async () => {
                    Sequencer.EffectManager.endEffects({ name: "magicSignLoop" });
                })
                .wait(1500)
                .effect()
                .atLocation(token)
                .scaleToObject()
                .file(token.data.img)
                .fadeIn(400)
                .offset({ x: 0, y: canvas.grid.size })
                .animateProperty("sprite", "position.y", { from: 0, to: canvas.grid.size, duration: 400, ease: "easeInOutCubic" })
                .duration(500)
                .fadeOut(50)
                .wait(400)
                .animation()
                .on(token)
                .fadeIn(100, { ease: "easeInQuint" })
                .play()
        }
        //console.log("MIDI Data: ", midiData);
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        let item = midiData.item;
        let summonInfo = item.getFlag("advancedspelleffects", "effectOptions.summons");
        let effectInfo = item.getFlag("advancedspelleffects", "effectOptions");
        //console.log("Summon Info: ", summonInfo);
        let summonOptionsData = {
            buttons: [{ label: summonInfo.typeA.name, value: game.actors.get(summonInfo.typeA.actor).name },
            { label: summonInfo.typeB.name, value: game.actors.get(summonInfo.typeB.actor).name },
            { label: summonInfo.typeC.name, value: game.actors.get(summonInfo.typeC.actor).name }]
        };
        const warpgateOptions = { controllingActor: game.actors.get(midiData.actor.id) };
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
                'flags': { "advancedspelleffects": { "summoner": casterActor.id } }
            }
        }
        await warpgate.spawn(chosenSummon, updates, summonEffectCallbacks, warpgateOptions);
    }
}