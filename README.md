Spell effects can be called from a macro using the command: 
```javascript 
game.AdvancedSpellEffects.${spell name}(args)
```
inside a macro being called from the "OnUseMacro" field of MIDI-QOL

List of currently avaiable spells: 

Detect Magic
```javascript
  game.AdvancedSpellEffects.detectMagic(args);
```

Detect Magic (Always on while in range)
```javascript
  game.AdvancedSpellEffects.detectMagicRecursive(args);
```

To turn the effect off run this macro with the casting token selected - eventually this will be done automatically via a DAE effect
```javascript
let tokenD = canvas.tokens.controlled[0];
let objects = await Tagger.getByTag("magical", { ignore: [tokenD] });
let magicalSchools = Object.values(CONFIG.DND5E.spellSchools).map(school => school.toLowerCase());
let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
let detectMagicHookId = await tokenD.document.getFlag("world","detectMagicHookId");
Hooks.off("updateToken", detectMagicHookId);
await TokenMagic.deleteFilters(tokenD, "detectMagicGlow");
await tokenD.document.setFlag("world","detectMagicHookId", -1);
let magicalObjects = [];

magicalObjects = objects.map(o => {
                    let distance = canvas.grid.measureDistance(tokenD, o);
                    return {
                        delay: 0,
                        distance: distance,
                        obj: o,
                        school: Tagger.getTags(o).find(t => magicalSchools.includes(t.toLowerCase())) || false,
                        color: Tagger.getTags(o).find(t => magicalColors.includes(t.toLowerCase())) || "blue"
                    }
                })
                for (let magical of magicalObjects) {
                    if (!magical.school) {
                        continue;
                    }
                    await magical.obj.document.setFlag("world", "runeLooping", false);
                }
```

Fog Cloud (Size of cloud increases with spell level - The template that you place down however will remain a 20 ft template for now)
optional: wallNumber is the number of desired walls around the edge of the tile. Default is 12, minimum 10 is recommended. 
```javascript
  game.AdvancedSpellEffects.fogCloudWithWalls(args,wallNumber);
```

Darkness (The associated walls will move with the darkness tile)

```javascript
  game.AdvancedSpellEffects.darknessWithWalls(args)
```

Toll The Dead
```javascript
game.AdvancedSpellEffects.tollTheDead(args);
```