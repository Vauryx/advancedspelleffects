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
    console.log("----------------------ENTERING SETTINGS APP----------------------");
    console.log("flagData", flagData);
    let newFlagData = {
        itemName: flagData.itemName ?? '',
        enableASE: flagData.enableASE ?? false,
        spellEffect: flagData.spellEffect ?? '',
        effectOptions: flagData.effectOptions ?? {},
    };
    let enableASE = flagData.enableASE || false;
    //console.log("enableASE", enableASE);
    let effectOptions = flagData.effectOptions || {};
    console.log("effectOptions", effectOptions);
    let spellEffectName = flagData.spellEffect || "";
    console.log("spellEffectName", spellEffectName);

    let enableASELabel = game.i18n.localize("ASE.ConvertToASELabel");
    let ASESettingsLabel = game.i18n.localize("ASE.ASESettingsLabel");
    let SpellSettingsButtonTitleLabel = game.i18n.localize("ASE.SpellSettingsButtonTitle");
    let AnimationSettingsButtonTitleLabel = game.i18n.localize("ASE.AnimationSettingsButtonTitle");
    let SoundSettingsButtonTitleLabel = game.i18n.localize("ASE.SoundSettingsButtonTitle");

    let itemName = flagData.itemName;
    console.log("itemName: ", itemName);
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
    console.log("spellList: ", spellList);

    let requiredSettings;
    let spellEffect = spellList.find(x => x.name === flagData.spellEffect) ?? spellList[0];
    let settingsPromise = updateRequiredSettings(spellEffect);

    $: currentTabId = 0;
    $: flagData.enableASE = enableASE;
    $: flagData.effectOptions = effectOptions;
    $: flagData.spellEffect = spellEffectName;
    $: {spellEffect = spellList.find(x => x.name === spellEffectName) ?? spellList[0];
        settingsPromise = updateRequiredSettings(spellEffect);}

   // $: console.log("ASE flag is", enableASE ? "enabled" : "disabled");
    //$: console.log("Updating flagData Effect Options...", effectOptions);
    //$: console.log("Required settings: ", requiredSettings);
    //$: console.log("Spell Effect: ", spellEffect);
    //$: console.log("currentTabId is: ", currentTabId);
    //$: console.log("Spell Effect name: ", flagData.spellEffect);
    
    
    

    function switchTab(){
        //console.log("Switching tabs...", arguments);
        
        let buttonClicked = arguments[0].target;
        let spellSettingsTab = document.getElementsByClassName("ase-spell-settingsButton")[0];
        let animSettingsTab = document.getElementsByClassName("ase-anim-settingsButton")[0];
        let soundSettingsTab = document.getElementsByClassName("ase-sound-settingsButton")[0];
        let tabs = [{tab: spellSettingsTab, id: 0}, {tab: animSettingsTab, id: 1}, {tab: soundSettingsTab, id: 2}];
        console.log("tabs: ", tabs);
        let infiniteLoopCounter = 0;
        while(!buttonClicked.classList.contains("nav-tab") && infiniteLoopCounter < 10){
            buttonClicked = buttonClicked.parentElement;
            infiniteLoopCounter++;
        }
        console.log("buttonClicked: ", buttonClicked);
        for(let i = 0; i < tabs.length; i++){
            let tab = tabs[i].tab;
            //console.log("tab: ", tab);
            if(tab === buttonClicked && !tab.classList.contains("selected")){
                tab.classList.add("selected");
                currentTabId = tabs[i].id;
            }
            else if (tab != buttonClicked && tab.classList.contains("selected")){
                tab.classList.remove("selected");
            }
        }
       
    }
    async function updateRequiredSettings(spellEffect){
        requiredSettings = await spellEffect.effect.getRequiredSettings(effectOptions);
        //effectOptions = {};
        //iterate through requiredSettings object and overwrite flagData object with values from requiredSettings
        let newEffectOptions = {};
        for(let type in requiredSettings){
            for(let i = 0; i < requiredSettings[type].length; i++){
                let setting = requiredSettings[type][i];
                let flagName = setting.flagName;
                newEffectOptions[flagName] = setting.flagValue;
            }
        }
        newEffectOptions = JSON.parse(JSON.stringify(newEffectOptions));
        //console.log("neweffectOptions: ", newEffectOptions);
        //console.log("Setting effect options to new effect options");
        effectOptions = newEffectOptions;
        return {settings: requiredSettings, effectOptions: newEffectOptions};
        //console.log("Required settings: ", requiredSettings);
    }
    
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
    {#if enableASE}
    <div transition:fade>
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
                            {#each spellList as spell}
                                <option value={spell.name}>{spell.name}</option>
                            {/each}
                        </select>
                    </td>
                </tr>
                <div class="ase-settings-tabs">
                    <button class="nav-tab ase-spell-settingsButton selected" type="button"
                        title="{SpellSettingsButtonTitleLabel}" on:click={switchTab}>
                        <div style="text-align:center">
                            <i class="fas fa-cog"></i>
                        </div>
                    </button>
                    <button class="nav-tab ase-anim-settingsButton " type="button"
                        title="{AnimationSettingsButtonTitleLabel}" on:click={switchTab}>
                        <div style="text-align:center">
                            <i class="fas fa-magic"></i>
                        </div>
                    </button>
                    <button class="nav-tab ase-sound-settingsButton" type="button"
                        title="{SoundSettingsButtonTitleLabel}" on:click={switchTab}>
                        <div style="text-align:center">
                            <i class="fas fa-volume-up"></i>
                        </div>
                    </button>
                </div>
            </tbody>
        </table>
            {#if currentTabId == 0}
            <table class="ase-spell-settings-table">
                <tbody style='border-top: 1pt solid black;border-bottom: 1pt solid black;'>
                  {#await settingsPromise}
                  <p> Getting Required Settings...</p>
                    {:then settings} 
                        {#each settings.settings.spellOptions as setting}
                            <tr>
                                <td>
                                    <label for="{setting.flagName}">{setting.label}</label>
                                </td>
                                <td>
                                    {#if setting.type == "numberInput"}
                                        <input type="text" id="{setting.flagName}" bind:value={flagData.effectOptions[setting.flagName]}/>
                                    {/if}
                                    {#if setting.type == "checkbox"} 
                                        <input type="checkbox" id="{setting.flagName}" bind:checked={flagData.effectOptions[setting.flagName]}/>
                                    {/if}
                                    {#if setting.type == "dropdown"}
                                        <select id="{setting.flagName}" bind:value={flagData.effectOptions[setting.flagName]}>
                                            {#each setting.options as {id, name}}
                                                <option value={id}>{name}</option>
                                            {/each}
                                        </select>
                                    {/if}
                                    {#if setting.type == "textInput"}
                                        <input type="text" id="{setting.flagName}" bind:value={flagData.effectOptions[setting.flagName]}/>
                                    {/if}
                                    {#if setting.type == "rangeInput"}
                                        <input type="range" min="{setting.min}" max="{setting.max}"
                                            step="{setting.step}"
                                            oninput="this.nextElementSibling.value = this.value"
                                            name="{setting.flagName}" bind:value={flagData.effectOptions[setting.flagName]}>
                                        <output style="font-weight: bold;">{flagData.effectOptions[setting.flagName]}</output>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {/await}
                </tbody>
            </table>
            {/if}
    </div>
    {/if}
</div>
