export class PatrolMenu extends FormApplication {
    constructor(...args) {
        super(...args);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "./modules/advancedspelleffects/scripts/templates/ase-settings-new.html";
        options.width = 600;
        options.height = "auto";
        options.title = "Patrol Menu Options";
        options.closeOnSubmit = true;
        options.id = "patrol-container";
        return options;
    }

    async getData() {
        return;
    }
    //----------------------------------TESTING HERE-------------------------

    async _updateObject(event, formData) {
        return;
    }

    activateListeners(html) {
        const body = $("#patrol-container");
        const settings = $("#patrol-settings");
        const settingsButton = $(".settings-button");
        const quotes = $("#quotes");
        const quotesButton = $(".quotes-button");
        const vision = $("#vision");
        const visionButton = $(".vision-button");
        const audio = $("#audio");
        const audioButton = $(".audio-button");

        let currentTab = settingsButton;
        let currentBody = settings;
        super.activateListeners(html);

        $("#polyglot-patrol").click((x, y, z) => {
            let selectedLang = $("#polyglot-patrol option:selected").text();
            if (!selectedLang) return;
            this.language = selectedLang;
        });

        $(".nav-tab").click(function () {
            currentBody.toggleClass("hide");
            currentTab.toggleClass("selected");
            if ($(this).hasClass("settings-button")) {
                settings.toggleClass("hide");
                currentBody = settings;
                currentTab = settingsButton;
            } else if ($(this).hasClass("quotes-button")) {
                quotes.toggleClass("hide");
                currentBody = quotes;
                currentTab = quotesButton;
            } else if ($(this).hasClass("vision-button")) {
                vision.toggleClass("hide");
                currentBody = vision;
                currentTab = visionButton;
            } else if ($(this).hasClass("audio-button")) {
                audio.toggleClass("hide");
                currentBody = audio;
                currentTab = audioButton;
            }
            currentTab.toggleClass("selected");
            body.height("auto");
        });
    }

    /**
     * Taken from Foundry.js line 18579
     */
    _onSourceChange(event) {
        event.preventDefault();
        const field = event.target;
        const form = field.form;
        if (!form.name.value) form.name.value = field.value.split("/").pop().split(".").shift();
    }
}