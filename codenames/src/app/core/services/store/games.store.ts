import { Injectable } from "@angular/core";
import { tap, filter, map } from "rxjs/operators";
import { StoreService, Store } from "./stores";
import { Game } from "src/app/shared/models/game.model";
import { Word, CardType } from "src/app/shared/models/word.model";
import { DictionaryStore } from "./dictionary.store";
import * as seedrandom from "seedrandom";

@Injectable({ providedIn: "root" })
export class GamesStore extends StoreService<Game> {
  constructor(private dictionaryStore: DictionaryStore) {
    super();
  }

  public createNew(gameId: string, isLocalCodeMaster: boolean): void {
    this.setStateFetching();
    this.dictionaryStore.store$
      .pipe(
        filter(
          (data: Store<string[]>) =>
            !data.error && !data.isFetching && data.data !== null
        ),
        map((data: Store<string[]>) => data.data),
        tap((data: string[]) =>
          this.next(this.createGameFor(gameId, isLocalCodeMaster, data))
        )
      )
      .subscribe();
  }

  private createGameFor(
    gameId: string,
    isLocalCodeMaster: boolean,
    words: string[]
  ): Game {
    const game = new Game(gameId, isLocalCodeMaster);
    this.addWords(game, words);
    return game;
  }

  private addWords(game: Game, fromWords: string[], count: number = 25): void {
    seedrandom(game.seed, { global: true });
    const shuffled = [];
    shuffled.push(...fromWords);
    this.shuffle(fromWords, count);
    for (let i = 0; i < count; i++) {
      game.words.push(new Word(fromWords[i], this.cardType(i)));
    }
    this.shuffle(game.words, count);
    console.log(game.seed, game.words);
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

  private shuffle<T>(arr: T[], firstN: number = 25) {
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
