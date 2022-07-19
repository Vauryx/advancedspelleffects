<script>
    import { spellStore } from "../../stores/spellStore.js";

    export let spellEffect;

    console.log("Anim Settings: ---------ENTERING ANIM SETTINGS COMPONENT--------");
    console.log("Anim Settings: spellEffect", $spellEffect);

    let requiredSettings;
    

</script>

<table class="ase-spell-settings-table">
    <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
            {#each $spellEffect.settings.animOptions as setting}
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
                                {#each setting.options as {id, name}}
                                    <option value={id}>{name}</option>
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
                        {#if setting.type == 'colorPicker'}
                            <input type="color" name="{setting.flagName}" bind:value={$spellEffect.flagData[setting.flagName]}>
                        {/if}
                    </td>
                </tr>
            {/each}
    </tbody>
</table>