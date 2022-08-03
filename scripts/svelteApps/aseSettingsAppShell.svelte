<svelte:options accessors={true} />

<script> 
    import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { getContext } from "svelte";
    import { setContext } from "svelte";
    import { spellStore } from "../stores/spellStore.js";
    import { writable } from 'svelte/store';
    import { onDestroy } from 'svelte';

    import EnableASE from "./components/EnableASE.svelte";
    import SharedSettings from "./components/SharedSettings.svelte";
    import NavBar from "./components/NavBar.svelte";
    import SpellSettings from "./components/SpellSettings.svelte";
    import AnimSettings from "./components/AnimSettings.svelte";
    import SoundSettings from "./components/SoundSettings.svelte";

    export let elementRoot;
    export let item;
    export let itemFlags;

    const flags = {...itemFlags.advancedspelleffects} || false;
    const { application } = getContext("external");
    let form = void 0;

    const spellStoreHost = writable(void 0);
    setContext("spellStoreHost", spellStoreHost);

    let blankItem = true;
    let enableASE = flags.enableASE ?? false;
    let currentTab = SpellSettings;

    if (flags) {
        blankItem = false;
    }
    
    $spellStoreHost = spellStore.findEntry(x => x.name === flags.spellEffect ?? '') ?? spellStore.first;
    let currentSpell = $spellStoreHost;
    $: currentSpell = $spellStoreHost;

    if(!blankItem && flags.spellEffect == $currentSpell.name && flags.effectOptions){
        if(flags.effectOptions.allowInitialMidiCall == undefined){
            if(currentSpell.settings.allowInitialMidiCall != undefined) {
                flags.effectOptions.allowInitialMidiCall = currentSpell.settings.allowInitialMidiCall;
            } else {
                flags.effectOptions.allowInitialMidiCall = true;
            }
        }
        $currentSpell.flagData = flags.effectOptions;
    }
    if(flags.effectOptions?.summons?.length > 0){
        $currentSpell.settings.summons = flags.effectOptions.summons;
    }

    console.log("App Shell: ------------------- Entering App Shell ---------------------");
    console.log("App Shell: Spell Store: ", spellStore);
    console.log("App Shell: item: ", item);
    console.log("App Shell: flags: ", flags);
    console.log("App Shell: blankItem: ", blankItem);
    console.log("App Shell: currentSpell: ", $currentSpell);
    $: console.log(`App Shell: ${enableASE ? "Enabled" : "Disabled"} ASE`);
    $: console.log(`App Shell: Spell Store Host: `, $spellStoreHost);

    async function closeApp() {
        let flagData = {};
        if(enableASE){
            flagData = {
                enableASE: enableASE,
                spellEffect: $currentSpell.name,
                effectOptions: $currentSpell.flagData,
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
        } else {
            for(let f in itemFlags.advancedspelleffects)
            {
                item.unsetFlag(`advancedspelleffects`,f);
            }
        }
        application.close();
    }
    onDestroy(async () => {
		console.log('the component is being destroyed...');
        spellStore.reInit();
	});
    
</script>
<ApplicationShell bind:elementRoot>
    <form
        bind:this={form}
        on:submit|preventDefault
        autocomplete="off"
        id="ase-settings"
        class="overview">
        <div class="ase-settings-section">
            <EnableASE bind:enableASE />
            {#if enableASE}
                <SharedSettings itemName={item.name} />
                <NavBar bind:currentTab />
                {#if currentTab == SpellSettings}
                    <SpellSettings />
                {:else if currentTab == AnimSettings}
                    <AnimSettings />
                {:else if currentTab == SoundSettings}
                    <SoundSettings />
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