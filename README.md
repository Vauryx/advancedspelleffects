Spell effects can be called from a macro using the command: 
```javascript 
game.AdvancedSpellEffects.${spell name}(options)
```
options should be an object structured like this: 
{version: "", arguments...}

Possible versions are: 
"MIDI", "ItemMacro"
The arguments will depend on the spell and version you are using.


The currently available spells, their versions and how to call them are outlined below.

List of currently avaiable spells: 

Darkness (ItemMacro Version):

```javascript
let options = {"version": "ItemMacro", "itemId": item.id, "tokenId": token.id};
game.AdvancedSpellEffects.darkness(options);
```