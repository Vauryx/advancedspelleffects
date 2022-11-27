import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export class steelWindStrike {

    static registerHooks() {
        return;
    }

    static async doStrike(midiData) {
        let item = midiData.item;
        let aseFlags = item.getFlag("advancedspelleffects", 'effectOptions');
        //console.log("aseFlags", aseFlags);
        let weapon = aseFlags.weapon ?? 'sword';
        let weaponColor = aseFlags.weaponColor ?? 'blue';

        let caster = canvas.tokens.get(midiData.tokenId);
        let targets = Array.from(game.user.targets);
        let rollDataForDisplay = [];
        let dagger = "";
        if (weapon === "dagger") dagger = ".02"

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
        let currentAutoRotateState = false;
        if (game.modules.get("autorotate")?.active) {
            currentAutoRotateState = caster.document.getFlag("autorotate", "enabled") ?? false;
        }
        if (currentAutoRotateState) {
            await caster.document.setFlag("autorotate", "enabled", false);
        }
        //console.log ("Auto Rotate Flag status: ",caster.document.getFlag("autorotate", "enabled"));
        await steelWindStrike(item,caster, targets, aseFlags);

        async function evaluateAttack(target, rollData, damageFormula) {
            //console.log("Evalute attack target: ", target);
            let attackRoll = await new Roll(`1d20 + @mod + @prof`, rollData).evaluate({ async: true });
            console.log("ASE SWS ttack roll: ", attackRoll);
            // game.dice3d?.showForRoll(attackRoll);
            if (attackRoll.total < target.actor.system.attributes.ac.value) {
                onMiss(target, attackRoll);
            }
            else {
                onHit(target, attackRoll, damageFormula);
            }
        }

        async function onHit(target, attackRoll, damageFormula) {
            //console.log('Attack hit!');
            //console.log("Attack roll: ", attackRoll);
            let currentRoll = await new Roll(damageFormula, caster.actor.getRollData()).evaluate({ async: true });
            //console.log("Current damage dice roll total: ", currentRoll.total);
            //game.dice3d?.showForRoll(currentRoll);
            if (game.modules.get("midi-qol")?.active) {
                new MidiQOL.DamageOnlyWorkflow(midiData.actor, midiData.tokenId, currentRoll.total, "force", [target], currentRoll, { flavor: game.i18n.localize("ASE.SteelWindStrikeDamageFlavor"), itemCardId: "new", itemData: midiData.item.system });
            }
            //console.log("damage data: ", damageData);
            rollDataForDisplay.push({
                "target": target.name,
                "attackroll": attackRoll.total,
                "hit": true,
                "damageroll": currentRoll.total
            });
        }
        async function onMiss(target, attackRoll) {
            //console.log('Missed attack...');
            //console.log("Attack roll: ", attackRoll);
            rollDataForDisplay.push({
                "target": target.name,
                "attackroll": attackRoll.total,
                "hit": false,
                "damageroll": 0
            });
            //let currentRoll = new Roll(`${damageDie}`, caster.actor.getRollData()).roll({ async: false });
            //game.dice3d?.showForRoll(currentRoll);
            //new MidiQOL.DamageOnlyWorkflow(midiDataactor, midiDatatokenId, currentRoll.total, "bludgeoning", [target], currentRoll, { flavor: `Flurry of Blows - Damage Roll (${damageDie} Bludgeoning)`, itemCardId: midiDataitemCardId });
        }

        async function finalTeleport(caster, location) {
            //console.log("template: ", location);
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
                .file(gustAnim)
                .stretchTo(location)
                .opacity(0.8)
                .fadeOut(250)
                .belowTokens()
                .waitUntilFinished()
                .thenDo(async () => {
                    if (game.modules.get("autorotate")?.active) {
                        await caster.document.setFlag("autorotate", "enabled", currentAutoRotateState);
                    }
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
                const hitBox = new PIXI.Rectangle(token.document.x, token.document.y, token.document.w, token.document.h);
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
        async function steelWindStrike(item,caster, targets, options) {
            const dashSound = options.dashSound ?? "";
            const dashSoundDelay = options.dashSoundDelay ?? 0;
            const dashVolume = options.dashVolume ?? 1;
            const strikeSound = options.strikeSound ?? "";
            let strikeSoundDelay = options.strikeSoundDelay ?? 0;
            const strikeVolume = options.strikeVolume ?? 1;

            let itemRollData = item.getRollData();
            const itemRollMod = itemRollData.mod;

            const damageFormula = `${options.dmgDieCount}${options.dmgDie}${options.dmgMod > 0 ? "+" : ""}${options.dmgMod > 0 ? options.dmgMod : ""}`;
            //console.log("Damage formula: ", damageFormula);

            let currentX;
            let targetX;
            let currentY;
            let targetY;
            let distance;
            let swingType;
            let swingStartDelay = -600;
            //console.log(targets);
            for (let i = 0; i < targets.length; i++) {
                if (i === targets.length - 1) {
                    swingType = 5;
                    swingStartDelay = -250;
                    strikeSoundDelay += 750;
                }
                else {
                    swingType = validSwingTypes[utilFunctions.getRandomInt(0, 2)];
                }
                swordAnim = `jb2a.${weapon}.${weaponsPathMap[weapon]}.${weaponColor}.${swingType}`;
                //console.log(targets[i]);
                let target = targets[i];
                itemRollData.mod = itemRollMod;
                evaluateAttack(target, itemRollData, damageFormula);
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
                    .sound()
                    .file(dashSound)
                    .volume(dashVolume)
                    .delay(dashSoundDelay)
                    .playIf(dashSound !== "")
                    .effect()
                    .atLocation({ x: caster.x + (canvas.grid.size / 2), y: caster.y + (canvas.grid.size / 2) })
                    .file(gustAnim)
                    .stretchTo({ x: openPosition.x + (canvas.grid.size / 2), y: openPosition.y + (canvas.grid.size / 2) })
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
                    .sound()
                    .file(strikeSound)
                    .volume(strikeVolume)
                    .delay(strikeSoundDelay)
                    .playIf(strikeSound !== "")
                    .effect()
                    .atLocation(caster, { cacheLocation: false })
                    .file(swordAnim)
                    .startTime(animStartTimeMap[swingType])
                    .endTime(animEndTimeMap[swingType])
                    .stretchTo(target)
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
                contentHTML = contentHTML + `<section>
                                        <li class="flexrow">
                                            <h4>${name}</h4>
                                            <div>
                                                <span>${game.i18n.localize("ASE.SWSAttackTotalMessage")}${attackTotal}</span>
                                            </div>
                                            <div>
                                                <span>${hitStatus ? game.i18n.localize("ASE.SWSHitMessage") : game.i18n.localize("ASE.SWSMissMessage")}</span>
                                            </div>
                                            <div> 
                                                <span>${game.i18n.localize("ASE.SWSDamageTotalMessage")} ${damageTotal}</span>
                                            </div>
                                        </li>
                                    </section> 
                                    <br>`;
            });
            contentHTML = contentHTML + `</form>`
            async function chooseFinalLocation() {
                let crosshairsConfig = {
                    size: 1,
                    icon: caster.texture.src,
                    label: game.i18n.localize("ASE.SWSFinalLocationCrosshairsLabel"),
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
                    title: game.i18n.localize("ASE.SWSBreakDownWindowTitle"),
                    content: contentHTML,
                    buttons:
                    {
                        one: {
                            label: game.i18n.localize("ASE.OK"),
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

    static async getRequiredSettings(currFlags) {
        if (!currFlags) currFlags = {};

        const SwordColors = `jb2a.sword.melee.01`;
        const swordColorOptions = utilFunctions.getDBOptions(SwordColors);

        const dieOptions = [
            {'d4': 'd4'},
            {'d6': 'd6'},
            {'d8': 'd8'},
            {'d10': 'd10'},
            {'d12': 'd12'},
            {'d20': 'd20'}
        ];

        let spellOptions = [];
        let animOptions = [];
        let soundOptions = [];

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieCountLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgDieCount',
            flagName: 'dmgDieCount',
            flagValue: currFlags.dmgDieCount ?? 6,
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageDieLabel"),
            type: 'dropdown',
            options: dieOptions,
            name: 'flags.advancedspelleffects.effectOptions.dmgDie',
            flagName: 'dmgDie',
            flagValue: currFlags.dmgDie ?? 'd10',
        });

        spellOptions.push({
            label: game.i18n.localize("ASE.DamageBonusLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dmgMod',
            flagName: 'dmgMod',
            flagValue: currFlags.dmgMod ?? 0,
        });

        animOptions.push({
            label: game.i18n.localize("ASE.SwordColorLabel"),
            type: 'dropdown',
            name: 'flags.advancedspelleffects.effectOptions.weaponColor',
            options: swordColorOptions,
            flagName: 'weaponColor',
            flagValue: currFlags.weaponColor ?? 'blue',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DashSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.dashSound',
            flagName: 'dashSound',
            flagValue: currFlags.dashSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DashSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.dashSoundDelay',
            flagName: 'dashSoundDelay',
            flagValue: currFlags.dashSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.DashVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.dashVolume',
            flagName: 'dashVolume',
            flagValue: currFlags.dashVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        soundOptions.push({
            label: game.i18n.localize("ASE.StrikeSoundLabel"),
            type: 'fileInput',
            name: 'flags.advancedspelleffects.effectOptions.strikeSound',
            flagName: 'strikeSound',
            flagValue: currFlags.strikeSound ?? '',
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.StrikeSoundDelayLabel"),
            type: 'numberInput',
            name: 'flags.advancedspelleffects.effectOptions.strikeSoundDelay',
            flagName: 'strikeSoundDelay',
            flagValue: currFlags.strikeSoundDelay ?? 0,
        });
        soundOptions.push({
            label: game.i18n.localize("ASE.StrikeVolumeLabel"),
            type: 'rangeInput',
            name: 'flags.advancedspelleffects.effectOptions.strikeVolume',
            flagName: 'strikeVolume',
            flagValue: currFlags.strikeVolume ?? 0.5,
            min: 0,
            max: 1,
            step: 0.01,
        });

        return {
            spellOptions: spellOptions,
            animOptions: animOptions,
            soundOptions: soundOptions,
            allowInitialMidiCall: false,
        }

    }
}
