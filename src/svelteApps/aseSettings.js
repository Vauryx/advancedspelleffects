import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';
import ASESettingsAppShell from './ASESettingsAppShell.svelte';
export default class ASESettings extends SvelteApplication {
    constructor(item) {
        super({
            title: `ASE Settings for ${item.name}`,
            id: `ase-item-settings`,
            zIndex: 102,
            svelte: {
                class: ASESettingsAppShell,
                target: document.body,
                props: {
                    item: item,
                    itemFlags: item.data.flags,
                }
            }
        });
        console.log("ASE: Caught item sheet render hook!", item);
        console.log("Item Flags: ", item.data.flags);
        
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            resizable: true,
            minimizable: true,
            width: "auto",
            height: "auto",
            closeOnSubmit: true,
        })
    }
}