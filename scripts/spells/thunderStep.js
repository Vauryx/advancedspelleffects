import * as utilFunctions from "../utilityFunctions.js";
import { aseSocket } from "../aseSockets.js";

export class thunderStep {

    static registerHooks() {
        return;
    }

    //CONTRIBUTED BY WASP----
    static async doTeleport(midiData) {
        let actorD = midiData.actor;
        const tokenD = canvas.tokens.get(midiData.tokenId);
        const itemD = actorD.items.getName(midiData.item.name);
        const chatMessage = await game.messages.get(midiData.itemCardId);
        const spellLevel = midiData.itemLevel ? Number(midiData.itemLevel) : 3;
        const spellSaveDC = actorD.system.attributes.spelldc;

        const effectOptions = itemD.getFlag('advancedspelleffects', 'effectOptions') ?? {};
        const teleportSound = effectOptions.teleportSound ?? "";
        const teleportSoundDelay = Number(effectOptions.teleportSoundDelay) ?? 0;
        const teleportVolume = effectOptions.teleportVolume ?? 1;
        const reappearSound = effectOptions.reappearSound ?? "";
        const reappearSoundDelay = Number(effectOptions.reappearSoundDelay) ?? 0;
        const reappearVolume = effectOptions.reappearVolume ?? 1;

        const teleport_range = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
            t: "circle",
            user: game.userId,
            x: tokenD.x + canvas.grid.size / 2,
            y: tokenD.y + canvas.grid.size / 2,
            direction: 0,
            distance: 92.5,
            fillColor: game.user.color
        }]);

        const damage_range = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
            t: "circle",
            user: game.userId,
            x: tokenD.x + canvas.grid.size / 2,
            y: tokenD.y + canvas.grid.size / 2,
            direction: 0,
            distance: 12.5,
            fillColor: "#FF0000"
        }]);

        const passengers = [];
        if (midiData.targets.length) {
            let passenger = await canvas.tokens.get(midiData.targets[0]._id);
            if (passenger) passengers.push(passenger);
        } else {
            let potentialPassengers = canvas.tokens.placeables.filter(function (target) {
                return canvas.grid.measureDistance(tokenD, target) <= 7.5 && target.data.disposition === tokenD.data.disposition && target !== tokenD;
            });

            let passenger = potentialPassengers.length ? await new Promise((resolve) => {

                const content = [`${game.i18n.localize("ASE.ThunderStepPassengerPrompt")}<br><br><select style='width:100%'>`];
                content.push(`<option passenger_id="noone">${game.i18n.localize("ASE.NoOne")}</option>`)
                potentialPassengers.forEach(passenger => {
                    content.push(`<option passenger_id="${passenger.id}">${passenger.name}</option>`)
                })
                content.push("</select><br>");

                let dismissed = true;
                new Dialog({
                    title: game.i18n.localize("ASE.ThunderStep"),
                    content: content,
                    buttons: {
                        one: {
                            icon: `<i class="fas fa-check"></i>`,
                            label: game.i18n.localize("ASE.Done"),
                            callback: (html) => {
                                const tokenId = html.find("select").find(':selected').attr('passenger_id');
                                dismissed = false;
                                resolve(tokenId);
                            }
                        }
                    },
                    default: game.i18n.localize("ASE.Cancel"),
                    close: () => {
                        if (dismissed) {
                            resolve("cancel");
                        }
                    }
                }).render(true);
            }) : "noone";

            if (passenger === "cancel") {
                teleport_range[0].delete();
                damage_range[0].delete();
                return;
            }

            if (passenger !== "noone") {
                passengers.push(potentialPassengers.find(t => t.id === passenger));
            }
        }

        passengers.push(tokenD);

        const displayCrosshairs = async (crosshairs) => {
            new Sequence("Advanced Spell Effects")
                .effect()
                .from(tokenD)
                .attachTo(crosshairs)
                .persist()
                .loopProperty("sprite", "rotation", { duration: 10000, from: 0, to: 360 })
                .opacity(0.5)
                .play()

        };
        let crosshairsConfig = {
            size: 1,
            label: game.i18n.localize("ASE.ThunderStep"),
            tag: 'thunder-step-crosshairs',
            drawIcon: false,
            drawOutline: false,
            interval: 2
        };

        let position = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });

        teleport_range[0].delete();

        let targets = canvas.tokens.placeables.filter(function (target) {
            return target?.actor?.data?.data?.attributes?.hp?.value > 0
                && canvas.grid.measureDistance(tokenD, target) <= 12.5
                && passengers.indexOf(target) === -1;
        });

        new Sequence("Advanced Spell Effects")
            .sound()
            .file(teleportSound)
            .volume(teleportVolume)
            .delay(teleportSoundDelay)
            .playIf(teleportSound !== "")
            .effect()
            .file("jb2a.shatter.blue")
            .atLocation(tokenD, { cacheLocation: true })
            .scale(1.25)
            .effect()
            .file("jb2a.impact.ground_crack.01.blue")
            .atLocation(tokenD, { cacheLocation: true })
            .belowTokens()
            .delay(1400)
            .wait(1300)
            .thenDo(async () => {

                if (targets.length) {
                    if (game.modules.get("midi-qol")?.active) {
                        let chatMessageContent = await duplicate(chatMessage.data.content);

                        let targetTokens = new Set();
                        let saves = new Set();

                        let newChatmessageContent = $(chatMessageContent);

                        newChatmessageContent.find(".midi-qol-saves-display").empty();
                        let damage = await new Roll(`${spellLevel}d10`).evaluate({ async: true });
                        for await (let targetToken of targets) {

                            let saveRoll = await new Roll("1d20+@mod", { mod: targetToken.actor.system.abilities.con.save }).evaluate({ async: true });
                            let save = saveRoll.total;
                            targetTokens.add(targetToken)
                            if (save >= spellSaveDC) {
                                saves.add(targetToken)
                            }
                            console.log("Adding token to chat card...");
                            newChatmessageContent.find(".midi-qol-saves-display").append(
                                $(addTokenToText(targetToken, save, spellSaveDC, damage))
                            );

                        }

                        await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });

                        await ui.chat.scrollBottom();

                        MidiQOL.applyTokenDamage(
                            [{ damage: damage.total, type: "thunder" }],
                            damage.total,
                            targetTokens,
                            itemD,
                            saves
                        )
                    }
                }

                for await (let passenger of passengers) {
                    const updateData = {
                        x: position.x - (canvas.grid.size / 2) + passenger.center.x - tokenD.center.x,
                        y: position.y - (canvas.grid.size / 2) + passenger.center.y - tokenD.center.y
                    };
                    await aseSocket.executeAsGM("updateDocument", passenger.id, updateData);
                }

            }, true)
            .wait(250)
            .sound()
            .file(reappearSound)
            .volume(reappearVolume)
            .delay(reappearSoundDelay)
            .playIf(reappearSound !== "")
            .effect()
            .baseFolder("modules/jb2a_patreon/Library/Generic/Impact")
            .file("Impact_01_Regular_Blue_400x400.webm")
            .atLocation(tokenD)
            .scale(1.75)
            .wait(50)
            .thenDo(async () => {
                damage_range[0].delete();
            }, true)
            .play();


        function addTokenToText(token, roll, dc, damageRoll) {
            console.log(damageRoll);
            let saveResult = roll >= dc ? true : false;

            return `<div class="midi-qol-flex-container">
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
      <div>
      ${saveResult ? game.i18n.format("ASE.SavePassMessage", { saveTotal: roll, damageTotal: Math.floor(damageRoll.total / 2) }) : game.i18n.format("ASE.SaveFailMessage", { saveTotal: roll, damageTotal: damageRoll.total })}
      </div>
      <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
    </div>`;

        }

    }
    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};
        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        soundOptions.push({
            label: game.i18n.localize("ASE.TeleportSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.teleportSound',
            flagName: 'teleportSound',
            flagValue: currFlags?.teleportSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.TeleportSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.teleportSoundDelay',
            flagName: 'teleportSoundDelay',
            flagValue: currFlags?.teleportSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.TeleportVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.teleportVolume',
            flagName: 'teleportVolume',
            flagValue: currFlags?.teleportVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });

        soundOptions.push({
            label: game.i18n.localize("ASE.ReappearSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.reappearSound',
            flagName: 'reappearSound',
            flagValue: currFlags?.reappearSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ReappearSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.reappearSoundDelay',
            flagName: 'reappearSoundDelay',
            flagValue: currFlags?.reappearSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.ReappearVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.reappearVolume',
            flagName: 'reappearVolume',
            flagValue: currFlags?.reappearVolume ?? 1,
            min: 0,
            max: 1,
            step: 0.01,
        });
        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions
        }

    }
}