import { Injectable } from "@angular/core";
import { StoreService } from "./stores";
import { Game } from "src/app/shared/models/game.model";
import { Word, CardType } from "src/app/shared/models/word.model";
import { WORD_COUNT } from "./dictionary.store";
import * as seedrandom from "seedrandom";

@Injectable({ providedIn: "root" })
export class GamesStore extends StoreService<Game> {
  all_ids: number[] = [];
  constructor() {
    super();
    this.all_ids = [...Array(WORD_COUNT).keys()];
  }

  public createNew(gameId: string, isLocalCodeMaster: boolean): void {
    this.next(this.createGameFor(gameId, isLocalCodeMaster));
  }

  private createGameFor(gameId: string, isLocalCodeMaster: boolean): Game {
    const game = new Game(gameId, isLocalCodeMaster);
    this.generateIds(game);
    return game;
  }

  private generateIds(game: Game, count: number = 25): void {
    // should be deterministic so reset state to sorted
    this.all_ids.sort();

    // shuffle all ids by given seed
    seedrandom(game.seed, { global: true });
    this.shuffle(this.all_ids, count);
    for (let i = 0; i < count; i++) {
      game.words.push(new Word(this.all_ids[i], this.cardType(i)));
    }

    this.shuffle(game.words, count); // additional shuffle for mixing up the card types
  }

  private nextNumber(max: number): number {
    return Math.floor(Math.random() * max);
  }

  /**
   * 8 cards => BLUE
   * 8 cards => RED
   * 1 card => RANDOM(BLUE, RED)
   * 1 card => DEATH
   * rest => NEUTRAL
   *
   * @param ix indicating the (ix)th card
   * @returns the type for the (ix)th card
   */
  private cardType(ix: number): CardType {
    if (ix < 8) {
      return CardType.BLUE;
    }
    ix -= 8;
    if (ix < 8) {
      return CardType.RED;
    }
    ix -= 8;
    if (ix === 0) {
      return this.nextNumber(2) === 0 ? CardType.BLUE : CardType.RED;
    }
    return ix === 1 ? CardType.DEATH : CardType.NEUTRAL;
  }

  // shuffles array in place
  private shuffle<T>(arr: T[], firstN: number = 25): void {
    if (arr.length < firstN) {
      // accept to be greater, not going to be in our case
      firstN = arr.length;
    }
    // actual shuffle
    for (let i = 0; i < firstN; i++) {
      const pick = i + this.nextNumber(arr.length - i);
      // And swap it with the current element.
      const tmp = arr[i];
      arr[i] = arr[pick];
      arr[pick] = tmp;
    }
  }
}
