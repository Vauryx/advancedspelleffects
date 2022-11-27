<svelte:options accessors={true}/>


<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";
  import { getContext, onDestroy } from "svelte";

  import { AnimateDeadSequence } from "../sequences/AnimateDeadSequence.js";

  export let elementRoot;
  export let corpses;
  export let raiseLimit;
  export let effectSettings;

  let raisesLeft = raiseLimit;

  const { application } = getContext("external");
  let form = void 0;

  console.log("Animate Dead App Shell: ------ Entering App Shell -------");
  console.log("Animate Dead App Shell: corpses: ", corpses);
  console.log("Animate Dead App Shell: raiseLimit: ", raiseLimit);
  console.log("Animate Dead App Shell: effectSettings: ", effectSettings);

  onDestroy(async () => {
    console.log('the component is being destroyed...');
  });

  async function raiseCorpse(corpse, type) {
    console.log(`Animate Dead App Shell: Raising ${corpse.name ?? 'body'}as ${type}: `, corpse);

    raisesLeft--;
    corpses.splice(corpses.indexOf(corpse), 1);
    corpses = corpses;

    let zombieTokenData = (await game.actors.get(effectSettings.zombieActor).getTokenDocument()).toObject();
    let skeletonTokenData = (await game.actors.get(effectSettings.skeletonActor).getTokenDocument()).toObject();

    if (!zombieTokenData || !skeletonTokenData) {
      ui.notifications.error(game.i18n.localize("ASE.AssociatedActorNotFoundNotification"));
      console.log("Animate Dead App Shell: ERROR: Zombie or Skeleton Token Data not found!, Check spell Settings to ensure the actors are set up");
      if (raisesLeft <= 0 || corpses.length === 0) {
        console.log("Animate Dead App Shell: All raises used up, closing app...");
        application.close();
      }
      return;
    }

    delete zombieTokenData.x;
    delete zombieTokenData.y;
    delete skeletonTokenData.x;
    delete skeletonTokenData.y;
    zombieTokenData = mergeObject(corpse.document.toObject(), zombieTokenData, { inplace: false });
    skeletonTokenData = mergeObject(corpse.document.toObject(), skeletonTokenData, { inplace: false });

    let effectSequence;

    switch (type) {
      case "zombie":
        effectSequence = await AnimateDeadSequence(effectSettings, corpse, zombieTokenData);
        break;
      case "skeleton":
        effectSequence = await AnimateDeadSequence(effectSettings, corpse, skeletonTokenData);
        break;
    }
    console.log("Animate Dead App Shell: effectSequence: ", effectSequence);
    effectSequence.play();
    if (raisesLeft <= 0 || corpses.length === 0) {
      console.log("Animate Dead App Shell: All raises used up, closing app...");
      application.close();
    }
  }
</script>

<ApplicationShell
  bind:elementRoot>
  <form
    bind:this={form}
    on:submit|preventDefault
    autocomplete="off"
    id="animte-dead-shell"
    class="overview">
    <section class="content">
      <p>{localize("ASE.AnimateDeadDialogRaiseMessage")} {raisesLeft}</p>
      <table style="width:100%;">
        <tbody>
        <tr>
          <th>{localize("ASE.AnimateDeadDialogHeaderCorpse")}</th>
          <th>{localize("ASE.AnimateDeadDialogHeaderRaise")}</th>
        </tr>
        {#each corpses as corpse (corpse.id)}
          <tr class='corpseToken'
              id={corpse.id}
              on:mouseenter="{corpse._onHoverIn()}"
              on:mouseleave="{corpse._onHoverOut()}"
          >
            <td>
              <img src="{corpse.document.texture.src}" width="30" height="30" style="border:0;" alt="Token"> - {corpse.name}
            </td>
            <td>
              <button id="{corpse.id}-zombie"
                      on:click={raiseCorpse(corpse,"zombie")}>{localize("ASE.ZombieLabel")}</button>
            </td>
            <td>
              <button id="{corpse.id}-skeleton"
                      on:click={raiseCorpse(corpse, "skeleton")}>{localize("ASE.SkeletonLabel")}</button>
            </td>
          </tr>
        {/each}
        </tbody>
      </table>
    </section>
  </form>
</ApplicationShell>
