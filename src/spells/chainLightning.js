import * as utilFunctions from "../utilityFunctions.js";
import { ChainLightningSequence } from "../sequences/ChainLightningSequence.js";
//Courtesy of Wasp - The Sequencer Guy
export class chainLightning {

    constructor(data) {
        this.params = data;
        this.actor = game.actors.get(this.params.actor.id);
        this.token = canvas.tokens.get(this.params.tokenId);
        this.item = this.params.item;
        this.firstTarget = this.params.targets[0] ?? Array.from(this.params.targets)[0];
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


        this.spellSaveDC = this.actor.system.attributes.spelldc;

        this.targetData = [];

    }


    static registerHooks() {
        return;
    }
    async cast() {
        console.log("Running Chain Lightning...");
        if(!this.firstTarget) {
            ui.notifications.error("Target Required");
            return;
        }
        //await this.rollInitialDamage();
        await this.promptJumps();
        console.log(this);
        if(this.targetData) {
            let targets = this.targetData.map(target => target.token.document.uuid);
            targets.push(this.firstTarget.document.uuid);
            let spellOptions = {
                targetted: true,
                targets: targets,
                sequenceBuilder: ChainLightningSequence,
                firstTarget: this.firstTarget.document.uuid,
                effectOptions: this.effectOptions,
                caster: this.token.document.uuid,
                failedSaves: []
            };
            game.ASESpellStateManager.addSpell(this.item.uuid, spellOptions)
            return;
        }
        /*if (!this.targetData) {
            await this.playSequence();
            return;
        }
        await this.rollSaves();
        await this.playSequence();
        if (game.modules.get("midi-qol")?.active) {
            await this.applyDamage();
            await this.updateChatCards();
        }*/
    }

    async promptJumps() {

        let firstTarget = this.firstTarget;
        let tokenD = this.token;
        //console.log("firstTarget", firstTarget);
        //console.log("tokenD", tokenD);
        const potentialTargets = canvas.tokens.placeables.filter(function (target) {
            return target.actor?.system?.attributes.hp.value > 0
                && canvas.grid.measureDistance(firstTarget, target) <= 32.5
                && target !== firstTarget
                && target !== tokenD
        });

        if (!potentialTargets.length) return;

        const targetList = potentialTargets.map((target, index) => {
            return `
            <tr class="chain-lightning-target" tokenId="${target.id}">
                <td class="chain-lightning-flex">
                    <img src="${target.document.texture.src}" width="30" height="30" style="border:0px"> - ${target.name}
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


    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        const primaryColorOptions = utilFunctions.getDBOptions('jb2a.chain_lightning.primary');
        const secondaryColorOptions = utilFunctions.getDBOptions('jb2a.chain_lightning.secondary');
        const failSaveEffectColorOptions = utilFunctions.getDBOptions('jb2a.static_electricity.02');

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        const spellDetails = {
            actionType: "save",
            target : {
                type: "",
                units: "",
                value: null,
                width: null,
            }
        };

        animOptions.push({
            label: game.i18n.localize("ASE.ChainLightningPrimaryColorLabel"),
            type: 'dropdown',
            options: primaryColorOptions,
            name: 'flags.advancedspelleffects.effectOptions.primaryBoltColor',
            flagName: 'primaryBoltColor',
            flagValue: currFlags.primaryBoltColor ?? 'blue',
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
            flagValue: currFlags.primarySoundVolume ?? 0.5,
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
            flagValue: currFlags.secondaryBoltColor ?? 'blue',
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
            flagValue: currFlags.secondarySoundVolume ?? 0.5,
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
            flagValue: currFlags.saveFailEffectColor ?? 'blue',
        });


        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: false,
            requireDetails: spellDetails
        }

    }

}
