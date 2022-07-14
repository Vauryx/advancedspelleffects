<script>

    export let currentTab;

    console.log("----------------------ENTERING NAV BAR COMPONENT----------------------");

    let SpellSettingsButtonTitleLabel = game.i18n.localize("ASE.SpellSettingsButtonTitle");
    let AnimationSettingsButtonTitleLabel = game.i18n.localize("ASE.AnimationSettingsButtonTitle");
    let SoundSettingsButtonTitleLabel = game.i18n.localize("ASE.SoundSettingsButtonTitle");

    const navTabs = [
        {title: SpellSettingsButtonTitleLabel, class: "nav-tab ase-spell-settingsButton", id: 0, icon: "fas fa-cog", selected: true},
        {title: AnimationSettingsButtonTitleLabel, class: "nav-tab ase-anim-settingsButton", id: 1, icon: "fas fa-magic", selected: false}, 
        {title: SoundSettingsButtonTitleLabel, class: "nav-tab ase-sound-settingsButton", id: 2, icon: "fas fa-volume-up", selected: false}
    ];

    function switchTab(tab){
        currentTab = tab.id;
        navTabs.forEach(function(navTab){
            let button = document.getElementById(navTab.id);
            if((navTab.id == tab.id) && (navTab.selected == false)){
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
                id={tab.id}
                on:click={function() {switchTab(tab)}}
                >
                <div style="text-align:center">
                    <i class={tab.icon} />
                </div>
            </button>
        {/each}
    </div>
    
</div>
