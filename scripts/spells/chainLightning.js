import * as utilFunctions from "../utilityFunctions.js";
//Courtesy of Wasp - The Sequencer Guy
export class chainLightning {

    constructor(data) {
        this.params = data;
        this.actor = game.actors.get(this.params.actor.id);
        this.token = canvas.tokens.get(this.params.tokenId);
        this.item = this.actor.items.get(this.params.item.id);
        this.firstTarget = this.params.targets[0] ?? Array.from(this.params.targets)[0];
        if (game.modules.get("midi-qol")?.active) {
            this.targetFailedSave = this.params.failedSaves.length > 0;
        }
        else {
            this.targetFailedSave = true;
        }
        this.itemCardId = this.params.itemCardId;

        this.originalDamage = this.params.damageTotal;
        this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
        this.spellLevel = this.params.itemLevel ? Number(this.params.itemLevel) : 6;
        if (this.effectOptions.levelScaling || this.effectOptions.levelScaling === undefined) {
            this.targetsToJumpTo = 3 + (this.spellLevel - 6);
        }
        else if (!this.effectOptions.levelScaling) {
            this.targetsToJumpTo = Number(this.effectOptions.numJumps) ?? 3;
        }


        this.spellSaveDC = this.actor.data.data.attributes.spelldc;

        this.targetData = [];
    }


    static registerHooks() {
        return;
    }
    async cast() {
        console.log("Running Chain Lightning...");
        //await this.rollInitialDamage();
        await this.promptJumps();
        if (!this.targetData) {
            await this.playSequence();
            return;
        }
        await this.rollSaves();
        await this.playSequence();
        if (game.modules.get("midi-qol")?.active) {
            await this.applyDamage();
            await this.updateChatCards();
        }
    }

    async rollInitialDamage() {
        const target = this.firstTarget;
        if (!target) return false;
        const saveRoll = await new Roll("1d20+@mod", { mod: target.token.actor.data.data.abilities.dex.save }).evaluate({ async: true });

        const damageDie = this.params.dmgDie ?? 'd8';
        const damageDieCount = this.params.dmgDieCount ?? 10;
        const damageDieBonus = this.params.dmgMod ?? 0;
        let damageFormula = `${damageDieCount}${damageDie}+${damageDieBonus}`;

        const damageRoll = await new Roll(damageFormula).evaluate({ async: true });
        if (game.modules.get("dice-so-nice")?.active) {
            game.dice3d?.showForRoll(saveRoll);
            game.dice3d?.showForRoll(damageRoll);
        }

        this.targetFailedSave = roll < this.spellSaveDC;
    }

    async promptJumps() {

        let firstTarget = this.firstTarget;
        let tokenD = this.token;
        console.log("firstTarget", firstTarget);
        console.log("tokenD", tokenD);
        const potentialTargets = canvas.tokens.placeables.filter(function (target) {
            return target.actor.data.data.attributes.hp.value > 0
                && canvas.grid.measureDistance(firstTarget, target) <= 32.5
                && target !== firstTarget
                && target !== tokenD
        });

        if (!potentialTargets.length) return;

        const targetList = potentialTargets.map((target, index) => {
            return `
            <tr class="chain-lightning-target" tokenId="${target.id}">
                <td class="chain-lightning-flex">
                    <img src="${target.data.img}" width="30" height="30" style="border:0px"> - ${target.name}
                </td>
                <td>
                    <input type="checkbox" class='target' name="${index}">
                </td>
            </tr>
            `;
        }).join('');

        const content = `
        <style>
            .chain-lightning-flex {
                display: inline-flex;
                align-items: center;
            }
            .chain-lightning-flex img {
                margin-right: 0.5rem;
            }
        </style>
        <p>Your chain lightning can jump to <b>${this.targetsToJumpTo}</b> targets.</p>
        <p>You have <b class="chain-lightning-count">${this.targetsToJumpTo}</b> left to assign.</p>
        <form class="flexcol">
            <table width="100%">
                <tbody>
                    <tr>
                        <th>Potential Target</th>
                        <th>Jump to</th>
                    </tr>
                    ${targetList}
                </tbody>
            </table>
        </form>
        `;

        this.targetData = await new Promise(async resolve => {
            let resolved = false;
            new Dialog({
                title: "Chain Lightning: Choose Jump Targets",
                content,
                buttons: {
                    one: {
                        icon: `<i class="fas fa-bolt"></i>`,
                        label: "FIRE AT WILL",
                        callback: async (html) => {
                            let selected_targets = html.find('input:checkbox:checked');
                            let targetData = [];
                            for (let input of selected_targets) {
                                targetData.push({
                                    token: potentialTargets[Number(input.name)],
                                    saved: true
                                });
                            }
                            resolved = true;
                            resolve(targetData);
                        }
                    }
                },
                close: () => {
                    if (!resolved) resolve(false);
                },
                render: (html) => {

                    const jumpCount = html.find('.chain-lightning-count');

                    html.find(".chain-lightning-target").on("mouseenter", function (e) {
                        let token = canvas.tokens.get($(this).attr('tokenId'));
                        token._onHoverIn(e);
                    }).on("mouseleave", function (e) {
                        let token = canvas.tokens.get($(this).attr('tokenId'));
                        token._onHoverOut(e);
                    });

                    let numJumps = this.targetsToJumpTo;

                    html.find("input:checkbox").on('change', function () {
                        let total = html.find('input:checkbox:checked').length;
                        jumpCount.text(Math.max(numJumps - total, 0));
                        html.find('input:checkbox:not(:checked)').each(function () {
                            $(this).prop('disabled', total === numJumps);
                        });
                    });

                }
            }).render(true);

        });

    }

