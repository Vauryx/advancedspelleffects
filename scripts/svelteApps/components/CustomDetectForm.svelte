<script>
    import { spellStore } from "../../stores/spellStore.js";
    import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
    import { getContext } from "svelte";
    //export let spellEffect;
    console.log("----------------------ENTERING CUSTOM DETECT SETTINGS COMPONENT----------------------");

    const spellStoreHost = getContext("spellStoreHost");
    let spellEffect = $spellStoreHost;
    $: spellEffect = $spellStoreHost; 
    console.log("Custom Detect Stuff Settings: spell Effect: ", $spellEffect);

    if(!$spellEffect.flagData.tagOptions || $spellEffect.flagData.tagOptions.length == 0){
        $spellEffect.flagData.tagOptions = [{tagEffect: "", tagLabel: ""}];
    }
    
    let tags = $spellEffect.flagData.tagOptions;
    console.log("Custom Detect Stuff Settings: tags: ", tags);

    function addTag() {
        tags.push({tagEffect: "", tagLabel: ""});
        tags = tags;
    }
    function removeTag() {
        if(tags.length == 1){
            ui.notifications.info("Cannot remove last tag");
            return;
        }
        tags.pop();
        tags = tags;
    }
</script>
<table id="tagsTable" width="100%" title="Custom Tags">
    <tbody>
        <tr>
            <th colspan="4">{localize("ASE.TagTableLabel")}</th>
        </tr>
        {#each tags as tag,i}
            <tr>
                <td>
                    <label for={tag.tagLabel}
                        title='{localize("ASE.TagNameTooltip")}'><b>{localize("ASE.TagNameLabel")}</b></label>
                </td>
                <td>
                    <input type="text"
                        id={tag.tagLabel}
                        bind:value="{tags[i].tagLabel}">
                </td>
                <td>
                    <label for={tag.tagEffect}
                        title='{localize("ASE.TagEffectTooltip")}'><b>{localize("ASE.TagEffectLabel")}</b></label>
                </td>
                <td>
                    <input type="text"
                        id={tag.tagEffect}
                        bind:value="{tags[i].tagEffect}">
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<div style="text-align:center;">
    <div style="margin:auto;">
        <button title='{localize("ASE.AddTagButtonTooltip")}' on:click={addTag}>
            {localize("ASE.AddTagButtonLabel")}
        </button>

        <button title='{localize("ASE.RemoveTagButtonTooltip")}' on:click={removeTag}>
            <i class="fas fa-times"></i> {localize("ASE.RemoveTagButtonLabel")}
        </button>
    </div>
</div>