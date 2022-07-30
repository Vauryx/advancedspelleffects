<svelte:options accessors={true} />


<script> 
    import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { getContext } from "svelte";
    import { setContext } from "svelte";
    import { writable } from 'svelte/store';
    import { onDestroy } from 'svelte';
    import { aseSocket } from "../aseSockets.js";

    import {MissileMarkerSequence} from "../sequences/MissileMarkerSequence.js";
    import { MissileSequence } from "../sequences/MissileSequence.js";
    import { MissileChatBuilder } from "../chat/MissileChatBuilder.js";
    export let elementRoot;
    export let data;
    const { application } = getContext("external");
    let form = void 0;

    console.log("Missile Dialog App Shell: ------ Entering App Shell -------");
    //console.log("Missile Dialog App Shell: Data: ", data);
    document.addEventListener("mouseup", handleClick, false);

    let missilesRemaining = data.numMissiles;
    let targets = [];
    let attacks = [];
    game.user.updateTokenTargets([]);

    onDestroy(async () => {
		console.log('the missile dialog is being destroyed...', application);
        document.removeEventListener("mouseup", handleClick, false);
        Sequencer.EffectManager.endEffects({name: `missile-target-*`});
        await aseSocket.executeAsGM("updateFlag", game.user.id, "missileDialogPos", { left: application.position.left, top: application.position.top });
	});

    function handleClick(event){
        //console.log("Missile Dialog App Shell: handleClick: event: ", event);
        let attackType = event.altKey ? 'advantage' : (event.ctrlKey ? 'disadvantage' : '');
        let token = canvas.tokens.placeables.filter(token => {
            const mouse = canvas.app.renderer.plugins.interaction.mouse;
            const mouseLocal = mouse.getLocalPosition(token);
            //console.log("Missile Dialog App Shell: handleClick: mouseLocal: ", mouseLocal);
            return mouseLocal.x >= 0 && mouseLocal.x <= token.hitArea.width
                && mouseLocal.y >= 0 && mouseLocal.y <= token.hitArea.height;
        })[0];
        if(token){
            let targetIndex = targets.findIndex(target => target.token === token);
            if(event.button == 0){
                addMissile(token, targetIndex, attackType);
            } else if (event.button == 2) {
                removeMissile(token, targetIndex);
            }
        }
    }
    async function addMissile(token, targetIndex, type = ''){
        if (missilesRemaining <= 0) {
            ui.notifications.info("Missile Limit Reached!");
            return;
        }
        missilesRemaining--;
        attacks.push({token: token, type: type});
        attacks = attacks;
        //find number of attacks for this token
        let markerIndex = attacks.filter(attack => attack.token === token).length - 1;
        let markerSequence = MissileMarkerSequence(data.effectOptions, token, markerIndex, type);
        //console.log("Missile Dialog App Shell: addMissile: markerSequence: ", markerSequence);
        markerSequence.play();
        if(targetIndex == -1){
            targets.push({token: token, missilesAssigned: 1});
            targets = targets;
        } else {
            targets[targetIndex].missilesAssigned++;
            targets = targets;
        }
    }
    function removeMissile(token, targetIndex){
        if(targetIndex > -1) {
            missilesRemaining++;
            let attackIndex = attacks.slice().reverse().findIndex(attack => attack.token === token);
            let markerIndex = attacks.filter(attack => attack.token === token).length - 1;
            Sequencer.EffectManager.endEffects({name: `missile-target-${token.id}-${markerIndex}`, object: token});
            attacks.splice((attacks.length-1)-attackIndex, 1);
            attacks = attacks;
            targets[targetIndex].missilesAssigned--;
            if(targets[targetIndex].missilesAssigned <= 0){
                targets.splice(targetIndex, 1);
            }
            targets = targets;
        }
    }
    function launchMissiles(){
        //build array of targetUuids from attacks[i].token.document.uuid
        if(attacks.length > 0){
            let targetUuids = [];
            attacks.forEach(attack => {
                    targetUuids.push(attack.token.document.uuid);
                }
            );
            const  dialogData = {
                targets: targetUuids,
                attacks: attacks,
                casterId: data.casterId,
                itemCardId: data.itemCardId,
                iterate: 'targets',
                sequenceBuilder: MissileSequence,
                sequences: [MissileSequence({intro: true, caster: data.casterId, effectOptions: data.effectOptions, targets: []})],
                effectOptions: data.effectOptions,
                chatBuilder: MissileChatBuilder,
                rolls: []
            };
            const itemUUID = data.item.uuid;
            game.ASESpellStateManager.addSpell(itemUUID, dialogData);
        }
        application.close();
    }
</script>

<ApplicationShell bind:elementRoot>
    <form
        bind:this={form}
        on:submit|preventDefault
        autocomplete="off"
        id="missile-dialog-form"
        class="overview">
    </form>
    <section class="content">
        <p>{localize("ASE.MissileDialogInstructionsA")} {data.effectOptions.missileType}</p>
        <p>{localize("ASE.MissileDialogInstructionsB")}</p>
        <p>{localize("ASE.MissileDialogInstructionsC")}</p>
        <p>{localize("ASE.MissileDialogInstructionsD")} {data.effectOptions.missileType}</p>
        <p>{localize("ASE.MissileDialogMissileCountLabel")} <b>{missilesRemaining}</b> {data.effectOptions.missileType}{missilesRemaining != 1 ? 's' : ''}
        </p>
        <table id="targetsTable" width="100%">
            <tbody>
                <tr>
                    <th>{localize("ASE.Target")}</th>
                    <th>{data.effectOptions.missileType}(s)</th>
                </tr>
                {#each targets as target,i (target.token)}
                <tr on:mouseenter="{target.token._onHoverIn()}" on:mouseleave="{target.token._onHoverOut()}">
                    <td>
                        <label for="{target.token.document.id}-missiles"><img alt="Token" src="{target.token.document.data.img}" width="30" height="30" style="border:0px"> - {target.token.document.data.name}</label>
                    </td>
                    <td>
                        <input style='width: 2em;' type="number" id="{target.token.document.id}-missiles" readonly value="{target.missilesAssigned}">
                    </td>
                    <td>
                        <button on:click="{addMissile(target.token, i)}"><i class="fas fa-plus"></i></button>
                        <button on:click="{removeMissile(target.token, i)}"><i class="fas fa-minus"></i></button>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </section>
<footer class="sheet-footer flexrow">
    <button on:click={launchMissiles}>
        <i class="fa fa-check-square"></i> {localize("ASE.Done")}
    </button>
</footer>
</ApplicationShell>