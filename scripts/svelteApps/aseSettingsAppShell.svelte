<svelte:options accessors={true} />

<script>
import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
import { fade, scale } from "svelte/transition";
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
import { getContext } from "svelte";
import SharedSettings from "./components/sharedSettings.svelte"

export let elementRoot;
export let item;
export let itemFlags;
const flags = itemFlags.advancedspelleffects || {};
console.log
let flagData = {
    itemName: item.name,
    enableASE: flags.enableASE ?? false,
    spellEffect: flags.spellEffect ?? {},
    effectOptions: flags.effectOptions ?? {},
};

const { application } = getContext("external");
const oldName = item.name || item.sourceName;
let form = void 0;
let enableASE = flags.enableASE;

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
</script>

<ApplicationShell
    bind:elementRoot
    transition={scale}
    transitionOption={{duration:500}}>
    <form
    bind:this={form}
    on:submit|preventDefault
    autocomplete="off"
    id="ase-settings"
    class="overview"
>
<div class="ase-settings-section" transition:fade>
    <SharedSettings
        bind:enableASE
        {flagData}
    />
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