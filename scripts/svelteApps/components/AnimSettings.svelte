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
                {#if setting.type == "numberInput"}
                    <td>
                        <input type="text" id={setting.flagName} bind:value={$spellEffect.flagData[setting.flagName]}/>
                    </td>
                {/if}
                {#if setting.type == "checkbox"}
                    <td>
                        <input type="checkbox" id={setting.flagName} bind:checked={$spellEffect.flagData[setting.flagName]}/>
                    </td>
                {/if}
                {#if setting.type == "dropdown"}
                    <td>
                        <select id={setting.flagName} bind:value={$spellEffect.flagData[setting.flagName]}>
                            {#each setting.options as option}
                                <option value={Object.keys(option)[0]}>{Object.values(option)[0]}</option>
                            {/each}
                        </select>
                    </td>
                {/if}
                {#if setting.type == "textInput"}
                    <td>
                        <input type="text" id={setting.flagName} bind:value={$spellEffect.flagData[setting.flagName]}/>
                    </td>
                {/if}
                {#if setting.type == "rangeInput"}
                    <td colspan="2">
                        <output style="font-weight: bold;">{$spellEffect.flagData[setting.flagName]}</output>
                        <input type="range" min="{setting.min}" max="{setting.max}"
                            step="{setting.step}"
                            oninput="this.previousElementSibling.value = this.value"
                            id="{setting.flagName}" bind:value={$spellEffect.flagData[setting.flagName]}>
                    </td>
                {/if}
                {#if setting.type == "colorPicker"}
                <td>
                    <input type="color" id="{setting.flagName}" bind:value={$spellEffect.flagData[setting.flagName]}>
                </td>
                {/if}
        </tr>
    {/each}
    </tbody>
</table>