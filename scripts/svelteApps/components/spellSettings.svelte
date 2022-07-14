<script>
    import { spellStore } from "../../stores/spellStore.js";

    export let effectOptions;
    export let spellEffectName;

    console.log("----------------------ENTERING SPELL SETTINGS COMPONENT----------------------");
    console.log("spellStore", $spellStore);

    let requiredSettings;
    let spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
    let settingsPromise = getRequiredSettings(spellEffect);

    $: {
        spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
        settingsPromise = getRequiredSettings(spellEffect);
    }
    
    async function getRequiredSettings(spellEffect){
        requiredSettings = await spellEffect.effect.getRequiredSettings(effectOptions);
        
        for(let type in requiredSettings){
            for(let i = 0; i < requiredSettings[type].length; i++){
                let setting = requiredSettings[type][i];
                let flagName = setting.flagName;
                effectOptions[flagName] = setting.flagValue;
            }
        }
        
        return requiredSettings;
    }
    

</script>

<table class="ase-spell-settings-table">
    <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
      {#await settingsPromise}
      <p> Getting Required Settings...</p>
        {:then settings}
            {#each settings.spellOptions as setting}
                <tr>
                    <td>
                        <label for="{setting.flagName}">{setting.label}</label>
                    </td>
                    <td>
                        {#if setting.type == "numberInput"}
                            <input type="text" id={setting.flagName} bind:value={effectOptions[setting.flagName]}/>
                        {/if}
                        {#if setting.type == "checkbox"}
                            <input type="checkbox" id={setting.flagName} bind:checked={effectOptions[setting.flagName]}/>
                        {/if}
                        {#if setting.type == "dropdown"}
                            <select id={setting.flagName} bind:value={effectOptions[setting.flagName]}>
                                {#each setting.options as {id, name}}
                                    <option value={id}>{name}</option>
                                {/each}
                            </select>
                        {/if}
                        {#if setting.type == "textInput"}
                            <input type="text" id={setting.flagName} bind:value={effectOptions[setting.flagName]}/>
                        {/if}
                        {#if setting.type == "rangeInput"}
                            <input type="range" min="{setting.min}" max="{setting.max}"
                                step="{setting.step}"
                                oninput="this.nextElementSibling.value = this.value"
                                name="{setting.flagName}" bind:value={effectOptions[setting.flagName]}>
                            <output style="font-weight: bold;">{effectOptions[setting.flagName]}</output>
                        {/if}
                    </td>
                </tr>
            {/each}
        {/await}
    </tbody>
</table>