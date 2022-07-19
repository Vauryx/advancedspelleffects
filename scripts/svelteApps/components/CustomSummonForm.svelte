<script>
    import { spellStore } from "../../stores/spellStore.js";

    export let spellEffect;
    //export let summons;

    console.log("----------------------ENTERING CUSTOM SUMMON SETTINGS COMPONENT----------------------");
    let summonOptions = $spellEffect.settings.summonOptions;
    console.log("summon options: ", summonOptions);
    console.log("spell Effect: ", $spellEffect);

    //$: summons = effectOptions.summons;

    let summons = $spellEffect.settings.summons ?? [];
    let currentSummons = $spellEffect.flagData.summons ?? [{name: '', actor: '', qty: 1}];
    function localize(string){
        return game.i18n.localize(string);
    }
    
    let summonTypeLabel = localize("ASE.SummonTypeNameLabel");
    let associatedActorLabel = localize("ASE.AssociatedActorLabel");
    let summonQuantityLabel = localize("ASE.SummonQuantityLabel");
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
                        bind:value={currentSummons[i].name}>
                </td>
                <td>
                    <label for={summon.actor}><b>{associatedActorLabel}</b></label>
                </td>
                <td> <select
                        id={summon.actor} 
                        bind:value={currentSummons[i].actor}>
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
                        bind:value={currentSummons[i].qty}>
                </td>
            </tr>
        {/each}
    </tbody>
</table>