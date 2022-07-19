<script>
    import { spellStore } from "../../stores/spellStore.js";
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

    export let spellEffect;
    console.log("----------------------ENTERING CUSTOM SUMMON SETTINGS COMPONENT----------------------");
    let summonOptions = $spellEffect.settings.summonOptions;
    console.log("summon options: ", summonOptions);
    console.log("spell Effect: ", $spellEffect);

    if(!$spellEffect.flagData.summons.length){
        $spellEffect.flagData.summons = [];
    }

    $: summons = $spellEffect.flagData.summons;

    $: console.log("Flag Data: ", $spellEffect.flagData);
    
    let summonTypeLabel = localize("ASE.SummonTypeNameLabel");
    let associatedActorLabel = localize("ASE.AssociatedActorLabel");
    let summonQuantityLabel = localize("ASE.SummonQuantityLabel");

    function addSummon(){
        summons.push({name: '', actor: '', qty: 1});
        summons = summons;
    }
    function removeSummon(){
        summons.pop();
        summons = summons;
    }
</script>

<table id="summonsTable" width="100%">
    <tbody>
        <!-- custom summon section  -->
        {#each summons as summon,i}
            <tr>
                <td>
                    <label for={summon.name}><b>{summonTypeLabel}</b></label>
                </td>
                <td>
                    <input type="text"
                        id={summon.name}
                        bind:value={summons[i].name}>
                </td>
                <td>
                    <label for={summon.actor}><b>{associatedActorLabel}</b></label>
                </td>
                <td> <select
                        id={summon.actor} 
                        bind:value={summons[i].actor}>
                        {#each summonOptions as {id, name}}
                            <option value={id}>{name}</option>
                        {/each}
                    </select>
                </td>
                <td>
                    <label for={summon.qty}><b>{summonQuantityLabel}</b></label>
                </td>
                <td>
                    <input style='width: 3em;' type="text"
                        id={summon.qty}
                        bind:value={summons[i].qty}>
                </td>
            </tr>
        {/each}
        <tr>
            <td>
                <button
                    on:click={addSummon}>
                    {localize("ASE.AddTypeButtonLabel")}
                </button>
            </td>
            <td>
                <button
                    on:click={removeSummon}>
                    {localize("ASE.RemoveTypeButtonLabel")}
                </button>
            </td>
        </tr>
    </tbody>
</table>