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

There is a compendium that includes MIDI versions of the spells pre-configured called "Advanced Spell Effects - MIDI Spells".

Each of the provided macro calls should be palced in the item's ItemMacro field regardless of whether the MIDI or Item Macro Only version is benig used.

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
https://user-images.githubusercontent.com/32877348/134225849-22115c32-5a6e-47d5-93aa-5c429d3ee9a5.mp4

![darkness-details](https://user-images.githubusercontent.com/32877348/134226695-8f090d75-1faa-414a-a834-04e98d631dd6.png)
![darkness-itemMacro](https://user-images.githubusercontent.com/32877348/134226711-e3e9606b-b14f-403a-9036-6b0a0d3cc517.png)

### Detect Magic:
- In both cases for this spell, make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type"
- This spell uses the Tagger module to determine what is magical. Set the 'magical' tag on anything you want the spell to ping. Further Customization can be done by adding a magical school tag as well as a color tag.
- An optional 'waveColor' and 'auraColor' property can be set for the options object that can change the color of the wave/aura of detect magic respectively.
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args, waveColor: "blue", auraColor: "blue"};
game.AdvancedSpellEffects.detectMagic(options);
```
#### *Item Macro*
```javascript
let options = {version: "ItemMacro", itemId: item.id, tokenId: token.id, waveColor: "blue", auraColor: "blue"};
game.AdvancedSpellEffects.detectMagic(options);
```
https://user-images.githubusercontent.com/32877348/134227634-627435b0-0c0b-4899-9125-5ee373aae4da.mp4

![detect-magic-details](https://user-images.githubusercontent.com/32877348/134227648-c938a968-a0b4-4ce8-8cd1-95fd969af611.png)
### Fog Cloud:
- Make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type"
- "numberWalls" is how many walls to place down *per spell level*. This means that at 12, the spell will place 12 walls for a fog wall cast at 1st level. and 24 for one cast at second level. 12 is recommended, minimum 6 should be used.
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args, "numberWalls": 12};
game.AdvancedSpellEffects.fogCloud(options);
```
https://user-images.githubusercontent.com/32877348/134228908-1d833634-2571-46ac-83aa-4373508612dd.mp4

![fog-cloud-details](https://user-images.githubusercontent.com/32877348/134228918-cdc65437-b654-4ee6-9dde-7644b8d97924.png)

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
https://user-images.githubusercontent.com/32877348/134230307-a0d0ba98-59be-46bd-81ae-8e043db8166c.mp4

![steel-wind-strike-details](https://user-images.githubusercontent.com/32877348/134229571-76f42ab0-3da6-4617-8231-de030d096b43.png)


### Thunder Step:
- Make sure to remove the range/target from the spell and to use "Utility/Other" for the "Action Type" 
- Also make sure to remove any damage forumla on the spell as the spell will roll an attack and damage for target as it goes through them. 
#### *MIDI*
```javascript
let options = {version: "MIDI", args: args};
game.AdvancedSpellEffects.thunderStep(options);
```
https://user-images.githubusercontent.com/32877348/134231083-7f34c364-fa93-4e13-aaba-20c2bea9a925.mp4

![thunder-step-details](https://user-images.githubusercontent.com/32877348/134231109-02af38d6-9149-494c-8a29-3b4271a089c0.png)
