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

Fog Cloud (Size of cloud increases with spell level - The template that you place down however will remain a 20 ft template for now)
optional: wallNumber is the number of desired walls around the edge of the tile. Default is 12, minimum 10 is recommended. 
```javascript
  game.AdvancedSpellEffects.fogCloudWithWalls(args,wallNumber);
```

Darkness (The associated walls will move with the darkness tile)
optional: wallNumber is the number of desired walls around the edge of the tile. Default is 12, minimum 10 is recommended. 
```javascript
  game.AdvancedSpellEffects.darknessWithWalls(args, wallNumber)
```
