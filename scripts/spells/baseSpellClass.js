export default class baseSpellClass {
    static registerHooks() {}
    static async getRequiredSettings() {
        return {
            animOptions: [],
            spellOptions: [],
            soundOptions: [],
        }
    }
}