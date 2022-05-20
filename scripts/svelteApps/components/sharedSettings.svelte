<script>
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { fade } from "svelte/transition";
    // Importing spells
    import { animateDead } from "../../spells/animateDead.js";
    import { darkness } from "../../spells/darkness.js";
    import { detectMagic } from "../../spells/detectMagic.js";
    import { callLightning } from "../../spells/callLightning.js";
    import { fogCloud } from "../../spells/fogCloud.js";
    import { spiritualWeapon } from "../../spells/spiritualWeapon.js";
    import { steelWindStrike } from "../../spells/steelWindStrike.js";
    import { thunderStep } from "../../spells/thunderStep.js";
    import { summonCreature } from "../../spells/summonCreature.js";
    import { witchBolt } from "../../spells/witchBolt.js";
    import { magicMissile } from "../../spells/magicMissile.js";
    import { scorchingRay } from "../../spells/scorchingRay.js";
    import { eldritchBlast } from "../../spells/eldritchBlast.js";
    import { vampiricTouch } from "../../spells/vampiricTouch.js";
    import { moonBeam } from "../../spells/moonBeam.js";
    import { chainLightning } from "../../spells/chainLightning.js";
    import { mirrorImage } from "../../spells/mirrorImage.js";
    import { wallOfForce } from "../../spells/wallOfForce.js";
    import { chaosBolt } from "../../spells/chaosBolt.js";
    import { detectStuff } from "../../spells/detectStuff.js";
    import { viciousMockery } from "../../spells/viciousMockery.js";
    import { wallSpell } from "../../spells/wallSpell.js";
    export let flagData;
    console.log("flagData", flagData);
    export let enableASE = flagData.enableASE || false;
    console.log("enableASE", enableASE);
    let enableASELabel = game.i18n.localize("ASE.ConvertToASELabel");
    let spellList = [];
    spellList.push({name: game.i18n.localize("ASE.AnimateDead"), effect: animateDead});
    spellList.push({name: game.i18n.localize("ASE.CallLightning"), effect: callLightning});
    spellList.push({name: game.i18n.localize("ASE.ChaosBolt"), effect: chaosBolt});
    spellList.push({name:  game.i18n.localize("ASE.Darkness"), effect: darkness});
    spellList.push({name: game.i18n.localize("ASE.DetectMagic"), effect: detectMagic});
    spellList.push({name: game.i18n.localize("ASE.FogCloud"), effect: fogCloud});
    spellList.push({name: game.i18n.localize("ASE.MagicMissile"), effect: magicMissile});
    spellList.push({name: game.i18n.localize("ASE.SpiritualWeapon"), effect: spiritualWeapon});
    spellList.push({name: game.i18n.localize("ASE.SteelWindStrike"), effect: steelWindStrike});
    spellList.push({name: game.i18n.localize("ASE.ThunderStep"), effect: thunderStep});
    spellList.push({name: game.i18n.localize("ASE.WitchBolt"), effect: witchBolt});
    spellList.push({name: game.i18n.localize("ASE.ScorchingRay"), effect: scorchingRay});
    spellList.push({name: game.i18n.localize("ASE.EldritchBlast"), effect: eldritchBlast});
    spellList.push({name: game.i18n.localize("ASE.VampiricTouch"), effect: vampiricTouch});
    spellList.push({name: game.i18n.localize("ASE.Moonbeam"), effect: moonBeam});
    spellList.push({name: game.i18n.localize("ASE.ChainLightning"), effect: chainLightning});
    spellList.push({name: game.i18n.localize("ASE.MirrorImage"), effect: mirrorImage});
    spellList.push({name: game.i18n.localize("ASE.Summon"), effect: summonCreature});
    spellList.push({name: game.i18n.localize("ASE.WallOfForce"), effect: wallOfForce});
    spellList.push({name: game.i18n.localize("ASE.DetectStuff"), effect: detectStuff});
    spellList.push({name: game.i18n.localize("ASE.ViciousMockery"), effect: viciousMockery});
    spellList.push({name: game.i18n.localize("ASE.WallSpell"), effect: wallSpell});
    spellList.sort((a,b)=> a.name.localeCompare(b.name));
    
    $: flagData.enableASE = enableASE;

</script>

<div class="ase-shared-settings">
    <div transition:fade>
        <table>
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
            {#if enableASE}
            <tr>
                <td>
                    <label for="spellEffect"> Use Effect: </label>
                </td>
                <td>
                    <!-- drop down input to select spellEffect-->
                    <select id="spellEffect" bind:value={flagData.spellEffect}>
                        {#each spellList as spell}
                            <option value={spell.name}>{spell.name}</option>
                        {/each}
                    </select>
                </td>
            </tr>
            {/if}
        </table>
    </div>
</div>
