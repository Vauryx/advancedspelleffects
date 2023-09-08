import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class MissileDialog extends FormApplication {

    constructor(options) {
        super(options);
        foundry.utils.mergeObject(this.options, options);
        //console.log(this);
        this.data = {};
        this.data.attackMods = {};
        this.data.numMissiles = options.numMissiles;
        this.data.numMissilesMax = options.numMissiles;
        this.data.caster = options.casterId;
        this.data.itemCardId = options.itemCardId;
        this.data.item = options.item;
        this.data.actionType = options?.actionType || "other";
        this.data.effectOptions = options.effectOptions;
        this.data.allAttackRolls = [];
        this.data.allDamRolls = [];
        this.data.targets = [];
    }

    static async registerHooks() {
        return;
    }

    static get defaultOptions() {
        //console.log(this);
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/missile-dialog.html',
            id: 'missile-dialog',
            title: game.i18n.localize("ASE.SelectTargetsDialogTitle"),
            resizable: true,
            width: "auto",
            height: "auto",
            left: game.user?.getFlag("advancedspelleffects", "missileDialogPos.left") ?? "auto",
            top: game.user?.getFlag("advancedspelleffects", "missileDialogPos.top") ?? "auto",
            submitOnClose: true,
            close: () => { Hooks.call('closeMissileDialog'); }
        });
    }

    async _applyMarker(target, type) {
        //console.log('type: ',type);
        let markerAnim = `${this.data.effectOptions.targetMarkerType}.${this.data.effectOptions.targetMarkerColor}`;
        const markerSound = this.data.effectOptions.markerSound ?? "";
        const markerSoundDelay = Number(this.data.effectOptions.markerSoundDelay) ?? 0;
        const markerSoundVolume = Number(this.data.effectOptions.markerVolume) ?? 1;
        const markerAnimHue = this.data.effectOptions.targetMarkerHue ?? 0;
        const markerAnimSaturation = this.data.effectOptions.targetMarkerSaturation ?? 0;

        let baseScale = this.data.effectOptions.baseScale;
        let currMissile = this.data.targets.map(targetData => {
            return { id: targetData.id, missilesAssigned: targetData.missilesAssigned };
        }).filter(t => t.id == target.id)[0]?.missilesAssigned ?? 0;//target.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 0;
        //console.log("Current missile number: ", currMissile);
        //console.log("Missiles currently assigned to target...", currMissile);
        let baseOffset = canvas.grid.size / 2;
        let offsetMod = (-(1 / 4) * currMissile) + 1;
        // console.log("offset Modifier: ", offsetMod);
        let offset = { x: baseOffset * offsetMod, y: baseOffset }
        let markerSeq = new Sequence("Advanced Spell Effects")
            .sound()
            .file(markerSound)
            .delay(markerSoundDelay)
            .volume(markerSoundVolume)
            .playIf(markerSound != "")
            .effect()
            .attachTo(target, { followRotation: false, offset: offset })
            .filter("ColorMatrix", { hue: markerAnimHue, saturate: markerAnimSaturation })
            .locally()
            .file(markerAnim)
            .scale(0.01)
            .name(`missile-target-${target.id}-${currMissile}`)
            .duration(300000)
            .animateProperty("sprite", "scale.x", { from: 0.01, to: baseScale, delay: 200, duration: 700, ease: "easeOutBounce" })
            .animateProperty("sprite", "scale.y", { from: 0.01, to: baseScale, duration: 900, ease: "easeOutBounce" })

        if (type == 'kh') {
            markerSeq.loopProperty("sprite", "position.y", { from: 0, to: -10, duration: 1000, ease: "easeInOutSine", pingPong: true });

        }
        else if (type == 'kl') {
            markerSeq.loopProperty("sprite", "position.y", { from: 0, to: 10, duration: 1000, ease: "easeInOutSine", pingPong: true });
        }
        markerSeq.play();
        if (!this.data.attackMods[target.id]) {
            this.data.attackMods[target.id] = [{ index: currMissile, type: type }];
        }
        else {
            this.data.attackMods[target.id].push({ index: currMissile, type: type });
        }
        //await aseSocket.executeAsGM("updateFlag", target.document.id, "missileSpell.missileNum", currMissile + 1);
        //console.log("Total Missiles assigned: ", currMissile + 1);
        let inTargetList = this.data.targets.find(t => t.id == target.id);
        if (!inTargetList) {
            this.data.targets.push({ id: target.id, missilesAssigned: 1 });
        } else {
            inTargetList.missilesAssigned++;
        }
    }

    async _handleClick(event) {
        //console.log('Clicked: ', event);
        let parsedEventData = {
            altKey: event.originalEvent.altKey,
            ctrlKey: event.originalEvent.ctrlKey,
            button: event.originalEvent.button
        }
        //set attacktype to 1 if altkey and -1 if ctrlkey, 0 by default
        let attackType = parsedEventData.altKey ? 'kh' : (parsedEventData.ctrlKey ? 'kl' : '');
        //console.log('Mouse Click Data: ', parsedEventData);
        let token = canvas.tokens.placeables.filter(token => {
            const mouse = utilFunctions.getCanvasMouse();
            const mouseLocal = mouse.getLocalPosition(token);
            //console.log('Mouse Local: ', mouseLocal);
            return mouseLocal.x >= 0 && mouseLocal.x <= token.hitArea.width
                && mouseLocal.y >= 0 && mouseLocal.y <= token.hitArea.height;
        })[0];
        if (token) {
            //console.log('Target: ', token.name);
            if (parsedEventData.button == 0) {
                let numMissiles = this.data.numMissiles;
                //console.log('Missiles passed to target hook: ', numMissiles);
                if (numMissiles == 0) {
                    ui.notifications.info("Missile Limit Reached!");
                }
                if (numMissiles > 0) {
                    const missileTextBox = document.getElementById("txtNumMissilesId");
                    if (missileTextBox) {
                        missileTextBox.value--;
                    }
                    await this._applyMarker(token, attackType);
                    this._addTargetToList(token);
                    this.data.numMissiles--;
                }
            }
            else if (parsedEventData.button == 2) {
                this._removeMissile(token);
            }
            //console.log(this);
        }

    }

    async _addTargetToList(target) {
        //console.log(`Adding ${target.document.data.name} to target list...`, target);
        //let missilesAssigned = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 1;
        let missilesAssigned = this.data.targets.find(t => t.id == target.id)?.missilesAssigned ?? 1;
        //console.log("Missles assigned: ", missilesAssigned);
        let targetsTable = document.getElementById("targetsTable").getElementsByTagName('tbody')[0];
        let targetAssignedMissiles = document.getElementById(`${target.document.id}-missiles`);
        if (!targetAssignedMissiles) {
            let newTargetRow = targetsTable.insertRow(-1);
            newTargetRow.id = `${target.document.id}-row`;
            let newLabel1 = newTargetRow.insertCell(0);
            let newMissilesAssignedInput = newTargetRow.insertCell(1);
            let newRemoveMissileButton = newTargetRow.insertCell(2);
            newLabel1.innerHTML = `<img src="${target.document.texture.src}" width="30" height="30" style="border:0px"> - ${target.document.name}`;
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
            $("#missile-dialog").height("auto");

        }
        else {
            document.getElementById(`${target.document.id}-missiles`).value++;
        }

    }

    async _removeMarker(target) {
        /*let missilesAssigned = this.data.targets.map(targetData => {
            return { id: targetData.id, missilesAssigned: targetData.missilesAssigned };
        }).filter(t => t.id == target.id)[0].missilesAssigned;//Number(target.document.getFlag("advancedspelleffects", "missileSpell.missileNum")) ?? 0;
        console.log("Removing assigned missile...", missilesAssigned, target);*/
        const targetData = this.data.targets.find(t => t.id == target.id);
        const missilesAssigned = targetData.missilesAssigned;
        //console.log("Removing assigned missile...", missilesAssigned, target);
        await Sequencer.EffectManager.endEffects({ name: `missile-target-${target.id}-${missilesAssigned - 1}` });
        if (missilesAssigned > 0) {
            //await aseSocket.executeAsGM("updateFlag", target.id, "missileSpell.missileNum", missilesAssigned - 1);
            targetData.missilesAssigned--;
        }
        //console.log("Total missiles assigned: ", missilesAssigned - 1);
    }

    async _removeMissile(e) {

        let target = e.currentTarget ? canvas.tokens.get(e.currentTarget.id.split('-')[0]) : e;
        //console.log("Target: ", target);
        if (target) {
            //let missilesAssigned = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum");
            let missilesAssigned = this.data.targets.find(t => t.id == target.id)?.missilesAssigned ?? 0;
            //console.log("Missles assigned: ", missilesAssigned);
            let targetAssignedMissiles = document.getElementById(`${target.document.id}-missiles`);
            if (targetAssignedMissiles) {
                document.getElementById(`${target.document.id}-missiles`).value = missilesAssigned - 1;
                this.data.numMissiles = Number(this.data.numMissiles) + 1;
                //console.log("this data num missiles: ", this.data.numMissiles);
                document.getElementById("txtNumMissilesId").value++;
                await this._removeMarker(target);
                this.data.attackMods[target.id].pop();
            }
            if (missilesAssigned == 1) {
                let targetRow = document.getElementById(`${target.document.id}-removeMissile`).closest('tr');
                targetRow.remove();
                let inTargetList = this.data.targets.find(t => t.id == target.id);
                if (inTargetList) {
                    this.data.targets.splice(this.data.targets.indexOf(inTargetList), 1);
                }
            }
        }
    }

    async _launchMissile(caster, target, attackData) {
        //console.log('MISSILE ANIM: ', this.data.effectOptions);
        //console.log(attackData);
        let hit = attackData.hit;
        let missileAnim = `${this.data.effectOptions.missileAnim}.${this.data.effectOptions.missileColor}`;

        const missileIntroSound = this.data.effectOptions.missileIntroSound ?? "";
        const missleIntroPlayback = this.data.effectOptions.missileIntroSoundPlayback ?? "indiv";
        let missileIntroSoundDelay = Number(this.data.effectOptions.missileIntroSoundDelay) ?? 0;
        let missileIntroVolume = Number(this.data.effectOptions.missileIntroVolume) ?? 1;

        const impactDelay = Number(this.data.effectOptions.impactDelay) ?? -1000;
        const missileImpactSound = this.data.effectOptions.missileImpactSound ?? "";
        const missleImpactPlayback = this.data.effectOptions.missileImpactSoundPlayback ?? "indiv";
        let missileImpactSoundDelay = Number(this.data.effectOptions.missileImpactSoundDelay) ?? 0;
        let missileImpactVolume = Number(this.data.effectOptions.missileImpactVolume) ?? 1;

        //console.log(target);
        new Sequence("Advanced Spell Effects")
            .sound()
            .file(missileIntroSound)
            .delay(missileIntroSoundDelay)
            .volume(missileIntroVolume)
            .playIf(missileIntroSound != "" && missleIntroPlayback == "indiv")
            .effect()
            .file(missileAnim)
            .atLocation(caster)
            .randomizeMirrorY()
            .missed(!hit)
            .stretchTo(target,{randomOffset:0.65})
            //.playbackRate(utilFunctions.getRandomNumber(0.7, 1.3))
            .waitUntilFinished(impactDelay)
            .sound()
            .file(missileImpactSound)
            .delay(missileImpactSoundDelay)
            .volume(missileImpactVolume)
            .playIf(missileImpactSound != "" && missleImpactPlayback == "indiv")
            .play();
    }

    async getData() {
        //console.log("Getting data...", this);
        game.user.updateTokenTargets([]);
        let missilesNum = Number(this.object.numMissiles) ?? 0;
        Hooks.once('closeMissileDialog', async () => {
            const missileEffects = Sequencer.EffectManager.getEffects({ name: 'missile-target-*' });
            if (missileEffects.length > 0) {
                console.log("ASE Missile effects leftover detected...", missileEffects);
                await Sequencer.EffectManager.endEffects({ name: 'missile-target-*' });
            }
            //console.log('Done clearing target markers...', ...arguments);
            //this.submit();
        });

        return {
            data: this.data,
            numMissiles: missilesNum,
        };

    }
    async _evaluateAttack(caster, target, mod, rollData) {
        //console.log("Evalute attack target: ", target);
        let attackBonus = rollData.bonuses[this.data.actionType]?.attack || '';
        //console.log("Roll Data: ", rollData);
        let attackRoll = await new Roll(`${mod == '' ? 1 : 2}d20${mod} + @mod + @prof + ${attackBonus}`, rollData).evaluate({ async: true });
        //console.log("Attack roll: ", attackRoll);
        let crit = attackRoll.terms[0].total == 20;
        let hit;
        game.dice3d?.showForRoll(attackRoll);
        if (attackRoll.total < target.actor.system.attributes.ac.value) {
            console.log(`${caster.name} missed ${target.name} with roll ${attackRoll.total}${mod == '' ? '' : (mod == 'kh' ? ', with advantage!' : ', with dis-advantage!')}`);
            hit = false;
        }
        else {
            console.log(`${caster.name} hits ${target.name} with roll ${attackRoll.total}${mod == '' ? '' : (mod == 'kh' ? ', with advantage!' : ', with dis-advantage!')}`);
            hit = true;
        }
        this.data.allAttackRolls.push({ roll: attackRoll, target: target.name, hit: hit, crit: crit });
        return { roll: attackRoll, hit: hit, crit: crit };
    }
    async _updateObject(event, formData) {
        //console.log('Event: ', event);
        if (event.target) {
            function addTokenToText(token, damage, numMissiles, missileType, damageFormula, damageType, attacksHit, attacksCrit) {
                //console.log(attacksHit);
                return `<div class="midi-qol-flex-container">
            <div>
            Launched ${numMissiles} ${missileType}(s) at 
            </div>
          <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
          <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
          <div><img src="${token?.document?.texture.src}" height="30" style="border:0px"></div>
          <div><span>${attacksHit.length} ${missileType}(s) hit${attacksCrit > 0 ? ', ' + attacksCrit + ' critical(s)!' : ''}${attacksHit.length ? `, dealing <b>${damageFormula} (${damage}) </b>${damageType} damage` : ''}</span></div>
        </div>`;

            }
            //console.log("Inside update object if statement...");
            let caster = canvas.tokens.get(this.data.caster);
            const casterActor = game.actors.get(caster.document.actorId);
            const item = this.data.item;
            let rollData = item.getRollData();
            const rollMod = rollData.mod;
            let damageBonus = rollData.bonuses[this.data.actionType]?.damage || "";
            const chatMessage = await game.messages.get(this.data.itemCardId);
            //console.log(`${caster.name} is firing Missiles at Selected Targets...`);
            //console.log("Missile Data: ", this.data);

            const missileIntroSound = this.data.effectOptions.missileIntroSound ?? "";
            const missleIntroPlayback = this.data.effectOptions.missileIntroSoundPlayback ?? "indiv";
            let missileIntroSoundDelay = Number(this.data.effectOptions.missileIntroSoundDelay) ?? 0;
            let missileIntroVolume = Number(this.data.effectOptions.missileIntroVolume) ?? 1;

            const impactDelay = Number(this.data.effectOptions.impactDelay) ?? -1000;
            const missileImpactSound = this.data.effectOptions.missileImpactSound ?? "";
            const missleImpactPlayback = this.data.effectOptions.missileImpactSoundPlayback ?? "indiv";
            let missileImpactSoundDelay = Number(this.data.effectOptions.missileImpactSoundDelay) ?? 0;
            let missileImpactVolume = Number(this.data.effectOptions.missileImpactVolume) ?? 1;

            new Sequence("Advanced Spell Effects")
                .sound()
                .file(missileIntroSound)
                .delay(missileIntroSoundDelay)
                .volume(missileIntroVolume)
                .playIf(missileIntroSound != "" && missleIntroPlayback == "group" && this.data.targets.length > 0)
                .sound()
                .file(missileImpactSound)
                .delay(missileImpactSoundDelay)
                .volume(missileImpactVolume)
                .playIf(missileImpactSound != "" && missleImpactPlayback == "group" && this.data.targets.length > 0)
                .play();
            //console.log("Finished set up...");
            for await (let target of this.data.targets) {
                //console.log("Inside target loop...");
                let targetToken = canvas.tokens.get(target.id);
                //console.log("Target: ", targetToken);
                //let missileNum = targetToken.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 0;
                const missileNum = this.data.targets.find(t => t.id == target.id)?.missilesAssigned ?? 0;
                if (missileNum == 0) {
                    return;
                }
                //let damageRoll = await new Roll(`${missileNum*this.data.effectOptions.dmgDieCount}${this.data.effectOptions.dmgDie} +${missileNum*this.data.effectOptions.dmgMod}`).evaluate({ async: true });
                let damageRoll;
                //console.log("Damage Formula: ", damageFormula);
                let attackData = {};
                let attacksHit = [];
                let attacksCrit = 0;
                let damageTotal = 0;
                let damageFormula;
                let missileDelay;
                let totalDamageFormula = {
                    dieCount: 0,
                    mod: 0
                };
                //console.log(`Launching ${missileNum} missiles at ${targetToken.name}...dealing ${damageRoll.total} damage!`);

                for (let i = 0; i < missileNum; i++) {
                    //console.log("Inside missile loop...");
                    if (this.data.effectOptions.missileType == 'dart') {
                        attackData['hit'] = true;
                        missileDelay = utilFunctions.getRandomInt(75, 150);
                    }
                    else {
                        //console.log(this.data.attackMods[targetToken.id][i]);
                        let attackMod = this.data.attackMods[targetToken.id][i]?.type;
                        missileDelay = utilFunctions.getRandomInt(50, 100);
                        //console.log(attackMod);
                        rollData.mod = rollMod;
                        attackData = await this._evaluateAttack(caster, targetToken, attackMod, rollData);
                        if (attackData.crit) {
                            attacksCrit += 1;
                        }
                    }
                    const maxMods = game.settings.get('dnd5e', 'criticalDamageModifiers');
                    const maxBaseDice = game.settings.get('dnd5e', 'criticalDamageMaxDice');

                    let damageDieCount = this.data.effectOptions.dmgDieCount;
                    let baseDamageDie = this.data.effectOptions.dmgDie;
                    let baseDamageDieModified;
                    let damageMod = Number(this.data.effectOptions.dmgMod) ? this.data.effectOptions.dmgMod : 0;

                    //console.log(`Damage Die Count: ${damageDieCount}, Base Damage Die: ${baseDamageDie}, Damage Mod: ${damageMod}`);

                    if (attackData.crit) {
                        if (maxMods) {
                            damageMod *= 2;
                            damageBonus *= 2;
                        }
                        if (maxBaseDice) {
                            baseDamageDieModified = (Number(baseDamageDie.split('d')[1])) * damageDieCount;
                            baseDamageDie = baseDamageDie + '+ ' + baseDamageDieModified;
                        }
                        else {
                            damageDieCount *= 2;
                            // baseDamageDie = `${damageDieCount}${baseDamageDie}`;
                            // console.log(`Damage Die Count: ${damageDieCount}, Base Damage Die: ${baseDamageDie}, Damage Mod: ${damageMod}`);
                        }
                    }

                    damageFormula = `${damageDieCount > 0 ? damageDieCount : ''}${baseDamageDie} ${damageMod ? '+' + damageMod : ''} ${damageBonus ? '+' + damageBonus : ''}`;
                    //console.log(damageFormula);
                    damageRoll = await new Roll(damageFormula).evaluate({ async: true });
                    this.data.allDamRolls.push({ roll: damageRoll, target: targetToken.name });
                    game.dice3d?.showForRoll(damageRoll);
                    attackData['damageRoll'] = damageRoll;
                    //console.log("Adding to hit list...");
                    attacksHit.push(damageRoll);
                    //console.log("Finished roll calculations...");
                    //console.log('Damage Roll: ', damageRoll);

                    //console.log('Missile Type: ', this.data.effectOptions.missileType);

                    if (game.modules.get("midi-qol")?.active) {
                        //console.log(attackData);
                        //console.log("Applying MIDI Damage...");
                        if (attackData.hit) {
                            //console.log(this.data.item);
                            // log all data going into MIDIQOL.DamageOnlyWorkflow
                            let effectOptionsdmgType = this.data.effectOptions.dmgType;
                            let itemCardId = this.data.itemCardId;
                            //copy this.data.item.data to a new object without reference
                            let itemData = JSON.parse(JSON.stringify(this.data.item.data));
                            //new MidiQOL.DamageOnlyWorkflow(caster.actor, caster, damageRoll.total, effectOptionsdmgType, [targetToken], damageRoll, { itemCardId: itemCardId, itemData: itemData });
                            //convert [targetToken] to a set 
                            let targetSet = new Set();
                            let saveSet = new Set();
                            targetSet.add(targetToken);
                            await MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: effectOptionsdmgType }],
                                damageRoll.total,
                                targetSet,
                                this.data.item,
                                saveSet);
                            damageTotal += damageRoll.total;
                            for (let i = 0; i < damageRoll.terms.length; i++) {
                                //console.log("Term: ", damageRoll.terms[i]);
                                if (i == 0) {
                                    totalDamageFormula.dieCount += damageRoll.terms[i].number;
                                }
                                else if (!damageRoll.terms[i].operator) {
                                    totalDamageFormula.mod += damageRoll.terms[i].number;
                                }
                            }
                        }
                        if ((!attackData.hit) && this.data.effectOptions.missileType != 'dart') {
                            attacksHit.pop();
                        }
                    }
                    else {
                        attackData['hit'] = true;
                        damageTotal += damageRoll.total;
                    }
                    //console.log("Launching missile...");
                    await this._launchMissile(caster, targetToken, attackData);
                    await warpgate.wait(missileDelay);
                    //console.log("End of missile loop...");
                }
                //console.log('all attack rolls: ', this.data.allAttackRolls);
                //console.log('all damage rolls: ', this.data.allDamRolls);
                let newDamageFormula = `${totalDamageFormula.dieCount}${this.data.effectOptions.dmgDie} ${Number(totalDamageFormula.mod) ? '+' + totalDamageFormula.mod : ''}`;
                //console.log(attackData);
                if (game.modules.get("midi-qol")?.active) {
                    let chatMessageContent = await duplicate(chatMessage.data.content);
                    let newChatmessageContent = $(chatMessageContent);
                    //console.log(newChatmessageContent);
                    newChatmessageContent.find(".midi-qol-hits-display").append(
                        $(addTokenToText(targetToken, damageTotal, missileNum, this.data.effectOptions.missileType, newDamageFormula, this.data.effectOptions.dmgType, attacksHit, attacksCrit))
                    );
                    //let playerChatCardConetnt = `Launched </b>${missileNum}</b> ${this.data.effectOptions.missileType}(s) at <b>${targetToken.name}</b> dealing <b>${totalDamageFormula.formula} (${damageTotal}) ${this.data.effectOptions.dmgType}</b> damage!`
                    //await ChatMessage.create({content: playerChatCardConetnt, user: game.user.id});
                    await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });


                }
                const targetMarkers = Sequencer.EffectManager.getEffects({ object: targetToken }).filter(effect => effect.data.name?.startsWith(`missile-target`));
                for await (let targetMarker of targetMarkers) {
                    await Sequencer.EffectManager.endEffects({ name: targetMarker.data.name, object: targetToken });
                }
                //console.log("End of target loop...");

            }
            let content = this._buildChatData(this.data.allAttackRolls, this.data.allDamRolls, caster);
            await ChatMessage.create({ content: content, user: game.user.id });
            await ui.chat.scrollBottom();
        }
        $(document.body).off("mouseup", MissileDialog._handleClick);
        await aseSocket.executeAsGM("updateFlag", game.user.id, "missileDialogPos", { left: this.position.left, top: this.position.top });
    }

    activateListeners(html) {
        //console.log(html);
        super.activateListeners(html);
        $(document.body).on("mouseup", this._handleClick.bind(this));
    }
    // list both results in case of adv/dis and strikethrough the one that is not used and underline the one that is used
    // for crtical hits, replace the attack roll with the word "crit"
    // add the breakdown of the attack and damage rolls as a tooltip on the roll results
    _buildChatData(attackRolls, damageRolls, caster) {
        let content = `<table id="missileDialogChatTable"><tr><th>${game.i18n.localize("ASE.Target")}</th><th>${game.i18n.localize("ASE.AttackRoll")}</th><th>${game.i18n.localize("ASE.Damage")}</th>`

        //console.log('Building chat data...');
        //console.log('Attack Rolls: ', attackRolls);
        //console.log('Damage Rolls: ', damageRolls);
        //iterate through attackRolls using for in loop
        if (this.data.effectOptions.missileType == 'dart') {
            //console.log("Magic Missile fired!");
            for (let i = 0; i < damageRolls.length; i++) {
                let currDamageData = damageRolls[i];
                let currTarget = currDamageData.target;
                let currDamageRoll = currDamageData.roll;
                let currDamageBreakdown = currDamageRoll.terms[0].formula + ': ';
                let currDamageValues = currDamageRoll.terms[0].values;
                for (let j = 0; j < currDamageValues.length; j++) {
                    //console.log("Damage Value: ", currDamageValues[j]);
                    currDamageBreakdown += `[${currDamageValues[j]}]`;
                }
                let currExtraDamage = currDamageRoll.formula.split('+')[1];
                currDamageBreakdown += ` ${currExtraDamage ? '+ ' : ''}${currExtraDamage ? currExtraDamage : ''}`;
                content += `<tr><td>${currTarget}</td><td>--</td><td title = '${currDamageBreakdown}'>${currDamageRoll.total}</td></tr>`;
            }
        }
        else {
            for (let i = 0; i < attackRolls.length; i++) {
                //console.log("Attack Roll Data: ", attackRolls[i]);
                //console.log("Damage Roll Data: ", damageRolls[i]);
                let currAttackData = attackRolls[i];
                let currDamageData = damageRolls[i];
                let currTarget = currAttackData.target;
                let currAttackRoll = currAttackData.roll;
                let currDamageRoll = currDamageData.roll;
                let currDamageRollDieTerms = currDamageRoll.terms.filter(term => {
                    return term.values?.length > 0;
                });
                let currDamageRollNumericTerms = currDamageRoll.terms.filter(term => {
                    return (term.number != undefined) && !(term.values?.length > 0);
                });
                //console.log('Damage Roll Die Terms: ', currDamageRollDieTerms);
                //console.log('Damage Roll Numeric Terms: ', currDamageRollNumericTerms);
                let currDamageDieValues = [];
                // concatenate the die terms and numeric terms into a single string
                let currDamageFormula = '';
                let currDamageBreakdown = '';
                for (let j = 0; j < currDamageRollDieTerms.length; j++) {
                    currDamageFormula += currDamageRollDieTerms[j].formula + (j < currDamageRollDieTerms.length - 1 ? ' + ' : '');
                    for (let k = 0; k < currDamageRollDieTerms[j].values.length; k++) {
                        currDamageBreakdown += '[' + (currDamageRollDieTerms[j].values[k]) + ']' + (k < currDamageRollDieTerms[j].values.length - 1 ? ' + ' : '');
                    }
                }
                currDamageFormula += ': ';

                for (let j = 0; j < currDamageRollNumericTerms.length; j++) {
                    currDamageBreakdown += ((j == 0) && currDamageRollDieTerms.length > 0 ? ' + ' : '') + currDamageRollNumericTerms[j].number + (j < currDamageRollNumericTerms.length - 1 ? ' + ' : '');
                }
                currDamageBreakdown = currDamageFormula + currDamageBreakdown;
                //console.log("Damage Breakdown: ", currDamageBreakdown);
                //let currDamageBreakdown = currDamageRollDieTerms[0].formula + ': ';
                //console.log("Damage Breakdown: ", currDamageBreakdown);
                //let currDamageValues = currDamageRoll.terms[0].values ?? currDamageRoll.terms[0].number;
                /*for (let j = 0; j < currDamageValues.length; j++) {
                    //console.log("Damage Value: ", currDamageValues[j]);
                    currDamageBreakdown += `[${currDamageValues[j]}]`;
                }*/
                //let currExtraDamage = currDamageRoll.formula.split('+')[1];
                //console.log("Extra Damage: ", currExtraDamage);
                //currDamageBreakdown += ` ${currExtraDamage ? '+ ' : ''}${currExtraDamage ? currExtraDamage : ''}`;

                let currAttackRollResult = currAttackRoll.result.split("+");
                let currAttackBreakDown = '[';

                if (currAttackData.crit) {
                    currAttackRoll._total = "Critical!";
                }
                if (currAttackRoll.formula.includes("kh")) {
                    let lowerRoll = Math.min(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
                    let higherRoll = Math.max(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
                    currAttackRollResult[0] = `Adv: ${lowerRoll}, ${higherRoll} `;
                }
                else if (currAttackRoll.formula.includes("kl")) {
                    let lowerRoll = Math.min(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
                    let higherRoll = Math.max(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
                    currAttackRollResult[0] = `Dis: ${lowerRoll}, ${higherRoll} `;
                }
                for (let j = 0; j < currAttackRollResult.length; j++) {
                    currAttackBreakDown += `${j == 0 ? currAttackRollResult[j] + ']' : ' + ' + currAttackRollResult[j]}`;
                }
                //console.log("Attack Roll Result: ", currAttackRollResult);

                //console.log("Damage Roll: ", damageRoll);
                content += `<tr><td>${currTarget}</td><td title = '${currAttackBreakDown}'>${currAttackRoll._total}</td><td title = '${currDamageBreakdown}'>${currDamageRoll.total}</td></tr>`;
            }
        }
        return content;
    }

}
export default MissileDialog;