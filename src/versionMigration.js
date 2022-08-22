export const versionMigration = {
    async handle(item) {

        let spellList = {};
        spellList[game.i18n.localize("ASE.AnimateDead")] = game.i18n.localize("ASE.AnimateDead");
        spellList[game.i18n.localize("ASE.CallLightning")] = game.i18n.localize("ASE.CallLightning");
        spellList[game.i18n.localize("ASE.DetectMagic")] = game.i18n.localize("ASE.DetectMagic");
        spellList[game.i18n.localize("ASE.FogCloud")] = game.i18n.localize("ASE.FogCloud");
        spellList[game.i18n.localize("ASE.Darkness")] = game.i18n.localize("ASE.Darkness");
        spellList[game.i18n.localize("ASE.MagicMissile")] = game.i18n.localize("ASE.MagicMissile");
        spellList[game.i18n.localize("ASE.SpiritualWeapon")] = game.i18n.localize("ASE.SpiritualWeapon");
        spellList[game.i18n.localize("ASE.SteelWindStrike")] = game.i18n.localize("ASE.SteelWindStrike");
        spellList[game.i18n.localize("ASE.ThunderStep")] = game.i18n.localize("ASE.ThunderStep");
        spellList[game.i18n.localize("ASE.WitchBolt")] = game.i18n.localize("ASE.WitchBolt");
        spellList[game.i18n.localize("ASE.ScorchingRay")] = game.i18n.localize("ASE.ScorchingRay");
        spellList[game.i18n.localize("ASE.EldritchBlast")] = game.i18n.localize("ASE.EldritchBlast");
        spellList[game.i18n.localize("ASE.VampiricTouch")] = game.i18n.localize("ASE.VampiricTouch");
        spellList[game.i18n.localize("ASE.Moonbeam")] = game.i18n.localize("ASE.Moonbeam");
        spellList[game.i18n.localize("ASE.ChainLightning")] = game.i18n.localize("ASE.ChainLightning");
        spellList[game.i18n.localize("ASE.MirrorImage")] = game.i18n.localize("ASE.MirrorImage");
        let flags = item?.data?.flags?.advancedspelleffects ?? false;
        console.log("flags", flags);
        if (!flags) return;
        if (!flags.enableASE) return;
        if(flags.effectOptions.tagOptions){
            //if flags.tagOptions is not an array, convert to array of objects with key as index
            if(!Array.isArray(flags.effectOptions.tagOptions)){
                let newTagOptions = [];
                for(let key in flags.effectOptions.tagOptions){
                    newTagOptions.push({key: flags.effectOptions.tagOptions[key]});
                }
                await item.setFlag("advancedspelleffects", "effectOptions.tagOptions", newTagOptions);
            }
        }
        console.log('Done migrating flags for old spell...');
    }
};