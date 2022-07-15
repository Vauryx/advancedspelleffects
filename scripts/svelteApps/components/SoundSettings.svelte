<script>
    import { spellStore } from "../../stores/spellStore.js";

    export let effectOptions;
    export let spellEffectName;

    console.log("----------------------ENTERING SOUND SETTINGS COMPONENT----------------------");
    //console.log("spellStore", $spellStore);

    let requiredSettings;
    let spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
    //console.log("spell effect", $spellEffect);
    $: {
        spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
    }

</script>

<table class="ase-spell-settings-table">
    <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
            {#each $spellEffect.settings.soundOptions as setting}
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
                        {#if setting.type == 'fileInput'}
                            <input type="text" class="files" name="{setting.flagName}"
                                bind:value={effectOptions[setting.flagName]}>
                        {/if}
                    </td>
                    {#if setting.type == 'fileInput'}
                    <td>
                        <button type="button" class="file-picker" data-type="audio"
                            data-target="{setting.flagName}" tabindex="-1" title="Browse Files">
                            <i class="fas fa-music fa-sm"></i>
                        </button>
                    </td>
                    {/if}
                </tr>
            {/each}
    </tbody>
</table>