    async rollSaves() {

        for (let target of this.targetData) {

            const roll = await new Roll("1d20+@mod", { mod: target.token.actor.data.data.abilities.dex.save }).evaluate({ async: true });
            target.rollTotal = roll.total;
            target.roll = roll;
            target.saved = roll.total >= this.spellSaveDC;

        }

    }

    async applyDamage() {

        const targetSet = new Set(this.targetData.map(target => target.token));
        const saveSet = new Set(this.targetData.filter(target => target.saved).map(target => target.token));

        MidiQOL.applyTokenDamage(
            [{ damage: this.originalDamage, type: "lightning" }],
            this.originalDamage,
            targetSet,
            this.item,
            saveSet
        )

    }

    async playSequence() {

        if (!game.modules.get('sequencer')?.active) return;
        if (!game.modules.get('jb2a_patreon')?.active) return;

        let sequence = new Sequence()
            .wait(350)
            .sound()
            .file(this.effectOptions.primarySound)
            .delay(this.effectOptions.primarySoundDelay)
            .volume(this.effectOptions.primarySoundVolume)
            .playIf(this.effectOptions.primarySound != "")
            .effect()
            .file(`jb2a.chain_lightning.primary.${this.effectOptions.primaryBoltColor}`)
            .atLocation(this.token)
            .reachTowards(this.firstTarget)
            .randomizeMirrorY()
            .effect()
            .file(`jb2a.static_electricity.02.${this.effectOptions.saveFailEffectColor}`)
            .atLocation(this.firstTarget)
            .scaleToObject(1.3)
            .randomRotation()
            .duration(5000)
            .delay(600)
            .playIf(this.targetFailedSave)
            .wait(750)

        for (let target of this.targetData) {
            let randomDelay = utilFunctions.getRandomInt(this.effectOptions.secondaryBoltDelayLower, this.effectOptions.secondaryBoltDelayUpper);
            sequence.sound()
                .file(this.effectOptions.secondarySound)
                .delay(randomDelay + this.effectOptions.secondarySoundDelay)
                .volume(this.effectOptions.secondarySoundVolume)
                .playIf(this.effectOptions.secondarySound != "")
                .effect()
                .file(`jb2a.chain_lightning.secondary.${this.effectOptions.secondaryBoltColor}`)
                .atLocation(this.firstTarget)
                .reachTowards(target.token)
                .randomizeMirrorY()
                .delay(randomDelay)
                .effect()
                .file(`jb2a.static_electricity.02.${this.effectOptions.saveFailEffectColor}`)
                .atLocation(target.token)
                .scaleToObject(1.63)
                .randomRotation()
                .duration(5000)
                .delay(randomDelay + 400)
                .playIf(!target.saved)
        }

        sequence.play();

    }

