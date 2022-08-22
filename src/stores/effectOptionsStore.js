import { localize }           from "@typhonjs-fvtt/runtime/svelte/helper";
import { ArrayObjectStore }   from "@typhonjs-fvtt/svelte-standard/store";

import { spellStore } from "./spellStore.js";

import * as spells from '../spells';
/**
 * Provides a Svelte store for all spells.
 *
 * @template {EffectEntryStore} T
 */
export class EffectOptionsStore extends ArrayObjectStore {
   constructor() {
      super({ StoreClass: EffectEntryStore });
   }

  async initialize() {
     let flagData = {};
      if (this.length > 0) { throw new Error(`SpellStore has already been initialized.`); }

      for (const spell of Object.entries(spells)) {
        console.log(spell);
         let settings = await spell.getRequiredSettings();
         console.log(settings);
            for (const settingType of Object.entries(settings)) {
               //console.log(settingType);
               for (const setting of settingType[1]) {
                   //console.log(setting);
                   this.createEntry({
                       name: setting.flagName,
                       effect: setting.flagValue
                   });
               }
           }
         // If there is a static registerHooks; invoke it now.
         if (typeof effect.registerHooks === 'function') { effect.registerHooks(); }



         // Add spell data to ArrayObjectStore.
         this.createEntry({
            name: localize(`ASE.${name[0].toUpperCase()}${name.substring(1)}`),
            effect
         });
      }
   }
}

class EffectEntryStore extends EffectOptionsStore.EntryStore {
   constructor(data = {}) {
      super(data);
   }

  /**
    * @returns {string} The localized spell name.
    */
   get name() { return this._data.name; }

   /**
    * @returns {new (data: object) => object} The spell constructor function.
    */
   get effect() { return this._data.effect; }

   /**
    * @returns {new (data: object) => object; }
    */
   get flagData() { return this._data.flags; }

   /**
    * Static getRequiredSettings function from effect class.
    *
    * @returns {(currFlags: object) => SpellSettingsData}
    */
   get getRequiredSettings() { return this._data.effect.getRequiredSettings; }

   /**
    * ArrayObjectStore requires writable stores for entry data; since the entries are static this is a 'noop'
    * @param {object}   data -
    */
   set(data) { /* noop */ }
}

export const effectOptionsStore = new EffectOptionsStore();

