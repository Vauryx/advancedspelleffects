<script>

import SpellSettings from "./SpellSettingsAppShell.svelte";
import AnimSettings from "./AnimSettingsAppShell.svelte";
import SoundSettings from "./SoundSettingsAppShell.svelte";


    export let currentTab;

    console.log("----------------------ENTERING NAV BAR COMPONENT----------------------");

    let SpellSettingsButtonTitleLabel = game.i18n.localize("ASE.SpellSettingsButtonTitle");
    let AnimationSettingsButtonTitleLabel = game.i18n.localize("ASE.AnimationSettingsButtonTitle");
    let SoundSettingsButtonTitleLabel = game.i18n.localize("ASE.SoundSettingsButtonTitle");

    const navTabs = [
        {name: 'Spell Settings', title: SpellSettingsButtonTitleLabel, class: "nav-tab ase-spell-settingsButton", id: SpellSettings, icon: "fas fa-cog", selected: true},
        {name: 'Anim Settings',title: AnimationSettingsButtonTitleLabel, class: "nav-tab ase-anim-settingsButton", id: AnimSettings, icon: "fas fa-magic", selected: false}, 
        {name: 'Sound Settings',title: SoundSettingsButtonTitleLabel, class: "nav-tab ase-sound-settingsButton", id: SoundSettings, icon: "fas fa-volume-up", selected: false}
    ];

    function switchTab(tab){
        currentTab = tab.id;
        navTabs.forEach(function(navTab){
            let button = document.getElementById(navTab.name);
            if((navTab.name === tab.name) && (navTab.selected === false)){
                navTab.selected = true;
                button.classList.add("selected");
            } else {
                navTab.selected = false;
                button.classList.remove("selected");
            }
        });
    }

</script>

<div class="ase-shared-settings">
    <div class="ase-settings-tabs">
        {#each navTabs as tab}
            <button
                class={tab.class + " " + (tab.selected ? "selected" : "")}
                type="button"
                title={tab.title}
                id={tab.name}
                on:click={function() {switchTab(tab)}}
                >
                <div style="text-align:center">
                    <i class={tab.icon} />
                </div>
            </button>
        {/each}
    </div>
    
</div>
