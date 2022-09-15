export const versionMigration = {
    async MigrateV1() {
        game.scenes.forEach(scene => 
            scene.tokens.forEach(token => {
                let items = Array.from(token.actor.items);
                console.log(`Items On ${token.name}: `, items);
            }
            )
        )
    }
};