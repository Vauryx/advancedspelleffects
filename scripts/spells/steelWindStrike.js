import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class steelWindStrike{

    static registerHooks(){
        return;
    }

    static async doStrike(midiData) {
        let item = midiData.item;
        let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
        let weapon = aseFlags.weapon ?? 'sword';
        let weaponColor = aseFlags.weaponColor ?? 'blue';
        function easeOutElasticCustom(x) {
            const c4 = (2 * Math.PI) / 10;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -12 * x) * Math.sin((x * 12 - 0.75) * c4) + 1;
        }
        Sequencer.registerEase("easeOutElasticCustom", easeOutElasticCustom);
        let caster = canvas.tokens.get(midiData.tokenId);
        let targets = Array.from(game.user.targets);
        let rollDataForDisplay = [];
        let dagger = "";
        if (weapon == "dagger") dagger = ".02"
    
        let swordAnim;
        let gustAnim = "jb2a.gust_of_wind.veryfast";
        let validSwingTypes = [0, 2, 4];
    
        let animStartTimeMap = {
            0: 750,
            1: 500,
            2: 850,
            3: 850,
            4: 1000,
            5: 500
        };
        let animEndTimeMap = {
            0: 1250,
            1: 1250,
            2: 2000,
            3: 1250,
            4: 1700,
            5: 1250
        };
        let weaponsPathMap = {
            "sword": "melee.01",
            "mace": "melee",
            "greataxe": "melee",
            "greatsword": "melee",
            "handaxe": "melee",
            "spear": "melee.01"
        };
        let currentAutoRotateState = caster.getFlag("autorotate", "enabled") ?? false;
        if(currentAutoRotateState){
            await caster.setFlag("autorotate", "enabled", false);
        }
        //console.log ("Auto Rotate Flag status: ",caster.document.getFlag("autorotate", "enabled"));
        await steelWindStrike(caster, targets);
    
        async function evaluateAttack(target) {
            //console.log("Evalute attack target: ", target);
            let attackRoll = new Roll(`1d20 + @mod + @prof`, caster.actor.getRollData()).roll();
            // game.dice3d?.showForRoll(attackRoll);
            if (attackRoll.total < target.actor.data.data.attributes.ac.value) {
                onMiss(target, attackRoll);
            }
            else {
                onHit(target, attackRoll);
            }
        }
    
        async function onHit(target, attackRoll) {
            //console.log('Attack hit!');
            //console.log("Attack roll: ", attackRoll);
            let currentRoll = new Roll('6d10', caster.actor.getRollData()).roll();
            //console.log("Current damage dice roll total: ", currentRoll.total);
            //game.dice3d?.showForRoll(currentRoll);
            let damageData = new MidiQOL.DamageOnlyWorkflow(midiData.actor, midiData.tokenId, currentRoll.total, "force", [target], currentRoll, { flavor: 'Steel Wind Strike - Damage Roll (6d10 force)', itemCardId: midiData.itemCardId });
            //console.log("damage data: ", damageData);
            rollDataForDisplay.push({
                "target": target.name,
                "attackroll": attackRoll.total,
                "hit": true,
                "damageroll": currentRoll.total
            })
        }
        async function onMiss(target, attackRoll) {
            //console.log('Missed attack...');
            //console.log("Attack roll: ", attackRoll);
            rollDataForDisplay.push({
                "target": target.name,
                "attackroll": attackRoll.total,
                "hit": false,
                "damageroll": 0
            })
            //let currentRoll = new Roll(`${damageDie}`, caster.actor.getRollData()).roll({ async: false });
            //game.dice3d?.showForRoll(currentRoll);
            //new MidiQOL.DamageOnlyWorkflow(midiDataactor, midiDatatokenId, currentRoll.total, "bludgeoning", [target], currentRoll, { flavor: `Flurry of Blows - Damage Roll (${damageDie} Bludgeoning)`, itemCardId: midiDataitemCardId });
        }
    
        async function finalTeleport(caster, location) {
            console.log("template: ", location);
            let startLocation = { x: caster.x, y: caster.y };
            //let adjustedLocation = { x: location.x - (canvas.grid.size / 2), y: location.y - (canvas.grid.size / 2) }
            let distance = Math.sqrt(Math.pow((location.x - caster.x), 2) + Math.pow((location.y - caster.y), 2));
    
            let steelWindSequence = new Sequence("Advanced Spell Effects")
                .animation()
                .on(caster)
                .rotateTowards(location)
                .animation()
                .on(caster)
                .snapToGrid()
                .moveTowards(location, { ease: "easeOutElasticCustom" })
                .moveSpeed(distance / 60)
                .duration(800)
                .waitUntilFinished(-750)
                .effect()
                .atLocation(startLocation)
                .JB2A()
                .file(gustAnim)
                .reachTowards(location)
                .opacity(0.8)
                .fadeOut(250)
                .belowTokens()
                .waitUntilFinished()
                .thenDo(async () => {
                    await caster.document.setFlag("autorotate", "enabled", currentAutoRotateState);
                })
            await steelWindSequence.play();
        }
        //FREE POSITION CODE TAKEN FROM WARPGATE MODULE
        //Permission for free re-use was granted by Matthew Haentschke
        function getFreePosition(origin) {
            const center = canvas.grid.getCenter(origin.x, origin.y)
            origin = { x: center[0], y: center[1] };
            const positions = generatePositions(origin);
            //console.log("Generated Positions: ",positions);
            for (let position of positions) {
                //console.log(`Checking if position {${position.x}, ${position.y}} is free...`);
                if (isFree(position)) {
                    return position;
                }
            }
    
        }
        function generatePositions(origin) {
            let positions = [canvas.grid.getSnappedPosition(origin.x - 1, origin.y - 1)];
            for (let r = canvas.scene.dimensions.size; r < canvas.scene.dimensions.size * 2; r += canvas.scene.dimensions.size) {
    
                for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / (4 * r / canvas.scene.dimensions.size)) {
                    const newPos = canvas.grid.getTopLeft(origin.x + r * Math.cos(theta), origin.y + r * Math.sin(theta))
                    positions.push({ x: newPos[0], y: newPos[1] });
                }
            }
            return positions;
        }
        function isFree(position) {
            for (let token of canvas.tokens.placeables) {
                const hitBox = new PIXI.Rectangle(token.x, token.y, token.w, token.h);
                //console.log(`Checking hitbox for ${token.name}`, hitBox);
                if (hitBox.contains(position.x, position.y)) {
                    //console.log("Not free...Checking next position");
                    return false;
                }
            }
            //console.log("Free!");
            return true;
        }
        //---------------------------------------------------------------------------
        async function steelWindStrike(caster, targets) {
            let currentX;
            let targetX;
            let currentY;
            let targetY;
            let distance;
            let swingType;
            let swingStartDelay = -600;
            //console.log(targets);
            for (let i = 0; i < targets.length; i++) {
                if (i == targets.length - 1) {
                    swingType = 5;
                    swingStartDelay = -250;
                }
                else {
                    swingType = validSwingTypes[utilFunctions.getRandomInt(0, 2)];
                }
                swordAnim = `jb2a.${weapon}.${weaponsPathMap[weapon]}.${weaponColor}.${swingType}`;
                //console.log(targets[i]);
                let target = targets[i];
                evaluateAttack(target);
                //debugger;
                const openPosition = getFreePosition({ x: target.x, y: target.y });
                let rotateAngle = new Ray(openPosition, target).angle * (180 / Math.PI);
                currentX = caster.x;
                targetX = openPosition.x;
                currentY = caster.y;
                targetY = openPosition.y;
                distance = Math.sqrt(Math.pow((targetX - currentX), 2) + Math.pow((targetY - currentY), 2));
                //console.log(distance);
                let steelWindSequence = new Sequence("Advanced Spell Effects")
                    .effect()
                    .atLocation({ x: caster.x + (canvas.grid.size / 2), y: caster.y + (canvas.grid.size / 2) })
                    .JB2A()
                    .file(gustAnim)
                    .reachTowards({ x: openPosition.x + (canvas.grid.size / 2), y: openPosition.y + (canvas.grid.size / 2) })
                    .opacity(0.8)
                    .fadeOut(250)
                    .belowTokens()
                    .animation()
                    .on(caster)
                    .rotate(rotateAngle - 90)
                    .animation()
                    .on(caster)
                    .moveTowards(openPosition, { ease: "easeOutElasticCustom" })
                    .moveSpeed(distance / 60)
                    .duration(800)
                    .waitUntilFinished(swingStartDelay)
                    .effect()
                    .atLocation(caster, { cacheLocation: false })
                    .JB2A()
                    .file(swordAnim)
                    .startTime(animStartTimeMap[swingType])
                    .endTime(animEndTimeMap[swingType])
                    .reachTowards(target)
                    .fadeOut(250, { ease: "easeOutQuint" })
                    .waitUntilFinished()
                await steelWindSequence.play();
            }
            let contentHTML = `<form class="editable flexcol" autocomplete="off">`;
            rollDataForDisplay.forEach((data) => {
                let name = data.target;
                let attackTotal = data.attackroll;
                let damageTotal = data.damageroll;
                let hitStatus = data.hit;
                contentHTML = contentHTML + `<section style="border: 1px solid black">
                                        <li class="flexrow">
                                            <h4>${name}</h4>
                                            <div>
                                                <span>Attack Total: ${attackTotal}</span>
                                            </div>
                                            <div>
                                                <span>${hitStatus ? 'Hit!' : 'Missed!'}</span>
                                            </div>
                                            <div> 
                                                <span>Damage Total: ${damageTotal}</span>
                                            </div>
                                        </li>
                                    </section> 
                                    <br>`;
            });
            contentHTML = contentHTML + `</form>`
            async function chooseFinalLocation() {
                let crosshairsConfig = {
                    size:1,
                    icon: caster.data.img,
                    label: 'End At',
                    tag: 'end-at-crosshairs',
                    drawIcon: true,
                    drawOutline: false,
                    interval: 2
                }
                let template = await warpgate.crosshairs.show(crosshairsConfig);
                await finalTeleport(caster, template);
    
            }
            let done = await (new Promise((resolve) => {
                new Dialog({
                    title: "Steel Wind Strike breakdown",
                    content: contentHTML,
                    buttons:
                    {
                        one: {
                            label: 'Okay',
                            callback: (html) => {
                                resolve(true);
                            }
                        }
                    },
                },
                    { width: '500' },
                ).render(true)
            }));
    
            if (done) {
                await chooseFinalLocation();
            }
    
        }
    }
}
