<script>
    import { getContext } from "svelte";
    
    //export let spellEffect;


    console.log("Sound Settings: -------ENTERING SOUND SETTINGS COMPONENT-----");
    const spellStoreHost = getContext("spellStoreHost");
    let spellEffect = $spellStoreHost;
    $: spellEffect = $spellStoreHost; 
    console.log("Sound Settings: spellEffect: ", $spellEffect);
    let soundPaths = {};
    $spellEffect.settings.soundOptions.forEach(soundOption => {
        if(soundOption.type == 'fileInput'){
            soundPaths[soundOption.flagName] = $spellEffect.flagData[soundOption.flagName];
        }
    });
    async function selectFile(setting) {
        const current = $spellEffect.flagData[setting.flagName] ?? "";
        const picker = new FilePicker({
            type: "audio",
            current,
            callback: (path) => {
                soundPaths[setting.flagName] = path;
            },
        });
        await picker.browse(current);
    }
    $: {
        for (let flagName in soundPaths) {
            $spellEffect.flagData[flagName] = soundPaths[flagName];
        }
    }
</script>

<table class="ase-spell-settings-table">
    <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
            {#each $spellEffect.settings.soundOptions as setting}
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
                        {#if setting.type == 'fileInput'}
                            <td>
                                <input type="text" class="files" id="{setting.flagName}"
                                    bind:value={soundPaths[setting.flagName]}>
                            </td>
                            <td>
                                <button class="file-picker" on:click|preventDefault={() => selectFile(setting)} title="Browse Files">
                                    <i class="fas fa-music fa-sm"></i>
                                </button>
                            </td>
                        {/if}
                </tr>
            {/each}
    </tbody>
</table>