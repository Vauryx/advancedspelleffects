import { SvelteApplication } from '@typhonjs-fvtt/runtime/svelte/application';
import MissileDialogAppShell from './MissileDialogAppShell.svelte';
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

export default class MissileDialog extends SvelteApplication {
    constructor(data) {
        super({
            title: localize("ASE.SelectTargetsDialogTitle"),
            id: 'missile-dialog-shell',
            zIndex: 102,
            svelte: {
                class: MissileDialogAppShell,
                target: document.body,
                props: {
                    data: data
                }
            }
        });
        console.log("ASE: Launching Missile Dialog!", data);
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            resizable: true,
            minimizable: true,
            width: "auto",
            height: "auto",
            left: game.user?.getFlag("advancedspelleffects", "missileDialogPos.left") ?? "auto",
            top: game.user?.getFlag("advancedspelleffects", "missileDialogPos.top") ?? "auto",
            closeOnSubmit: true,
        })
    }
}