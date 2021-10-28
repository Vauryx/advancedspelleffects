// Magic Missile spell
export class magicMissile {
    static async launch(midiData){
        const casterActor = midiData.actor;
        const casterToken = canvas.tokens.get(midiData.tokenId);
        const numMissiles = midiData.itemLevel + 2;
        if (midiData.targets.length == 1){
            let target = midiData.targets[0];
            let damageRoll = new Roll(`${numMissiles}d4 + ${numMissiles}`);
        }
    }
}