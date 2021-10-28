import { aseSocket } from "../aseSockets.js";
export class chaosBolt {
    static registerHooks() {
    }
    static async createBolt(midiData) {
        function easeOutElasticCustom(x) {
            const c4 = (2 * Math.PI) / 10;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -12 * x) * Math.sin((x * 12 - 0.75) * c4) + 1;
        }
        Sequencer.registerEase("easeOutElasticCustom", easeOutElasticCustom);
        let casterActor = midiData.actor;
        let target = Array.from(midiData.targets)[0];
        let caster = canvas.tokens.get(midiData.tokenId);
        let initialMassPath = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/Multicoloured/FlamingSphere_01_Rainbow_Thumb.webp";
        let createdTiles = await placeBoltAsTile(caster, initialMassPath);
        let chaosBoltTile = createdTiles[0];
        console.log(chaosBoltTile);
        let tmfXInitialParams =
        [{
            filterType: "distortion",
            filterId: "chaosBoltdistortion",
            maskPath: "modules/tokenmagic/fx/assets/distortion-1.png",
            maskSpriteScaleX: 5,
            maskSpriteScaleY: 5,
            padding: 20,
            animated:
            {
                maskSpriteX: { active: true, speed: 0.1, animType: "move" },
                maskSpriteY: { active: true, speed: 0.3, animType: "move" }
            }
        },
        {
            filterType: "distortion",
            filterId: "chaosBoltdistortion2",
            maskPath: "modules/tokenmagic/fx/assets/distortion-1.png",
            maskSpriteScaleX: 75,
            maskSpriteScaleY: 5,
            padding: 20,
            animated:
            {
                maskSpriteX: { active: true, speed: 0.01, animType: "move" },
                maskSpriteY: { active: true, speed: 0.03, animType: "move" }
            }
        },
        {
            filterType: "liquid",
            filterId: "chaosBoltSpectral",
            color: 0x20AAEE,
            time: 0,
            blend: 2,
            intensity: 2,
            spectral: true,
            scale: 0.9,
            animated :
            {
               time : 
               { 
                  active: true, 
                  speed: 0.0010, 
                  animType: "move" 
               },
               color: 
               {
                  active: true, 
                  loopDuration: 12000, 
                  animType: "colorOscillation", 
                  val1:0xff0000, 
                  val2:0x00FF00
               }
            }
        }];
        await TokenMagic.addUpdateFilters(chaosBoltTile.object, tmfXInitialParams);
        new Sequence("Advanced Spell Effects")
            .animation()
            .on(chaosBoltTile)
            .fadeIn(1000)
            .opacity(1)
        .play() 
        let typeData = [{
            type: "select",
            label: "Damage Type",
            options: ["Acid", "Cold", "Fire", "Force", "Lightning", "Poison", "Psychic", "Thunder"]
        }]
        let damageType = await warpgate.dialog(typeData);
        let newImage;
        console.log(damageType);
        switch(damageType[0]){
            case "Acid":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Green_Thumb.webp";
                break;
            case "Cold":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Blue_Thumb.webp";
                break;
            case "Fire":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Red_200x200.webm";
                break;
            case "Force":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Purple_Thumb.webp";
                break;
            case "Lightning":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Yellow_Thumb.webp";
                break;
            case "Poison":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Orange_Thumb.webp";
                break;
            case "Psychic":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Pink_Thumb.webp";
                break;
            case "Thunder":
                newImage = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_01_Blue_Thumb.webp";
                break;
        }
        console.log(newImage);
        let distance = Math.sqrt(Math.pow((target.x - caster.x), 2) + Math.pow((target.y - caster.y), 2));
        let newChaosBolt = await placeBoltAsTile(caster, newImage);
        newChaosBolt = newChaosBolt[0];
        await TokenMagic.addUpdateFilters(newChaosBolt.object, tmfXInitialParams);
        await new Sequence("Advanced Spell Effects")
            .animation()
            .on(chaosBoltTile)
            .fadeOut(1000)
            .animation()
            .on(newChaosBolt)
            .fadeIn(1000)
            .opacity(1)
            .waitUntilFinished()
            .thenDo(async()=>{
                await TokenMagic.deleteFilters(chaosBoltTile.object);
                await aseSocket.executeAsGM("deleteTiles", [chaosBoltTile.id]);
            })
            .animation()
            .on(newChaosBolt)
            .moveTowards(target, { ease: "easeOutElasticCustom" })
            .moveSpeed(distance / 60)
            .duration(800)

        .play() 
        
        async function placeBoltAsTile(caster, imgPath) {
            let tileWidth;
            let tileHeight;
            let tileX;
            let tileY;
            let placedX = caster.x;
            let placedY = caster.y;
            tileWidth = (caster.w);
            tileHeight = (caster.w);
            tileX = caster.x;
            tileY = caster.y;
            data = [{
                alpha: 0,
                width: tileWidth,
                height: tileHeight,
                img: imgPath,
                overhead: true,
                occlusion: {
                    alpha: 0,
                    mode: 0,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tileX,
                y: tileY,
                z: 100,
                flags: { tagger: { tags: [`chaosBoltTile-${caster.document.id}`] } }
            }]
            let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
            return createdTiles;
        }
    }
}