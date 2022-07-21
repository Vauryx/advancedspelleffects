import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';
import AnimateDeadAppShell from './AnimateDeadAppShell.svelte';
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

export default class AnimateDeadDialog extends SvelteApplication {
    constructor(data) {
        super({
            title: localize("ASE.AnimateDead"),
            id: 'animate-dead-dialog',
            zIndex: 102,
            svelte: {
                class: AnimateDeadAppShell,
                target: document.body,
                props: {
                    corpses: data.corpses,
                    raiseLimit: data.raiseLimit,
                    effectSettings: data.effectSettings
                }
            }
        });
        console.log("ASE: Launching Animate Dead Dialog!", data);
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