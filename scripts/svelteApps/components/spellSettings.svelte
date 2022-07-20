<script>
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import CustomSummonForm from "./CustomSummonForm.svelte";

    export let spellEffect;
    
    console.log("Spell Settings: --------ENTERING SPELL SETTINGS COMPONENT-------");
    console.log("Spell Settings: spellEffect: ", $spellEffect);

    let summonOptions = $spellEffect.settings.summonOptions ?? [];
    $: isSummonSpell =  $spellEffect.name.includes(localize("ASE.Summon"));

</script>

<table class="ase-spell-settings-table">
    <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
            {#each $spellEffect.settings.spellOptions as setting}
                <tr>
                    <td>
                        <label for="{setting.flagName}">{setting.label}</label>
                    </td>
                    <td>
                        {#if setting.type == "numberInput"}
                            <input type="text" id={setting.flagName} bind:value={$spellEffect.flagData[setting.flagName]}/>
                        {/if}
                        {#if setting.type == "checkbox"}
                            <input type="checkbox" id={setting.flagName} bind:checked={$spellEffect.flagData[setting.flagName]}/>
                        {/if}
                        {#if setting.type == "dropdown"}
                            <select id={setting.flagName} bind:value={$spellEffect.flagData[setting.flagName]}>
                                {#each setting.options as option}
                                    <option value={Object.keys(option)[0]}>{Object.values(option)[0]}</option>
                                {/each}
                            </select>
                        {/if}
                        {#if setting.type == "textInput"}
                            <input type="text" id={setting.flagName} bind:value={$spellEffect.flagData[setting.flagName]}/>
                        {/if}
                        {#if setting.type == "rangeInput"}
                            <input type="range" min="{setting.min}" max="{setting.max}"
                                step="{setting.step}"
                                oninput="this.nextElementSibling.value = this.value"
                                name="{setting.flagName}" bind:value={$spellEffect.flagData[setting.flagName]}>
                            <output style="font-weight: bold;">{$spellEffect.flagData[setting.flagName]}</output>
                        {/if}
                    </td>
                </tr>
            {/each}
    </tbody>
</table>
{#if isSummonSpell}
    <CustomSummonForm
        summonOptions={summonOptions}
        spellEffect={spellEffect}
    />
{/if}

