export class summonCreature {
    static registerHooks() {
        return;
    }
    static async doSummon(midiData) {
        async function myEffectFunction(template, effectInfo, summonQty) {
            //console.log("Color: ", color);

            let portalAnim = `jb2a.portals.vertical.vortex.${effectInfo.portalColor}`;
            let magicSignIntro = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.intro.${effectInfo.magicSchoolColor}`;
            let magicSignLoop = `jb2a.magic_signs.circle.02.${effectInfo.magicSchool}.loop.${effectInfo.magicSchoolColor}`;
            let effectAAnim = `jb2a.eldritch_blast.${effectInfo.effectAColor}.05ft`;
            let portalCloseAnim = `jb2a.impact.010.${effectInfo.portalImpactColor}`;
            let baseScale = 0.75;
            let adjustedScale = baseScale * summonQty;
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
                .zIndex(2)
                .atLocation(template)
                .file(portalAnim)
                .fadeIn(500)
                .offset({ x: 0, y: canvas.grid.size })
                .scale(0)
                .animateProperty("sprite", "scale.x", { from: 0, to: baseScale, delay: 200, duration: 500, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.y", { from: 0, to: baseScale, duration: 700, ease: "easeInOutCubic" })
                .animateProperty("sprite", "scale.x", { from: baseScale, to: 0, delay: 2500, duration: 500, ease: "easeInElastic" })
                .animateProperty("sprite", "scale.y", { from: baseScale, to: 0, delay: 2300, duration: 700, ease: "easeInElastic" })
                .wait(3000)
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
        //console.log("Effect Info: ", effectInfo);
        let summonOptionsData = { buttons: [] };
        for (let [type, info] of Object.entries(summonInfo)) {
            console.log(`${type},:`, info);
            let buttonData = { label: info.name, value: [game.actors.get(info.actor).name, info.qty] };
            summonOptionsData.buttons.push(buttonData);
        }
        let chosenSummon = await warpgate.buttonDialog(summonOptionsData, 'row');
        let summonEffectCallbacks = {
            pre: async (template, update) => {
                myEffectFunction(template, effectInfo, chosenSummon[1]);
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
            },
            actor: {}
        };
        if (effectInfo.isTashas) {
            console.log(`Scaling ${chosenSummon[0]} with spell level...`);
            let spellLevel = midiData.itemLevel;
            let hpBonus = 0;
            let acBonus = spellLevel;
            let multiAttack = Math.floor(spellLevel / 2);
            let damageBonus = spellLevel;
            //let summonActor = game.actors.getName(chosenSummon[0]);
            let attackBonus = casterActor.data.data.attributes.spelldc - 8;
            let summonActor = game.actors.getName(chosenSummon[0]);
            //console.log(summonActor);
            let damageItems = summonActor.data.items.filter((item) => { return item.data.data.damage.parts.length > 0 });
            //console.log(damageItems);
            switch (item.name) {
                case "Summon Aberrant Spirit":
                    hpBonus = 10 * (spellLevel - 4);
                    break;
                case "Summon Beast":
                    hpBonus = 5 * (spellLevel - 2);
                    break;
                case "Summon Celestial":
                    if (chosenSummon[0].includes("Defender")) {
                        acBonus += 2;
                    }
                    hpBonus = 10 * (spellLevel - 5);
                    break;
                case "Summon Construct":
                    hpBonus = 15 * (spellLevel - 3);
                    break;
                case "Summon Elemental":
                    hpBonus = 10 * (spellLevel - 4);
                    break;
                case "Summon Fey":
                    hpBonus = 10 * (spellLevel - 3);
                    break;
                case "Summon Fiend":
                    hpBonus = 15 * (spellLevel - 6);
                    break;
                case "Summon Shadowspawn":
                    hpBonus = 15 * (spellLevel - 3);
                    break;
                case "Summon Undead":
                    hpBonus = 10 * (spellLevel - 3);
                    break;
            }
            if(hpBonus<0){
                hpBonus = 0;
            }
            updates.actor = {
                'data.attributes.hp': { value: summonActor.data.data.attributes.hp.max + hpBonus, max: summonActor.data.data.attributes.hp.max + hpBonus },
                'data.attributes.ac.flat': summonActor.data.data.attributes.ac.base + acBonus,
                'data.bonuses.msak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
                'data.bonuses.mwak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
                'data.bonuses.rsak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
                'data.bonuses.rwak': { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` }
            }
            /*damageItems.forEach((item)=> {
                let currDamage = item.data.data.damage.parts[0][0];
                console.log(currDamage);
                updates.item[item.name] = {
                    'data.attackBonus': `- @mod - @prof + ${attackBonus}`,
                    'data.damage.parts': [[`${currDamage}+${damageBonus}`, `${item.data.data.damage.parts[0][1]}`]]
                } 
            });*/
        }
        const warpgateOptions = { controllingActor: game.actors.get(midiData.actor.id), duplicates: chosenSummon[1] };
        await warpgate.spawn(chosenSummon[0], updates, summonEffectCallbacks, warpgateOptions);
    }
}