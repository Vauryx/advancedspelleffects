import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";

export function ChainLightningSequence(data) {
    console.log("ChainLightningSequence: ", data);
    const firstTarget = data.firstTarget;
    //find if firstTarget is in data.failedSaves
    let firstTargetFailedSave = false;
    if(data.failedSaves){
        for(let i = 0; i < data.failedSaves.length; i++){
            if(data.failedSaves[i] == firstTarget){
                firstTargetFailedSave = true;
            }
        }
    }
    //construct new object with each data.targets and whether or not they failed their save
    let targets = [];
    for(let i = 0; i < data.targets.length; i++){
        let target = data.targets[i];
        let failedSave = false;
        if(data.failedSaves){
            for(let j = 0; j < data.failedSaves.length; j++){
                if(data.failedSaves[j] == target){
                    failedSave = true;
                }
            }
        }
        //push to targets if not firstTarget
        if(target != firstTarget){
            targets.push({token: target, failedSave: failedSave});
        }
    }
    console.log("ChainLightningSequence: targets: ", targets);
    console.log("ChainLightningSequence: firstTargetFailedSave: ", firstTargetFailedSave);
    let sequence = new Sequence()
            .wait(350)
            .sound()
            .file(data.effectOptions.primarySound)
            .delay(data.effectOptions.primarySoundDelay)
            .volume(data.effectOptions.primarySoundVolume)
            .playIf(data.effectOptions.primarySound != "")
            .effect()
            .file(`jb2a.chain_lightning.primary.${data.effectOptions.primaryBoltColor}`)
            .atLocation(data.caster)
            .stretchTo(data.firstTarget)
            .randomizeMirrorY()
            .effect()
            .file(`jb2a.static_electricity.02.${data.effectOptions.saveFailEffectColor}`)
            .atLocation(data.firstTarget)
            .scaleToObject(1.3)
            .randomRotation()
            .duration(5000)
            .delay(600)
            .playIf(firstTargetFailedSave)
            .wait(750)
            for (let target of targets) {
                let randomDelay = utilFunctions.getRandomInt(data.effectOptions.secondaryBoltDelayLower, data.effectOptions.secondaryBoltDelayUpper);
                sequence.sound()
                    .file(data.effectOptions.secondarySound)
                    .delay(randomDelay + data.effectOptions.secondarySoundDelay)
                    .volume(data.effectOptions.secondarySoundVolume)
                    .playIf(data.effectOptions.secondarySound != "")
                    .effect()
                    .file(`jb2a.chain_lightning.secondary.${data.effectOptions.secondaryBoltColor}`)
                    .atLocation(data.firstTarget)
                    .stretchTo(target.token)
                    .randomizeMirrorY()
                    .delay(randomDelay)
                    .effect()
                    .file(`jb2a.static_electricity.02.${data.effectOptions.saveFailEffectColor}`)
                    .atLocation(target.token)
                    .scaleToObject(1.63)
                    .randomRotation() 
                    .duration(5000)
                    .delay(randomDelay + 400)
                    .playIf(target.failedSave)
            }

            return sequence;
}