// Chaos Bolt by Wasp

import { wait } from "../utilityFunctions.js";
import baseSpellClass from "./baseSpellClass.js";

export class chaosBolt extends baseSpellClass{

    elements = {
        "Acid": "icons/magic/acid/projectile-faceted-glob.webp",
        "Cold": "icons/magic/air/wind-tornado-wall-blue.webp",
        "Fire": "icons/magic/fire/beam-jet-stream-embers.webp",
        "Force": "icons/magic/sonic/projectile-sound-rings-wave.webp",
        "Lightning": "icons/magic/lightning/bolt-blue.webp",
        "Poison": "icons/magic/death/skull-poison-green.webp",
        "Psychic": "icons/magic/control/fear-fright-monster-grin-red-orange.webp",
        "Thunder":"icons/magic/sonic/explosion-shock-wave-teal.webp"
    }

    constructor(args){
        super();

        this.params = args;

        this.actor = game.actors.get(this.params.actor.id);
        this.token = canvas.tokens.get(this.params.tokenId);
        this.item = this.params.item;

        this.rollProf = this.actor.data.data.attributes.prof;
        const rollAbility = this.actor.data.data.attributes.spellcasting;
        this.rollMod = this.actor.data.data.abilities[rollAbility].mod || 0;
        this.attackBonus = this.actor.data.data.bonuses.rsak.attack;
        this.damageBonus = this.actor.data.data.bonuses.rsak.damage;

        this.itemCardId = this.params.itemCardId;

        this.spellLevel = Number(this.params.itemLevel);

        const target = Array.from(this.params.targets)[0];

        this.attackData = [{
            "origin": this.token,
            "target": target
        }];

        this.targetsHitSoFar = [];

    }

    static async cast(args){
        const workflow = new this(args);

        let bouncing = true;
        while(bouncing) {
            const validTarget = await workflow.determineTarget();
            if(!validTarget) break;
            await workflow.rollAttack();
            const validDamage = await workflow.rollDamage();
            await workflow.updateChatCards();
            bouncing = workflow.attackData[workflow.attackData.length-1].bounce && validDamage;
        }

        await workflow.playSequence();
    }

    async determineTarget(){

        const attack = this.attackData[this.attackData.length-1];

        if(!this.targetsHitSoFar.length){
            this.targetsHitSoFar.push(attack.target.id);
            return true;
        }

        this.targetsHitSoFar.push(attack.target.id);

        const distance = 29.5;
        const potentialTargets = canvas.tokens.placeables.filter(new_target => {
            return canvas.grid.measureDistance(attack.target.center, new_target.center) <= distance
                && this.targetsHitSoFar.indexOf(new_target.id) === -1
                && attack.target.data.disposition === new_target.data.disposition
                && new_target.actor.data.data.attributes.hp.value > 0
                && new_target !== this.token;
        });

        if(potentialTargets.length === 0){
            return false;
        }

        potentialTargets.sort((a, b) => {
            return canvas.grid.measureDistance(this.token.center, a.center) - canvas.grid.measureDistance(this.token.center, b.center);
        });

        const result = await warpgate.menu({
            buttons: potentialTargets.map(target => {
                const distance = Math.floor(canvas.grid.measureDistance(attack.target.center, target.center));
                return {
                    label: `<img width="100" style="border:0;" data-tokenid="${target.id}" src="${target.data.img}"/><br>${target.name} (${distance}ft away)`,
                    value: {
                        target
                    }
                };
            })
        }, { title: "Choose your target!", options: { height: "100%", width: "auto" }});

        if(!result.buttons){
            return false;
        }

        this.attackData.push({
            "origin": attack.target,
            "target": result.buttons.target
        })

        return true;

    }

    async rollAttack() {

        const attackBonus = `1d20 + ${this.rollProf} + ${this.rollMod}` + (this.attackBonus !== "" ? " + " + this.attackBonus : "")

        const roll = (await new CONFIG.Dice.D20Roll(attackBonus).configureDialog({ title: "Chaos Bolt: Roll Attack" }))

        const attackRoll = await roll.evaluate({ async: true });

        const criticalHit = attackRoll.dice[0].results[0].result === 20;
        const criticalMiss = attackRoll.dice[0].results[0].result === 1;

        game.dice3d?.showForRoll(attackRoll);

        let attackRollRender = await attackRoll.render();

        if(criticalHit) {
            attackRollRender = attackRollRender.replace('dice-total', 'dice-total critical');
        }

        if(criticalMiss) {
            attackRollRender = attackRollRender.replace('dice-total', 'dice-total fumble');
        }

        const attack = this.attackData[this.attackData.length-1];

        this.attackData[this.attackData.length-1] = {
            ...attack,
            roll: attackRoll,
            attackRollRender: attackRollRender,
            hits: attackRoll.total >= attack.target.actor.data.data.attributes.ac.value && !criticalMiss,
            criticalHit: criticalHit,
            criticalMiss: criticalMiss
        }

    }

