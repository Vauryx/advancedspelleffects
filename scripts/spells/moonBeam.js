export class moonBeam {
    static registerHooks() {
        return;
    }
    static async callBeam(data) {
        const casterActor = data.actor;
        const casterToken = canvas.tokens.get(data.tokenId);
        const itemCardId = data.itemCardId;
        const spellItem = data.item;
        const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
        console.log(aseEffectOptions);
        const beamIntro = `jb2a.moonbeam.01.intro.${aseEffectOptions.moonbeamColor}`;
        const beamOutro = `jb2a.moonbeam.01.outro.${aseEffectOptions.moonbeamColor}`;
        const beamLoop = `jb2a.moonbeam.01.loop.${aseEffectOptions.moonbeamColor}`;

        let moonbeamLoc = await placeBeam();
        let beamSeq = new Sequence("Advanced Spell Effects")
            .effect()
            .file(beamIntro)
            .atLocation(moonbeamLoc)
            .scale(0.5)
            .waitUntilFinished(-1500)
            .effect()
            .file(beamLoop)
            .fadeIn(1500)
            .fadeOut(500)
            .atLocation(moonbeamLoc)
            .scale(0.5)
            .persist()
            .name('ase-moonbeam')
            .waitUntilFinished(-500)
            .effect()
            .file(beamOutro)
            .atLocation(moonbeamLoc)
            .scale(0.5)
        beamSeq.play();

        const updates = {
            embedded: {
                Item: {
                    "Move Moonbeam": {
                        "type": "spell",
                        "img": spellItem.img,
                        "data": {
                            "ability": "",
                            "actionType": "other",
                            "activation": { "type": 'action', "cost": 1 },
                            "damage": { "parts": [], "versatile": "" },
                            "level": data.itemLevel,
                            "preparation": { "mode": 'atwill', "prepared": true },
                            "range": { "value": null, "long": null, "units": "" },
                            "school": "nec",
                            "target": { "value": 1, "type": 'creature' },
                            "description": {
                                "value": "The touch of your shadow-wreathed hand can siphon force from others to heal your wounds."
                            }
                        },
                        "flags": {"advancedspelleffects": {
                            "enableASE": true,
                            'effectOptions': {
                                'vtStrandColor': effectOptions.vtStrandColor,
                                'vtImpactColor': effectOptions.vtImpactColor
                            }}}
                    }
                }
            }
        }

       async function placeBeam() {
            const displayCrosshairs = async (crosshairs) => {
                new Sequence("Advanced Spell Effects")
                    .effect()
                    .file(beamLoop)
                    .attachTo(crosshairs)
                    .persist()
                    .scale(0.5)
                    .opacity(0.5)
                    .play()

            }
            let crosshairsConfig = {
                size: 2,
                icon: spellItem.img,
                label: 'Moonbeam',
                tag: 'moonbeam-crosshairs',
                drawIcon: false,
                drawOutline: false,
                interval: 1
            }
            let placedLoc = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
            return placedLoc;
        }
    }
}