    async updateChatCards() {

        const chatMessage = await game.messages.get(this.params.itemCardId);
        let chatMessageContent = $(await duplicate(chatMessage.data.content));
        chatMessageContent.find(".midi-qol-nobox.midi-qol-saves-display").append(
            this.targetData.map(target => {
                console.log(target.roll);
                return `
                <div class="midi-qol-flex-container">
                    <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${target.token.id}"> ${target.token.name}</div>
                    <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${target.token.id}" style="display: none;"> ${target.token.name}</div>
                    <div class="midi-qol-tooltip midi-qol-save-total">${target.saved ? "succeeds" : "fails"} : ${target.rollTotal}
                    <div class="midi-qol-tooltiptext midi-qol-save-tooltip" style="text-align: left;">
                    <div>${target.roll.formula}</div>
                    <div>${target.roll.result}</div>
                    </div></div>
                    <div><img src="${target.token.data.img}" height="30" style="border:0px"></div>
                </div>`;
            })
        );

        await chatMessage.update({ content: chatMessageContent.prop('outerHTML') });

    }
    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const primaryColorOptions = utilFunctions.getDBOptions('jb2a.chain_lightning.primary');
        const secondaryColorOptions = utilFunctions.getDBOptions('jb2a.chain_lightning.secondary');
        const failSaveEffectColorOptions = utilFunctions.getDBOptions('jb2a.static_electricity.02');

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        const dieOptions = {
            'd4': 'd4',
            'd6': 'd6',
            'd8': 'd8',
            'd10': 'd10',
            'd12': 'd12',
            'd20': 'd20',
        };

        spellOptions.push({
            label: game.i18n.localize("ASE.ScaleWithLevelLabel"),
            type: 'checkbox',
            name: 'flags.advancedspelleffects.effectOptions.levelScaling',
            flagName: 'levelScaling',
            flagValue: currFlags.levelScaling ?? true,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.ChainLightningNumJumpsLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.numJumps',
            flagName: 'numJumps',
            flagValue: currFlags.numJumps ?? 3,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieCountLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgDieCount',
            flagName: 'dmgDieCount',
            flagValue: currFlags.dmgDieCount ?? 10,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieLabel"),
            type: 'dropdown',
            options: dieOptions,
            name: 'flags.advancedspelleffects.effectOptions.dmgDie',
            flagName: 'dmgDie',
            flagValue: currFlags.dmgDie ?? 'd8',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageBonusLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgMod',
            flagName: 'dmgMod',
            flagValue: currFlags.dmgMod ?? 0,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ChainLightningPrimaryColorLabel"),
            type: 'dropdown',
            options: primaryColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.primaryBoltColor',
            flagName: 'primaryBoltColor',
            flagValue: currFlags.primaryBoltColor,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ChainLightningPrimarySoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.primarySound',
            flagName: 'primarySound',
            flagValue: currFlags.primarySound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ChainLightningPrimarySoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.primarySoundDelay',
            flagName: 'primarySoundDelay',
            flagValue: currFlags.primarySoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ChainLightningPrimaryVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.primarySoundVolume',
            flagName: 'primarySoundVolume',
            flagValue: currFlags.primarySoundVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });


        animOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSecondaryColorLabel"),
            type: 'dropdown',
            options: secondaryColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.secondaryBoltColor',
            flagName: 'secondaryBoltColor',
            flagValue: currFlags.secondaryBoltColor,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSecondarySoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.secondarySound',
            flagName: 'secondarySound',
            flagValue: currFlags.secondarySound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSecondarySoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.secondarySoundDelay',
            flagName: 'secondarySoundDelay',
            flagValue: currFlags.secondarySoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSecondaryVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.secondarySoundVolume',
            flagName: 'secondarySoundVolume',
            flagValue: currFlags.secondarySoundVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSecondaryDelayLowerLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.secondaryBoltDelayLower',
            flagName: 'secondaryBoltDelayLower',
            flagValue: currFlags.secondaryBoltDelayLower ?? 0,
        });
        animOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSecondaryDelayUpperLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.secondaryBoltDelayUpper',
            flagName: 'secondaryBoltDelayUpper',
            flagValue: currFlags.secondaryBoltDelayUpper ?? 250,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.ChainLightningSaveFailEffectLabel"),
            type: 'dropdown',
            options: failSaveEffectColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.saveFailEffectColor',
            flagName: 'saveFailEffectColor',
            flagValue: currFlags.saveFailEffectColor,
        });


        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }

}