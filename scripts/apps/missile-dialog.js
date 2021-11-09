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

    static async _clearTargets() {
        let tokens = Array.from(canvas.tokens.placeables);
        //console.log("ASE Magic Missile Targets Detected...", tokens);
        for (let target of tokens) {
            //console.log('Target: ',target);
            let effectsOnTarget = await Sequencer.EffectManager.getEffects({ object: target }).filter((e) => {
                //console.log('e data name',e.data.name);
                return e.data.name.startsWith("missile-target-")
            }).forEach(async (e) => {
                console.log('Cleaning up leftover ASE Missile Effects...', e);
                await Sequencer.EffectManager.endEffects({ object: target, name: e.data.name });
            })
            await target?.document.unsetFlag("advancedspelleffects", 'missileSpell');
        }
    }

    static async registerHooks() {
        console.log('Clearing ASE Magic Missile Targets...');
        Hooks.on("sequencerEffectManagerReady", MissileDialog._clearTargets);
        return;
    }

    static get defaultOptions() {
        //console.log(this);
        return mergeObject(super.defaultOptions, {
            template: './modules/advancedspelleffects/scripts/templates/missile-dialog.html',
            id: 'missile-dialog',
            title: `Select Targets`,
            resizable: true,
            width: "auto",
            height: "auto",
            left: game.user?.getFlag("advancedspelleffects", "missileDialogPos.left") ?? "auto",
            top: game.user?.getFlag("advancedspelleffects", "missileDialogPos.top") ?? "auto",
            submitOnClose: true,
            close: () => { ui.notify }
        });
    }

    async _applyMarker(target, type) {
        //console.log('type: ',type);
        let markerAnim = `${this.data.effectOptions.targetMarkerType}.${this.data.effectOptions.targetMarkerColor}`;
        const markerSound = this.data.effectOptions.markerSound ?? "";
        const markerSoundDelay = Number(this.data.effectOptions.markerSoundDelay) ?? 0;
        const markerSoundVolume = Number(this.data.effectOptions.markerVolume) ?? 1;

        let baseScale = this.data.effectOptions.baseScale;
        let currMissile = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 0;
        //console.log("Current missile number: ", currMissile);
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
            .attachTo(target)
            .persist()
            .file(markerAnim)
            .scale(0.01)
            .name(`missile-target-${target.id}-${currMissile}`)
            .offset(offset)
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
        await target.document.setFlag("advancedspelleffects", "missileSpell.missileNum", currMissile + 1);
        //console.log("Total Missiles assigned: ", currMissile + 1);
        let inTargetList = this.data.targets.find(t => t.id == target.id);
        if (!inTargetList) {
            this.data.targets.push({ id: target.id });
        }
    }

    async _handleClick(event) {

        let parsedEventData = {
            altKey: event.originalEvent.altKey,
            ctrlKey: event.originalEvent.ctrlKey,
            button: event.originalEvent.button,
            x: event.originalEvent.x,
            y: event.originalEvent.y
        }
        //set attacktype to 1 if altkey and -1 if ctrlkey, 0 by default
        let attackType = parsedEventData.altKey ? 'kh' : (parsedEventData.ctrlKey ? 'kl' : '');
        //console.log('Mouse Click Data: ', parsedEventData);
        let token = canvas.tokens.placeables.filter(token => {
            return token.getGlobalPosition().x <= parsedEventData.x
                && token.getGlobalPosition().x + token.width >= parsedEventData.x
                && token.getGlobalPosition().y <= parsedEventData.y
                && token.getGlobalPosition().y + token.height >= parsedEventData.y;
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
                    document.getElementById("txtNumMissilesId").value--;
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
        let missilesAssigned = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 1;
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
            $("#missile-dialog").height("auto");

        }
        else {
            document.getElementById(`${target.document.id}-missiles`).value++;
        }

    }

    async _removeMarker(target) {
        let missilesAssigned = Number(target.document.getFlag("advancedspelleffects", "missileSpell.missileNum")) ?? 0;
        //console.log("Removing assigned missile...", missilesAssigned);
        await Sequencer.EffectManager.endEffects({ name: `missile-target-${target.id}-${missilesAssigned - 1}` });
        if (missilesAssigned > 0) {
            await target.document.setFlag("advancedspelleffects", "missileSpell.missileNum", missilesAssigned - 1);
        }
        //console.log("Total missiles assigned: ", missilesAssigned - 1);
    }

    async _removeMissile(e) {

        let target = e.currentTarget ? canvas.tokens.get(e.currentTarget.id.split('-')[0]) : e;
        //console.log("Target: ", target);
        if (target) {
            let missilesAssigned = target.document.getFlag("advancedspelleffects", "missileSpell.missileNum");
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

        let missileIntroSoundDelay = Number(this.data.effectOptions.missileIntroSoundDelay) ?? 0;
        let missileIntroVolume = Number(this.data.effectOptions.missileIntroVolume) ?? 1;
        const impactDelay = Number(this.data.effectOptions.impactDelay) ?? -1000;

        const missileImpactSound = this.data.effectOptions.missileImpactSound ?? "";
        let missileImpactSoundDelay = Number(this.data.effectOptions.missileImpactSoundDelay) ?? 0;
        let missileImpactVolume = Number(this.data.effectOptions.missileImpactVolume) ?? 1;

        //console.log(target);
        new Sequence("Advanced Spell Effects")
            .sound()
            .file(missileIntroSound)
            .delay(missileIntroSoundDelay)
            .volume(missileIntroVolume)
            .playIf(missileIntroSound != "")
            .effect()
            .file(missileAnim)
            .atLocation(caster)
            .JB2A()
            .randomizeMirrorY()
            .missed(!hit)
            .reachTowards(target)
            .randomOffset(0.65)
            //.playbackRate(utilFunctions.getRandomNumber(0.7, 1.3))
            .waitUntilFinished(impactDelay)
            .sound()
            .file(missileImpactSound)
            .delay(missileImpactSoundDelay)
            .volume(missileImpactVolume)
            .playIf(missileImpactSound != "")
            .play();
    }

    async getData() {
        game.user.updateTokenTargets([]);
        Hooks.once('closeMissileDialog', async () => {
            let tokens = Array.from(canvas.tokens.placeables).filter(t => t.data.flags.advancedspelleffects && t.data.flags.advancedspelleffects.missileSpell);
            for (let target of tokens) {
                await Sequencer.EffectManager.getEffects({ object: target }).filter(async (e) => {
                    e.data.name.startsWith("missile-target-")
                }).forEach(async (e) => {
                    await Sequencer.EffectManager.endEffects({ object: target, name: e.data.name })
                });
                await target?.document.unsetFlag("advancedspelleffects", 'missileSpell');
            }
            //console.log('Done clearing target markers...', ...arguments);
            //this.submit();
        });

        return {
            data: this.data
        };

    }
    async _evaluateAttack(caster, target, mod, rollData) {
        //console.log("Evalute attack target: ", target);
        let attackBonus = rollData.bonuses[actionType]?.attack || ''
        let attackRoll = await new Roll(`${mod == '' ? 1 : 2}d20${mod} + @mod + @prof + ${attackBonus}`, rollData).evaluate({ async: true });
        //console.log("Attack roll: ", attackRoll);
        let crit = attackRoll.terms[0].total == 20;
        let hit;
        game.dice3d?.showForRoll(attackRoll);
        if (attackRoll.total < target.actor.data.data.attributes.ac.value) {
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
        //console.log(event);
        if (event.target) {
            function addTokenToText(token, damage, numMissiles, missileType, damageFormula, damageType, attacksHit, attacksCrit) {
                //console.log(attacksHit);
                return `<div class="midi-qol-flex-container">
            <div>
            Launched ${numMissiles} ${missileType}(s) at 
            </div>
          <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
          <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
          <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
          <div><span>${attacksHit.length} ${missileType}(s) hit${attacksCrit > 0 ? ', ' + attacksCrit + ' critical(s)!' : ''}${attacksHit.length ? `, dealing <b>${damageFormula} (${damage}) </b>${damageType} damage` : ''}</span></div>
        </div>`;

            }

            //console.log(this);
            //console.log('Attack Mods Info: ', this.data.attackMods);
            let caster = canvas.tokens.get(this.data.caster);
            let rollData = caster.actor.getRollData();
            let damageBonus = rollData.bonuses[actionType]?.damage || "";
            const chatMessage = await game.messages.get(this.data.itemCardId);
            //console.log(`${caster.name} is firing Missiles at Selected Targets...`);
            //console.log("Missile Data: ", this.data);
            for (let target of this.data.targets) {
                let targetToken = canvas.tokens.get(target.id);
                //console.log("Target: ", targetToken);
                let missileNum = targetToken.document.getFlag("advancedspelleffects", "missileSpell.missileNum") ?? 0;
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
                    if (this.data.effectOptions.missileType == 'dart') {
                        attackData['hit'] = true;
                        missileDelay = utilFunctions.getRandomInt(75, 150);
                    }
                    else {
                        let attackMod = this.data.attackMods[targetToken.id][i].type;
                        missileDelay = utilFunctions.getRandomInt(50, 100);
                        //console.log(attackMod);
                        attackData = await this._evaluateAttack(caster, targetToken, attackMod, rollData);
                        if (attackData.crit) {
                            attacksCrit += 1;
                        }
                    }
                    
                    damageFormula = `${attackData.crit ? this.data.effectOptions.dmgDieCount * 2 : this.data.effectOptions.dmgDieCount}${this.data.effectOptions.dmgDie} ${Number(this.data.effectOptions.dmgMod) ? '+' + this.data.effectOptions.dmgMod : '' } + ${damageBonus}`;
                    //console.log(damageFormula);
                    damageRoll = await new Roll(damageFormula).evaluate({ async: true });
                    this.data.allDamRolls.push({ roll: damageRoll, target: targetToken.name });
                    game.dice3d?.showForRoll(damageRoll);
                    attackData['damageRoll'] = damageRoll;
                    //console.log("Adding to hit list...");
                    attacksHit.push(damageRoll);

                    //console.log('Damage Roll: ', damageRoll);

                    //console.log('Missile Type: ', this.data.effectOptions.missileType);
                    if (game.modules.get("midi-qol")?.active) {
                        //console.log(attackData);
                        if (attackData.hit) {
                            new MidiQOL.DamageOnlyWorkflow(caster.actor, caster.document, damageRoll.total, this.data.effectOptions.dmgType, [targetToken], damageRoll, { itemCardId: this.data.item });
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
                            //remove pushed attack from attacksHit
                            //console.log("Attack missed! Removing from hit list...");
                            attacksHit.pop();
                        }
                    }
                    else {
                        attackData['hit'] = true;
                        damageTotal += damageRoll.total;
                    }

                    await this._launchMissile(caster, targetToken, attackData);
                    await warpgate.wait(missileDelay);
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
                    await ui.chat.scrollBottom();

                }

                await Sequencer.EffectManager.endEffects({ object: targetToken });
                await targetToken.document.unsetFlag("advancedspelleffects", 'missileSpell');
            }
            let content = this._buildChatData(this.data.allAttackRolls, this.data.allDamRolls, caster);
            await ChatMessage.create({ content: content, user: game.user.id })
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
        let content = `<table id="missileDialogChatTable"><tr><th>Target</th><th>Attack Roll</th><th>Damage</th>`

        console.log('Building chat data...');
        console.log('Attack Rolls: ', attackRolls);
        console.log('Damage Rolls: ', damageRolls);
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
                let currDamageBreakdown = currDamageRoll.terms[0].formula + ': ';
                let currDamageValues = currDamageRoll.terms[0].values;
                for (let j = 0; j < currDamageValues.length; j++) {
                    //console.log("Damage Value: ", currDamageValues[j]);
                    currDamageBreakdown += `[${currDamageValues[j]}]`;
                }
                let currExtraDamage = currDamageRoll.formula.split('+')[1];
                currDamageBreakdown += ` ${currExtraDamage ? '+ ' : ''}${currExtraDamage ? currExtraDamage : ''}`;

                let currAttackRollResult = currAttackRoll.result.split("+");
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
                currAttackRollResult = `[ ${currAttackRollResult[0]}] + ${currAttackRollResult[1]} + ${currAttackRollResult[2]}`;
                //console.log("Attack Roll Result: ", currAttackRollResult);
                //console.log("Damage Breakdown: ", currDamageBreakdown);
                //console.log("Damage Roll: ", damageRoll);
                content += `<tr><td>${currTarget}</td><td title = '${currAttackRollResult}'>${currAttackRoll._total}</td><td title = '${currDamageBreakdown}'>${currDamageRoll.total}</td></tr>`;
            }
        }
        return content;
    }

}
export default MissileDialog;