    async rollDamage() {

        const attack = this.attackData[this.attackData.length-1];

        let damageRollFormula = `1d8 + 1d8 + ${this.spellLevel}d6`;

        if(attack.criticalHit){
            damageRollFormula = damageRollFormula + " + " + damageRollFormula;
        }

        if(this.damageBonus !== ""){
            damageRollFormula += " + " + this.damageBonus;
        }

        const damageRoll = await new Roll(damageRollFormula).evaluate({ async: true });

        game.dice3d?.showForRoll(damageRoll);

        const forcedRolls = Math.floor(Math.random()*8);

        const firstElementIndex = CONFIG.forcedRolls ? forcedRolls : damageRoll.dice[0].total-1;
        const secondElementIndex = CONFIG.forcedRolls ? forcedRolls : damageRoll.dice[1].total-1;

        let damageType = Object.keys(this.elements)[firstElementIndex].toLowerCase();

        if(firstElementIndex !== secondElementIndex && attack.hits) {

            const firstElement = Object.keys(this.elements)[firstElementIndex];
            const secondElement = Object.keys(this.elements)[secondElementIndex];

            const options = {
                buttons: [{
                    label: `<img src="${this.elements[firstElement]}"/> ${firstElement.toSentenceCase()} damage`,
                    value: {
                        element: firstElement
                    }
                }, {
                    label: `<img src="${this.elements[secondElement]}"/> ${secondElement.toSentenceCase()} damage`,
                    value: {
                        element: secondElement
                    }
                }]
            }

            const result = await warpgate.menu(options, { title: "Choose your damage type!", options: { height: "100%" } });

            if (!result.buttons) return false;

            damageType = result.buttons.element.toLowerCase();

        }

        this.attackData[this.attackData.length-1] = {
            ...attack,
            damage: damageRoll.total,
            damageType: damageType,
            damageRollRender: await damageRoll.render(),
            bounce: firstElementIndex === secondElementIndex && attack.hits
        }

        if(!attack.hits) return false;

        await MidiQOL.applyTokenDamage(
            [{ damage: damageRoll.total, type: damageType }],
            damageRoll.total,
            new Set([attack.target]),
            this.item,
            new Set()
        )

        return true;

    }

    async playSequence() {

        if(!game.modules.get('sequencer')?.active) return;
        if(!game.modules.get('jb2a_patreon')?.active) return;

        let sequence = new Sequence();

        for(const attack of this.attackData){
            damageSequences[attack.damageType](sequence, attack)
        }

        sequence.play();

    }

    async updateChatCards() {

        await wait(250);

        const attack = this.attackData[this.attackData.length-1];

        const chatMessage = await game.messages.get(this.itemCardId);
        const duplicatedContent = await duplicate(chatMessage.data.content);
        const content = $(duplicatedContent);

        const attackRolls = content.find('.midi-qol-attack-roll');
        attackRolls.parent().parent().addClass('flexrow 2');
        attackRolls.html(attackRolls.html() +  `
            <div style="text-align:center">Attack ${this.attackData.length}</div>
            ${attack.attackRollRender}
        `);

        const damageRolls = content.find('.midi-qol-damage-roll');
        damageRolls.html(damageRolls.html() + `
            <div style="text-align:center">(${attack.damageType})${!attack.hits ? " - Missed" : ""}</div>
            ${attack.damageRollRender}
        `);

        if(attack.hits) {
            const hitsUI = content.find('.midi-qol-hits-display');
            hitsUI.html(hitsUI.html() + `
                <div>
                    <div class="midi-qol-nobox">
                        <div class="midi-qol-flex-container">
                            <div class="midi-qol-target-npc midi-qol-target-name" id="${attack.target.id}">
                                <img src="${attack.target.data.img}" width="30" height="30" style="border:0px">
                            </div>
                            <div> takes ${attack.damage} ${attack.damageType} damage.</div>
                        </div>
                    </div>
                </div>
            `)
        }

        await chatMessage.update({ content: content.prop('outerHTML') });

        await ui.chat.scrollBottom();

    }

}

const damageSequences = {
    "acid": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .file("jb2a.magic_missile.green")
                .missed(!attack.hits)
                .waitUntilFinished(-1000)
    },
    "cold": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .missed(!attack.hits)
                .file("jb2a.ray_of_frost.blue")
                .waitUntilFinished(-1500)
    },
    "fire": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .file("jb2a.fire_bolt.orange")
                .missed(!attack.hits)
                .waitUntilFinished(-1000)
    },
    "force": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .file("jb2a.eldritch_blast.purple")
                .missed(!attack.hits)
                .waitUntilFinished(-3000)
    },
    "lightning": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .file("jb2a.chain_lightning.primary.blue")
                .missed(!attack.hits)
                .waitUntilFinished(-1500)
    },
    "poison": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .file("jb2a.spell_projectile.skull.pinkpurple")
                .missed(!attack.hits)
                .waitUntilFinished(-1500)
    },
    "psychic": (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                .stretchTo(attack.target)
                .file("jb2a.disintegrate.dark_red")
                .missed(!attack.hits)
                .waitUntilFinished(-1750)
    },
    "thunder":  (sequence, attack) => {
        sequence
            .effect()
                .atLocation(attack.origin)
                    .stretchTo(attack.target)
                    .file("jb2a.bullet.01.blue")
                    .missed(!attack.hits)
                    .name(`chaos-missile-thunder-${attack.origin.id}`)
                    .waitUntilFinished(-1000)
                .effect()
                    .atLocation(`chaos-missile-thunder-${attack.origin.id}`)
                    .file("jb2a.shatter.blue")
                    .waitUntilFinished(-1500)
    },
};