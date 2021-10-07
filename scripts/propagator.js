/* theripper93
 * Copyright (C) 2021 dnd-randomizer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * Original License: 
 * https://github.com/theripper93/dnd-randomizer/blob/master/LICENSE
 */

/* WARPGATE CHANGES
 * exporting propagator class
 * removed test function from original code
 */

export class Propagator{
    // Find a non occupid cell in the grid that matches the size of the token given an origin
    static getFreePosition(tokenData,origin, collision = true){
        const center = canvas.grid.getCenter(origin.x,origin.y)
        origin = {x:center[0],y:center[1]};
        const positions = Propagator.generatePositions(origin);
        console.log("Generated Positions: ",positions);
        for(let position of positions){
            if(Propagator.canFit(tokenData, position, positions[0], collision)){
                return position;
            }
        }

    }
    //generate positions radiantially from the origin
    static generatePositions(origin){
        let positions = [canvas.grid.getSnappedPosition(origin.x-1,origin.y-1)];
        for(let r = canvas.scene.dimensions.size; r < canvas.scene.dimensions.size*2; r+=canvas.scene.dimensions.size){

            for(let theta = 0; theta < 2*Math.PI; theta+=Math.PI/(4*r/canvas.scene.dimensions.size)){
                const newPos = canvas.grid.getTopLeft(origin.x + r*Math.cos(theta),origin.y + r*Math.sin(theta))
                positions.push({x:newPos[0],y:newPos[1]});
            }
        }
        return positions;
    }
    //check if a position is free
    static isFree(position){
        console.log(`Checking if position {${position.x}, ${position.y}} is free...`);
        for(let token of canvas.tokens.placeables){
            const hitBox = new PIXI.Rectangle(token.x,token.y,token.w,token.h);
            console.log("Checking hitbox...", hitBox);
            if(hitBox.contains(position.x,position.y)){
                console.log("Not free...Checking next position");
                return false;
            }
        }
        console.log("Free!");
        return true;
    }
    //check if a token can fit in a position
    static canFit(tokenData, position, origin, collision){
        for(let i = 0; i < tokenData.width; i++){
            for(let j = 0; j < tokenData.height; j++){
                const x = position.x + j*canvas.scene.dimensions.size;
                const y = position.y + i*canvas.scene.dimensions.size;
                if(!Propagator.isFree({x,y})){
                    return false;
                }
            }
        }
        return !collision || !canvas.walls.checkCollision(new Ray(origin, {x:position.x+tokenData.width*canvas.scene.dimensions.size/2,y:position.y+tokenData.height*canvas.scene.dimensions.size/2}));
    }
}
