<svelte:options accessors={true} />

<script> 
    import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { getContext } from "svelte";
    import { spellStore } from "../stores/spellStore.js";

    import EnableASE from "./components/EnableASE.svelte";
    import SharedSettings from "./components/SharedSettings.svelte";
    import NavBar from "./components/NavBar.svelte";
    import SpellSettings from "./components/SpellSettings.svelte";
    import AnimSettings from "./components/AnimSettings.svelte";
    import SoundSettings from "./components/SoundSettings.svelte";

    export let elementRoot;
    export let item;
    export let itemFlags;

    const flags = itemFlags.advancedspelleffects || false;
    let blankItem = true;
    if (flags) {
        blankItem = false;
    }

    console.log("App Shell: Entering Spell Settings...");
    console.log("App Shell: Spell Store: ", spellStore);
    console.log("App Shell: item: ", item);
    console.log("App Shell: flags: ", flags);
    console.log("App Shell: blankItem: ", blankItem);
    
    const { application } = getContext("external");
    let form = void 0;

    let spellEffect = spellStore.findEntry(x => x.name === flags.spellEffect ?? '') ?? spellStore.first;
    console.log("App Shell: spellEffect: ", $spellEffect);

    if(!blankItem && flags.spellEffect == $spellEffect.name && flags.effectOptions){
        $spellEffect.flagData = flags.effectOptions;
    }

    if(flags.effectOptions?.summons?.length > 0){
        $spellEffect.settings.summons = flags.effectOptions.summons;
    }

    let enableASE = flags.enableASE ?? false;
    let spellEffectName = flags.spellEffect ?? $spellEffect.name;
    let currentTab = SpellSettings;

    async function closeApp() {
        let flagData = {
            enableASE: enableASE,
            spellEffect: $spellEffect.name,
            effectOptions: $spellEffect.flagData,
        };
        console.log('App Shell: FlagData Updating: ', flagData);
        const updatedFlags = {
            data: {
                flags: {
                    advancedspelleffects: flagData,
                },
            },
        };
        await item.unsetFlag('advancedspelleffects', 'effectOptions');
        await item.update(updatedFlags.data);
        application.close();
    }
    $: console.log(`App Shell: ${enableASE ? "Enabled" : "Disabled"} ASE`);
    $: {
        spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
        console.log(`App Shell: Spell Effect for item ${item.name} changed to ${spellEffectName}`);
    }
</script>
<ApplicationShell
    bind:elementRoot>
    <form
    bind:this={form}
    on:submit|preventDefault
    autocomplete="off"
    id="ase-settings"
    class="overview"
>
<div class="ase-settings-section">
    <EnableASE
        bind:enableASE
    />
    {#if enableASE}
        <SharedSettings
            bind:spellEffectName
            itemName={item.name}
        />
        <NavBar 
            bind:currentTab
        />
        {#if currentTab == SpellSettings}
            <SpellSettings
                spellEffect={spellEffect}
            />
        {:else if currentTab == AnimSettings}
            <AnimSettings
                spellEffect={spellEffect}
            />
        {:else if currentTab == SoundSettings}
            <SoundSettings
                spellEffect={spellEffect}
            />
        {/if}
    {/if}
</div>
<div class="aseBottomSection" style="margin-bottom: 5px">
    <div class="ase-submit">
        <div class="flexcol" style="grid-row:1/2; grid-column:2/3">
            <button
                class="footer-button"
                on:click|preventDefault={closeApp}
                >{localize("ASE.SaveCloseButtonLabel")}</button
            >
        </div>
    </div>
</div>
</form>
</ApplicationShell>