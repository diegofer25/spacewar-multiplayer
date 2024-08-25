import { Schema, Context, type, MapSchema } from "@colyseus/schema";
import { Spaceship } from "./Spaceship";
import { PowerUp } from "./PowerUp";

export class GameState extends Schema {
  @type("number") mapSize = 2000;
  @type({ map: Spaceship }) spaceships = new MapSchema<Spaceship>();
  @type({ map: PowerUp }) powerUps = new MapSchema<PowerUp>();
}
