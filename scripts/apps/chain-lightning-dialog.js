import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class ChainDialog extends FormApplication {
    constructor(options) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        //console.log(this);
        this.data = {};
        this.data.casterId = options.casterId;
        this.data.itemCardId = options.itemCardId;
        this.data.numTargets = options.numTargets;
        this.data.numMissiles = this.data.numTargets;
        this.data.effectOptions = options.effectOptions;
        this.data.playPreview = false;
        this.data.playPreviewChanged = false;
        this.data.targets = [];
        this.data.targetHookID;
    }

    static async _clearTargets() {
        /*let tokens = Array.from(canvas.tokens.placeables);
            //console.log("ASE Magic Missile Targets Detected...", tokens);
            for (let target of tokens) {
                //console.log('Target: ',target);
                let effectsOnTarget = await Sequencer.EffectManager.getEffects({ object: target }).filter((e) => {
                    //console.log('e data name',e.data.name);
                    return e.data.name.startsWith("missile-target-")
                }).forEach(async (e) => {
                    console.log('Cleaning up leftover ASE Missile Effects...',e);
                    await Sequencer.EffectManager.endEffects({ object: target, name: e.data.name });
                })
                await target?.document.unsetFlag("advancedspelleffects", 'missileSpell');
            }*/
    }
    static async registerHooks() {
        //console.log('Clearing ASE Magic Missile Targets...');
        //Hooks.on("sequencerEffectManagerReady", MissileDialog._clearTargets);
        return;
    }t
    static get defaultOptions() {
        //console.log(this);
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/missile-dialog.html',
            id: 'chain-lightning-dialog',
            title: `Select Targets`,
            resizable: true,
            width: "auto",
            height: "auto",
            close: () => { ui.notify }
        });
    }
    async _buildSeq(caster, targets){
        const primaryBoltAnim = `jb2a.chain_lightning.primary.blue`;
        const secondaryBoltAnim = `jb2a.chain_lightning.secondary.blue`;
        await Sequencer.EffectManager.endEffects({name:`chain-target` });
        let seq = new Sequence("Advanced Spell Effects");
        for(let i=0; i<targets.length; i++) {
            if(i==0){
                console.log(`on target ${i} of ${targets.length}`);
                seq.effect()
                .atLocation(caster)
                .reachTowards(targets[i])
                .file(primaryBoltAnim)
                .name(`chain-target`)
                .waitUntilFinished(-1100)
            }
            else if (i != targets.length-1){
                console.log(`on target ${i} of ${targets.length}`);
                seq.effect()
                .atLocation(targets[i-1])
                .reachTowards(targets[i])
                .file(secondaryBoltAnim)
                .name(`chain-target`)
                .waitUntilFinished(-1400)
            }
            else{
                console.log(`on last target `);
                seq.effect()
                .atLocation(targets[i-1])
                .reachTowards(targets[i])
                .file(secondaryBoltAnim)
                .name(`chain-target`)
                .waitUntilFinished()
            }
        }
        console.log(seq);
        return seq;
    }
    async _playSeq(sequence){
        await sequence.play();
        this.data.playPreview = true;
    }
    async _startPreview(caster, targets){
        await caster.document.setFlag("advancedspelleffects", "chainLightning.playPreview", true);
        this.data.playPreview = !this.data.playPreviewChanged;
        do{
            console.log("Caster: ", caster);
            console.log("Targets: ", targets);
            let chainPreviewSequence = await this._buildSeq(caster, targets);
            await this._playSeq(chainPreviewSequence);
            console.log("Done Playing Sequence...");
            await warpgate.wait(1000);
        } while(this.data.playPreview);
    }
    async _applyMarker(casterId, target) {
        const inTargetList = this.data.targets.find(t => t.id == target.id);
        if (!inTargetList) {
            this.data.targets.push({ id: target.id });
        }
        const caster = canvas.tokens.get(casterId);
        const primaryBoltAnim = `jb2a.chain_lightning.primary.blue`;
        const secondaryBoltAnim = `jb2a.chain_lightning.secondary.blue`;
        let boltNum = caster.document.getFlag("advancedspelleffects", "chainLightning.boltNum") ?? 0;
        const targets = this.data.targets.map(t => canvas.tokens.get(t.id));
        console.log("Current Bolt number: ", boltNum);
        console.log("Caster: ", caster);
        console.log("Current Target: ", target);
        console.log("Targets: ", targets);
        this._startPreview(caster, targets);
        caster.document.setFlag("advancedspelleffects", "chainLightning.boltNum", boltNum + 1);
        //console.log("Total Missiles assigned: ", currMissile + 1);
        
    }

    async _onTargetHook(user, token, targetState, dialogData) {
       user.updateTokenTargets([]);
        //console.log("magic-missile-dialog data: ", this.data);
        //console.log("Caster User: ", user.name);
        //console.log('Token Targetted: ', token.name);
        //console.log('Target State', targetState);
        let numTargets = Number(dialogData.numTargets);
        //console.log('Missiles passed to target hook: ', numTargets);
        if (numTargets == 0) {
            ui.notifications.info("Target Limit Reached!");
        }
        if (this.data.targetHookID) {
            if (numTargets > 0) {
                if (targetState) {
                    document.getElementById("txtNumMissilesId").value--;
                    this._applyMarker(dialogData.casterId, token);
                    //this._addTargetToList(token);
                    this.data.numTargets--;
                    //this.submit({ preventClose: true }).then(() => this.render());
                }
            }
            this.data.targetHookID = Hooks.once('targetToken', async (user, token, targetState) => await this._onTargetHook(user, token, targetState, this.data));
        }
        //this.submit({ preventClose: true }).then(() => this.render());
    }

    async _addTargetToList(target) {
        //console.log(`Adding ${target.document.data.name} to target list...`, target);
        /*let missilesAssigned = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 1;
        //console.log("Missles assigned: ", missilesAssigned);
        let targetsTable = document.getElementById("targetsTable").getElementsByTagName('tbody')[0];
        let targetAssignedMissiles = document.getElementById(`${target.document.id}-missiles`);
        if (!targetAssignedMissiles) {
            let newTargetRow = targetsTable.insertRow(-1);
            newTargetRow.id = `${target.document.id}-row`;
            let newLabel1 = newTargetRow.insertCell(0);
            let newMissilesAssignedInput = newTargetRow.insertCell(1);
            let newRemoveMissileButton = newTargetRow.insertCell(2);
            newLabel1.innerHTML = `<img src="${target.document.data.img}" width="30" height="30" style="border:0px"> - ${target.document.data.name}`;
            newMissilesAssignedInput.innerHTML = `<input style='width: 2em;' type="number" id="${target.document.id}-missiles" readonly value="${missilesAssigned}"></input>`;
            newRemoveMissileButton.innerHTML = `<button id="${target.document.id}-removeMissile" class="btnRemoveMissile" type="button"><i class="fas fa-minus"></i></button>`;
            let btnRemoveMissile = document.getElementById(`${target.document.id}-removeMissile`);
            //console.log(btnRemoveMissile);
            btnRemoveMissile.addEventListener("click", this._removeMissile.bind(this));
            newTargetRow.addEventListener("mouseenter", function (e) {
                let token = canvas.tokens.get($(this).attr('id').split('-')[0]);
                token._onHoverIn(e);
            });
            newTargetRow.addEventListener("mouseleave", function (e) {
                let token = canvas.tokens.get($(this).attr('id').split('-')[0]);
                token._onHoverIn(e);
            });
        }
        else {
            document.getElementById(`${target.document.id}-missiles`).value++;
        }*/

    }

    async _removeMarker(target) {
        /*let missilesAssigned = Number(target.document.getFlag("advancedspelleffects", "missileSpell.missileNum")) ?? 0;
        //console.log("Removing assigned missile...", missilesAssigned);
        await Sequencer.EffectManager.endEffects({ name: `missile-target-${target.id}-${missilesAssigned - 1}` });
        if (missilesAssigned > 0) {
            await target.document.setFlag("advancedspelleffects", "missileSpell.missileNum", missilesAssigned - 1);
        }*/
        //console.log("Total missiles assigned: ", missilesAssigned - 1);
    }

    async _removeMissile(e) {
        //console.log("Removing magic missile...", e);
       /* let target = canvas.tokens.get(e.currentTarget.id.split('-')[0]);
        //console.log("Target: ", target);
        if (target) {
            let missilesAssigned = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum");
            //console.log("Missles assigned: ", missilesAssigned);
            let targetsTable = document.getElementById("targetsTable").getElementsByTagName('tbody')[0];
            let targetAssignedMissiles = document.getElementById(`${target.document.id}-missiles`);
            if (targetAssignedMissiles) {
                document.getElementById(`${target.document.id}-missiles`).value = missilesAssigned - 1;
                this.data.numMissiles = Number(this.data.numMissiles) + 1;
                //console.log("this data num missiles: ", this.data.numMissiles);
                document.getElementById("txtNumMissilesId").value++;
                await this._removeMarker(target);
            }
            if (missilesAssigned == 1) {
                let targetRow = document.getElementById(`${target.document.id}-removeMissile`).closest('tr');
                targetRow.remove();
                let inTargetList = this.data.targets.find(t => t.id == target.id);
                if (inTargetList) {
                    this.data.targets.splice(this.data.targets.indexOf(inTargetList), 1);
                }
            }
        }*/
    }

    async _launchMissile(caster, target) {
        //console.log('MISSILE ANIM: ', this.data.effectOptions);
        /*let missileAnim= `${this.data.effectOptions.missileAnim}.${this.data.effectOptions.missileColor}`;
        new Sequence("Advanced Spell Effects")
            .effect()
            .file(missileAnim)
            .atLocation(caster)
            .JB2A()
            .randomizeMirrorY()
            .reachTowards(target)
            .playbackRate(utilFunctions.getRandomNumber(0.7, 1.3))
            .play();*/
    }

    async getData() {
        this.data.targetHookID = Hooks.once('targetToken', async (user, token, targetState) => await this._onTargetHook(user, token, targetState, this.data));
        /*Hooks.once('closeMissileDialog', async () => {
            let tokens = Array.from(canvas.tokens.placeables).filter(t => t.data.flags.advancedspelleffects && t.data.flags.advancedspelleffects.missileSpell);
            for (let target of tokens) {
                await Sequencer.EffectManager.getEffects({ object: target }).filter(async (e) => {
                    e.data.name.startsWith("missile-target-")
                }).forEach(async (e) => {
                    await Sequencer.EffectManager.endEffects({ object: target, name: e.data.name })
                });
                await target?.document.unsetFlag("advancedspelleffects", 'missileSpell');
            }
            this.submit();
        });*/

        return {
            data: this.data
        };

    }
    async _updateObject(event, formData) {
        //console.log(event);
        /*function addTokenToText(token, damage, numMissiles, missileType, damageFormula, damageType) {

            return `<div class="midi-qol-flex-container">
        <div>
        Launched ${numMissiles} ${missileType}(s) at 
        </div>
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
      <div> dealing <b>${damageFormula} (${damage}) </b>${damageType} damage</div>
      <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
    </div>`;

        }
        //console.log(this);
        let caster = canvas.tokens.get(this.data.caster);
        const chatMessage = await game.messages.get(this.data.itemCardId);
        //console.log(`${caster.name} is firing Missiles at Selected Targets...`);
        //console.log("Missile Data: ", this.data);
        Hooks.off('targetToken', this.data.targetHookID);
        for (let target of this.data.targets) {
            let targetToken = canvas.tokens.get(target.id);
            //console.log("Target: ", targetToken);
            let missileNum = targetToken.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 0;
            if (missileNum == 0) {
                return;
            }
            let damageRoll = await new Roll(`${missileNum*this.data.effectOptions.dmgDieCount}${this.data.effectOptions.dmgDie} +${missileNum*this.data.effectOptions.dmgMod}`).evaluate({ async: true });
            console.log('Damage Roll: ',damageRoll);
            //console.log(`Launching ${missileNum} missiles at ${targetToken.name}...dealing ${damageRoll.total} damage!`);
            game.dice3d?.showForRoll(damageRoll);
            if (game.modules.get("midi-qol")?.active) {
                let chatMessageContent = await duplicate(chatMessage.data.content);
                let newChatmessageContent = $(chatMessageContent);
                //console.log(newChatmessageContent);
                newChatmessageContent.find(".midi-qol-hits-display").append(
                    $(addTokenToText(targetToken, damageRoll.total, missileNum, this.data.effectOptions.missileType, damageRoll.formula, this.data.effectOptions.dmgType))
                );

                new MidiQOL.DamageOnlyWorkflow(caster.actor, caster.document, damageRoll.total, this.data.effectOptions.dmgType , [targetToken], damageRoll, { itemCardId: "new" });
                await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });
                await ui.chat.scrollBottom();

            }
            else {
                let content = `Launched </b>${missileNum}</b> ${this.data.effectOptions.missileType}(s) at <b>${targetToken.name}</b> dealing <b>${damageRoll.formula} (${damageRoll.total}) ${this.data.effectOptions.dmgType}</b> damage!`;
                ChatMessage.create({ content: content, user: game.user.id })
            }
            for (let i = 0; i < missileNum; i++) {
                await this._launchMissile(caster, targetToken);
                await warpgate.wait(utilFunctions.getRandomInt(20, 75));
            }
            await Sequencer.EffectManager.endEffects({ object: targetToken });
            await targetToken.document.unsetFlag("advancedspelleffects", 'missileSpell');
        }*/

        //magicMissileSequence.play();


        //console.log(formData);

    }
    activateListeners(html) {
        //console.log(html);
        super.activateListeners(html);
    }

}
export default ChainDialog;