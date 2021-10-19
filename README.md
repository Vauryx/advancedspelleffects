# Advanced Spell Effects

## This module requires the following modules to fully function
- JB2A (Patreon Version)
- Sequencer
- Warpgate
- MIDI-QOL
- Advanced Macros
- SocketLib
- Tagger

## Usage Instructions
Eligible spells will display an "ASE" tab at the top of the item - this can be used to convert a spell to an ASE spell like shown in the example video below.
- Make sure the name of the spell is exactly correct or the "ASE" tab will not be visible.
- CONVERTING THE SPELL WILL CHANGE CERTAIN DATA ON THE ITEM ITSELF INCLUDING IT'S ITEM MACRO - ONLY CONVERT A SPELL THAT YOU DO NOT CARE ABOUT BEING OVERWRITTEN

https://user-images.githubusercontent.com/32877348/136321401-f3b6467e-30b1-487e-baf5-b2bde6e8f59c.mp4


## Currently available spells
The currently available spells are outlined below. 

There is a compendium that includes some of the spells pre-configured called "Advanced Spell Effects - MIDI Spells".

List of currently avaiable spells:

### Animate Dead:
![animate-dead-settings](https://user-images.githubusercontent.com/32877348/137574620-aa562d2b-0dbb-419e-a413-0c1c98a2f85a.png)
![animate-dead-demov2](https://user-images.githubusercontent.com/32877348/137574840-67bec1e0-3c53-4a3f-9784-6e30434418a7.gif)

### Darkness:
https://user-images.githubusercontent.com/32877348/134225849-22115c32-5a6e-47d5-93aa-5c429d3ee9a5.mp4

### Detect Magic:
https://user-images.githubusercontent.com/32877348/134227634-627435b0-0c0b-4899-9125-5ee373aae4da.mp4

### Fog Cloud:
https://user-images.githubusercontent.com/32877348/134228908-1d833634-2571-46ac-83aa-4373508612dd.mp4

### Steel Wind Strike:
https://user-images.githubusercontent.com/32877348/136321419-d5c4ee90-2aed-4cb5-9999-12b4e9194387.mp4

### Thunder Step:
https://user-images.githubusercontent.com/32877348/134231083-7f34c364-fa93-4e13-aaba-20c2bea9a925.mp4

### Call Lightning:
https://user-images.githubusercontent.com/32877348/134980507-710b9c41-cf61-40f1-ab46-c725cdffa0dc.mp4

### Spiritual Weapon
- There must be an actor in your actors directory called "Spiritual Weapon", with an attack action already on the actor like shown below.

https://user-images.githubusercontent.com/32877348/134981937-bdb3b361-d5e3-48f6-abce-4ccf6f8d141e.mp4

![spiritual-weapon-actor-abilites](https://user-images.githubusercontent.com/32877348/137159698-2050736b-5a47-4b43-af8a-8450638a0ed8.png)
![spiritual-weapon-attack-details](https://user-images.githubusercontent.com/32877348/137159712-efb603e8-d6a2-4b42-a09d-1de381a52471.png)


### Summon Creature
- Any spell with "Summon" in the name is eligible.
- You must have a folder of actors called "ASE-Summons" which must contain the actors that you wish to use for the summons.
- What can be summoned is set in the ASE settings for the spell.
- When the spell is cast, a prompt will be displayed with the types defined previously. 

![summon-creature-settings](https://user-images.githubusercontent.com/32877348/137860669-6949b85e-b36a-48d2-8461-7a130a43a0cb.png)
![summon-creature-folder](https://user-images.githubusercontent.com/32877348/137201659-29796792-b71f-4a00-b266-f16897a8305e.png)

![summon-creature-demo](https://user-images.githubusercontent.com/32877348/137860726-30ceb7f7-c222-455c-bd12-71a912c2bf9e.gif)

##### Contributions - 
- I want to take an opportunity here to thank HoneyBadger and Wasp - The Sequencer Guy for their never-ending reservoir of help and advice for a new dev. This module only exists thanks to them and others who've contributed their time or their code!
- Warpgate code used with permission for free re-use by Matthew Haentschke
https://github.com/trioderegion/warpgate
 - Huge thanks to siliconsaint as well for contributing his spiritual weapon macro for this module.

