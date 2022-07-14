<script>

    export let enableASE;
    console.log("----------------------ENTERING ENABLEASE COMPONENT----------------------");

    let enableASELabel = game.i18n.localize("ASE.ConvertToASELabel");
    
</script>

<div class="ase-shared-settings">
    <table>
        <tbody style='border-top: 1pt solid black;border-bottom: none;'>
            <tr>
                <td>
                    <label
                        for="enableASE"
                        class={enableASE ? "selected" : "notSelected"}
                        >{enableASELabel}</label
                    >
                </td>
                <td>
                    <!-- checkbox input to select spellEffect-->
                    <input
                        type="checkbox"
                        id="enableASE"
                        bind:checked={enableASE}
                    />
                </td>
            </tr>
        </tbody>
    </table>
</div>
