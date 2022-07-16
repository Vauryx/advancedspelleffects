<script>

    import { spellStore } from "../../stores/spellStore.js";

    export let spellEffectName;
    export let itemName;
    console.log("----------------------ENTERING SHARED SETTINGS COMPONENT----------------------");

    console.log("spellStore: ", spellStore);

    let ASESettingsLabel = game.i18n.localize("ASE.ASESettingsLabel");

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
                        <select id="spellEffect" bind:value={spellEffectName}>
                            {#each $spellStore as spell (spell.id)}
                                <option value={spell.name}>{spell.name}</option>
                            {/each}
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
