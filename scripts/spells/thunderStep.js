import * as utilFunctions from "../utilityFunctions.js";

export class thunderStep{

    static registerHooks(){
        return;
    }

    //CONTRIBUTED BY WASP----
    static async doTeleport(midiData) {

        let actorD = midiData.actor;
        const tokenD = canvas.tokens.get(midiData.tokenId);
        const itemD = actorD.items.getName(midiData.item.name);
        const chatMessage = await game.messages.get(midiData.itemCardId);
        const spellLevel = midiData.itemLevel ? Number(midiData.itemLevel) : 3;
        const spellSaveDC = actorD.data.data.attributes.spelldc;
        
        let teleport_range = await MeasuredTemplate.create({
            t: "circle",
            user: game.userId,
            x: tokenD.x + canvas.grid.size / 2,
            y: tokenD.y + canvas.grid.size / 2,
            direction: 0,
            distance: 92.5,
            fillColor: game.user.color,
            flags: {
                world: {
                    thunderstep: {
                        ActorId: actorD.id
                    }
                }
            }
        });
        
        let damage_range = await MeasuredTemplate.create({
            t: "circle",
            user: game.userId,
            x: tokenD.x + canvas.grid.size / 2,
            y: tokenD.y + canvas.grid.size / 2,
            direction: 0,
            distance: 12.5,
            fillColor: "#FF0000",
            flags: {
                world: {
                    thunderstep: {
                        ActorId: actorD.id
                    }
                }
            }
        });
        
        const passengers = [];
        let midiTargets = Array.from(midiData.targets);
        console.log(midiTargets);
        if(midiTargets.length){
            let passenger = await canvas.tokens.get(midiTargets[0].id);
            if(passenger) passengers.push(passenger);
        }else{
            let potentialPassengers = canvas.tokens.placeables.filter(function(target){
                return utilFunctions.measureDistance({ x: tokenD.data.x + (canvas.grid.size / 2), y: tokenD.data.y + (canvas.grid.size / 2) }, { x: target.data.x + (canvas.grid.size / 2), y: target.data.y + (canvas.grid.size / 2) }) <= 5 && target.data.disposition === tokenD.data.disposition && target !== tokenD;
            });
        
            let passenger = await new Promise((resolve) => {
        
                const content = ["Select a friend to bring with you! Warning, you <strong>will</strong> damage everyone in the red circle!<br><br><select style='width:100%'>"];
                potentialPassengers.forEach(passenger => {
                    content.push(`<option passenger_id="${passenger.id}">${passenger.name}</option>`)
                })
                content.push("</select><br>");
        
                let dismissed = true;
                new Dialog({
                    title: "Thunder Step",
                    content: content,
                    buttons: {
                        one: {
                            icon: `<i class="fas fa-check"></i>`,
                            label: "Done",
                            callback: (html) => {
                                const tokenId = html.find("select").find(':selected').attr('passenger_id');
                                dismissed = false;
                                resolve(potentialPassengers.find(t => t.id === tokenId));
                            }
                        }
                    },
                    default: "Cancel",
                    close: (html) => {
                        if(dismissed){
                            resolve(false);
                        }
                    }
                }).render(true);
            });
        
            if(!passenger){
                teleport_range[0].delete();
                damage_range[0].delete();
                return;
            }
        
            passengers.push(passenger);
        }
        
        passengers.push(tokenD);
        
        let position = await warpgate.crosshairs.show();
        
        teleport_range[0].delete();
        
        let targets = canvas.tokens.placeables.filter(function(target){
            return target?.actor?.data?.data?.attributes?.hp?.value > 0
                && canvas.grid.measureDistance(tokenD, target) <= 12.5
                && passengers.indexOf(target) === -1;
        });
        
        
        new Sequence()
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
        
                if(targets.length){
        
                    const chatMessage = await game.messages.get(midiData.itemCardId);
                    let chatMessageContent = await duplicate(chatMessage.data.content);
        
                    let damage = new Roll(`${spellLevel}d10`).roll();
        
                    damage.toMessage();
        
                    let targetTokens = new Set();
                    let saves = new Set();
        
                    let newChatmessageContent = $(chatMessageContent);
        
                    newChatmessageContent.find(".midi-qol-saves-display").empty();
        
                    for(let targetToken of targets){
        
                        let save = new Roll("1d20+@mod", {mod: targetToken.actor.data.data.abilities.con.save}).roll().total;
        
                        targetTokens.add(targetToken)
                        if(save >= spellSaveDC){
                            saves.add(targetToken)
                        }
        
                        newChatmessageContent.find(".midi-qol-saves-display").append(
                            $(addTokenToText(targetToken, save, spellSaveDC))
                        );
        
                    }
        
                    await chatMessage.update({ content: newChatmessageContent.prop('outerHTML') });
        
                    await ui.chat.scrollBottom();
        
                    MidiQOL.applyTokenDamage(
                        [{ damage: damage.total, type: "lightning" }],
                        damage.total,
                        targetTokens,
                        itemD,
                        saves
                    )
                }
        
                for(let passenger of passengers){
                    await passenger.document.update({
                        x: position.x - (canvas.grid.size / 2) + passenger.center.x - tokenD.center.x,
                        y: position.y - (canvas.grid.size / 2) + passenger.center.y - tokenD.center.y,
                        hidden: true
                    }, {animate: false});
                }
        
            }, true)
            .wait(250)
            .effect()
                .baseFolder("modules/jb2a_patreon/Library/Generic/Impact")
                .file("Impact_01_Regular_Blue_400x400.webm")
                .atLocation(tokenD)
                .JB2A()
                .scale(1.75)
            .wait(50)
            .thenDo(async () => {
                damage_range[0].delete();
                for(let passenger of passengers){
                    await passenger.document.update({
                        hidden: false
                    }, {animate: false});
                }
            }, true)
            .play();
        
        
        function addTokenToText(token, roll, dc){
        
            return `<div class="midi-qol-flex-container">
              <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> ${token.name}</div>
              <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> ${token.name}</div>
              <div>
                 ${roll >= dc ? "succeeds" : "fails"} with 
                ${roll}
                
              </div>
              <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
            </div>`;
        
        }
    }
}
