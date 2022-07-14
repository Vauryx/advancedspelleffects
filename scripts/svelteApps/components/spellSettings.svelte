<script>
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { fade } from "svelte/transition";
    import { spellStore } from "../../stores/spellStore.js";

    export let flagData;
    console.log("flagData", flagData);
    export let enableASE = flagData.enableASE || false;
    console.log("enableASE", enableASE);

    console.log("spellStore", $spellStore);

    $: flagData.enableASE = enableASE;

</script>
