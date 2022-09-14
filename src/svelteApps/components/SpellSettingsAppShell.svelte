<script>
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import CustomSummonForm from "./CustomSummonForm.svelte";
    import CustomDetectForm from "./CustomDetectForm.svelte";
    import { getContext } from "svelte";
    
    //export let spellEffect;
    const spellStoreHost = getContext("spellStoreHost");
    let spellEffect = $spellStoreHost;
    $: spellEffect = $spellStoreHost; 

    console.log("Spell Settings: --------ENTERING SPELL SETTINGS COMPONENT-------");
    console.log("Spell Settings: spellEffect: ", $spellEffect);

    let summonOptions = $spellEffect.settings.summonOptions ?? [];
    let wallSpecificSettings = {};
    let wallType = $spellEffect.flagData.wallType ?? "fire";


    $: {
        if($spellEffect.name.includes(localize("ASE.WallSpell"))){
            console.log("Spell Settings: Chaning wall type to: ", wallType);
            $spellEffect.flagData.wallType = wallType;
            wallSpecificSettings = $spellEffect.effect.getRequiredSettings($spellEffect.flagData);
            $spellEffect.settings = wallSpecificSettings;
            $spellEffect.flagData.panelCount = wallSpecificSettings.spellOptions.find((x) => x.flagName == 'panelCount')?.flagValue ?? 10;
            $spellEffect.flagData.wallSegmentSize = wallSpecificSettings.spellOptions.find((x) => x.flagName == 'wallSegmentSize')?.flagValue ?? 10;
            $spellEffect.flagData.forceColor = wallSpecificSettings.animOptions.find((x) => x.flagName == 'forceColor')?.flagValue ?? 'blue';

        }
    };

</script>

<table class="ase-spell-settings-table">
    <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
            {#each $spellEffect.settings.spellOptions as setting (setting.flagName)}
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
                        {#if setting.type == "dropdown" && setting.flagName.includes("wallType")}
                            <select id={setting.flagName} bind:value={wallType}>
                                {#each setting.options as option}
                                    <option value={Object.keys(option)[0]}>{Object.values(option)[0]}</option>
                                {/each}
                            </select>
                        {/if}
                        {#if setting.type == "dropdown" && !setting.flagName.includes("wallType")}
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
{#if $spellEffect.name.includes(localize("ASE.Summon"))}
    <CustomSummonForm/>
{/if}
{#if $spellEffect.name.includes(localize("ASE.DetectStuff"))}
    <CustomDetectForm/>
{/if}

