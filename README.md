# Advanced Spell Effects

## Usage Instructions
Spell effects can be called from a macro generally using the command: 
```javascript 
game.AdvancedSpellEffects.${spell name}(options)
```
options should be an object structured like this: 
{version: "Version Name", arguments...}
### Possible versions are: 
* "MIDI" 
* "ItemMacro"
The arguments will depend on the spell and version you are using.

## Currently available spells
The currently available spells, their versions and how to call them are outlined below.

List of currently avaiable spells: 

### Darkness:
- In both cases for this spell, make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type"
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args};
game.AdvancedSpellEffects.darkness(options);
```
#### *Item Macro*
```javascript
let options = {version: "ItemMacro", itemId: item.id, tokenId: token.id};
game.AdvancedSpellEffects.darkness(options);
```
### Detect Magic:
- In both cases for this spell, make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type"
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args};
game.AdvancedSpellEffects.detectMagic(options);
```
#### *Item Macro*
```javascript
let options = {version: "ItemMacro", itemId: item.id, tokenId: token.id};
game.AdvancedSpellEffects.detectMagic(options);
```

### Fog Cloud:
- Make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type"
- "numberWalls" is how many walls to place down *per spell level*. This means that at 12, the spell will place 12 walls for a fog wall cast at 1st level. and 24 for one cast at second level. 12 is recommended, minimum 6 should be used.
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args, "numberWalls": 12};
game.AdvancedSpellEffects.fogCloud(options);
```

