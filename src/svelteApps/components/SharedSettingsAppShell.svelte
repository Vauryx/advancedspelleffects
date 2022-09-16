<script>

    import { spellStore } from "../../stores/spellStore.js";
    import { getContext } from "svelte";
    export let itemName;
    export let itemUuid;
    console.log("----------------------ENTERING SHARED SETTINGS COMPONENT----------------------");

    //console.log("spellStore: ", spellStore);
    const spellStoreHost = getContext("spellStoreHost");
    let currentSpell = $spellStoreHost;

    $: {
        console.log("Shared Settings: currentSpell: ", $currentSpell);
        $spellStoreHost = currentSpell;
    }

    let ASESettingsLabel = game.i18n.localize("ASE.ASESettingsLabel");

    async function setSpellDetails(requiredDetails){
        const item = await fromUuid(itemUuid);
        console.log("Shared Settings: setSpellDetails: ", requiredDetails, item);
        await item.update({data: requiredDetails});
        ui.notifications.info("Overwrite Successful");

    }
</script>

<div class="ase-shared-settings">
    <div>
        <table>
            <tbody style='border-top: none;border-bottom: none;'>
                <tr>
                    <td>
                        <label for="itemNameLabel">{ASESettingsLabel}</label>
                    </td>
                    <td>
                        <p id="itemNameLabel"><b>{itemName}</b></p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="spellEffect"> Use Effect: </label>
                    </td>
                    <td>
                        <!-- drop down input to select spellEffect-->
                        <select id="spellEffect" bind:value={currentSpell}>
                            {#each $spellStore as spell (spell.id)}
                                <option value={spell}>{spell.name}</option>
                            {/each}
                        </select>
                    </td>
                </tr>
                <!-- if currentspell.settings.requiredDetails exists add row -->
                {#if $currentSpell.settings.requireDetails}
                    <tr>
                        <td>
                            <label title="Overwrite some spell settings with the required ones for ASE automatically" for="requiredDetailsBtn"> Set spell details: </label>
                        </td>
                        <td>
                            <!-- button with requiredDetails passed in-->
                            <button
                                type="button"
                                title="Overwrite some spell settings with the required ones for ASE automatically"
                                id="requiredDetailsBtn"
                                on:click={async function() {await setSpellDetails($currentSpell.settings.requireDetails)}}>
                                Overwrite!
                            </button>
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
