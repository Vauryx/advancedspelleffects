# Advanced Spell Effects

## Usage Instructions
Spell effects can be called from a macro generally using the command: 
```javascript 
game.AdvancedSpellEffects.spellName(options)
```
"options" should be an object structured like this: 
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
- This spell uses the Tagger module to determine what is magical. Set the 'magical' tag on anything you want the spell to ping. Further Customization can be done by adding a magical school tag as well as a color tag.
- An optional 'color' property can be set for the options object that can change the color of wave of detect magic.
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args, color: 'blue'};
game.AdvancedSpellEffects.detectMagic(options);
```
#### *Item Macro*
```javascript
let options = {version: "ItemMacro", itemId: item.id, tokenId: token.id, , color: 'blue'};
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

### Steel Wind Strike:
- Make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type" 
- Also make sure to remove any damage forumla on the spell as the spell will roll an attack and damage for target as it goes through them. 

- A "weapon" and "color" option must be set in the options object for this spell. 
- The available weapon options are: 
    ######  "sword","mace","greataxe","greatsword","handaxe","spear","dagger"
- The available colors are any colors for the selected weapon in the JB2A library.
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args, weapon: "weapon", color: "color"};
game.AdvancedSpellEffects.steelWindStrike(options);
```
