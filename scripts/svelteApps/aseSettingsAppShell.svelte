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

const flags = itemFlags.advancedspelleffects || {};
const blankItem = itemFlags.advancedspelleffects?.enableASE;

const { application } = getContext("external");
let form = void 0;

console.log("item: ", item);
console.log("item parent: ", item.parent);


let flagData = {
    itemName: item.name,
    itemId: item.id,
    itemParent: item.parent,
    enableASE: flags.enableASE ?? false,
    spellEffect: flags.spellEffect ?? localize("ASE.AnimateDead"),
    effectOptions: flags.effectOptions ?? {},
};


let enableASE = flagData.enableASE;
let spellEffectName = flagData.spellEffect;
let itemName = flagData.itemName;
let itemId = flagData.itemId;
let itemParent = flagData.itemParent;
// let effectOptions = flagData.effectOptions;

let spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
console.log("main app: spellEffect: ", $spellEffect);

//$spellEffect.flagData = flagData.effectOptions;
let effectOptions = blankItem ? flagData.effectOptions : {...$spellEffect.flagData, ...flagData.effectOptions};
console.log("main app: effectOptions: ", effectOptions);
let currentTab = SpellSettings;

async function closeApp() {
        console.log('FlagData Updating: ', flagData);
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

$: {
    flagData.enableASE = enableASE;
    console.log(`${enableASE ? "Enabled" : "Disabled"} ASE`);
}
$: {
    flagData.spellEffect = spellEffectName;
    spellEffect = spellStore.findEntry(x => x.name === spellEffectName) ?? spellStore.first;
    console.log(`Spell Effect for item ${itemName} changed to ${spellEffectName}`);
}

$: {
    flagData.effectOptions = effectOptions;
    console.log(`Effect Options for item ${itemName} chaned to: `, effectOptions);
}
$: {
    $spellEffect.flagData.summons = effectOptions.summons ?? [{name: '', actor: '', qty: 1}];
    console.log(`Summons for item ${itemName} chaned to: `, effectOptions.summons);
}

</script>

<ApplicationShell
    bind:elementRoot
    transitionOption={{duration:500}}>
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
            itemName={itemName}
        />
        <NavBar 
            bind:currentTab
        />
        {#if currentTab == SpellSettings}
            <SpellSettings
                bind:effectOptions
                spellEffect={spellEffect}
                itemId={itemId}
                itemParent={itemParent}
            />
        {:else if currentTab == AnimSettings}
            <AnimSettings
                bind:effectOptions
                spellEffect={spellEffect}
            />
        {:else if currentTab == SoundSettings}
            <SoundSettings
                bind:effectOptions
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