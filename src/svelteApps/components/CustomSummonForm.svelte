<script>
    import { spellStore } from "../../stores/spellStore.js";
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { getContext } from "svelte";
    console.log("----------------------ENTERING CUSTOM SUMMON SETTINGS COMPONENT----------------------");

    const spellStoreHost = getContext("spellStoreHost");
    let spellEffect = $spellStoreHost;
    $: spellEffect = $spellStoreHost; 
    let summonOptions = $spellEffect.settings.summonOptions;
    console.log("Custom Summon Stuff Settings: summonOptions: ", summonOptions);
    console.log("Custom Summon Settings: spell Effect: ", $spellEffect);
    if(!$spellEffect.flagData.summons || $spellEffect.flagData.summons.length === 0){
        $spellEffect.flagData.summons = [{name: "", actor: summonOptions[0].id, qty: 1}];
    }
    let summons = $spellEffect.flagData.summons;
    console.log("Custom Summon Stuff Settings: summons: ", summons);
    let summonTypeLabel = localize("ASE.SummonTypeNameLabel");
    let associatedActorLabel = localize("ASE.AssociatedActorLabel");
    let summonQuantityLabel = localize("ASE.SummonQuantityLabel");

    function addSummon(){
        summons.push({name: '', actor: summonOptions[0].id, qty: 1});
        summons = summons;
    }
    function removeSummon(){
        if(summons.length === 1){
            ui.notifications.info("Cannot remove last summon");
            return;
        }
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
