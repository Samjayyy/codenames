import { Component, OnInit, OnDestroy } from "@angular/core";
import { Word, CardType } from "src/app/shared/models/word.model";
import { Game } from "src/app/shared/models/game.model";
import { GamesStore } from "src/app/core/services/store/games.store";
import { combineLatest, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Router } from "@angular/router";
import { DictionaryStore } from "src/app/core/services/store/dictionary.store";

@Component({
  selector: "app-play-game",
  templateUrl: "./play-game.component.html",
  styleUrls: ["./play-game.component.scss"],
})
export class PlayGameComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  public game: Game = null;
  public error?: string = null;
  public isFetching = true;
  public dict: string[] = [];

  constructor(
    private gameStore: GamesStore,
    private dictionaryStore: DictionaryStore,
    private router: Router
  ) {}

  ngOnInit() {
    combineLatest([this.gameStore.store$, this.dictionaryStore.store$])
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(([gameStore, dictionaryStore]) => {
        // handle game data
        if (gameStore.data) {
          this.game = gameStore.data;
        } else if (!gameStore.isFetching && !gameStore.error) {
          this.router.navigate(["/"]);
        }
        // dictionary data
        if (dictionaryStore.data) {
          this.dict = dictionaryStore.data;
        } else if (!dictionaryStore.isFetching && !dictionaryStore.error) {
          this.router.navigate(["/"]);
        }
        // combined error and fetch results
        this.isFetching = gameStore.isFetching || dictionaryStore.isFetching;
        this.error = gameStore.error ?? dictionaryStore.error;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public get isDeath(): boolean {
    return (
      this.game &&
      this.game.words.some((w) => w.type === CardType.DEATH && w.selected)
    );
  }

  getClassFor(word: Word): string {
    let cs = "word";
    if (this.game.isLocalCodeMaster || word.selected) {
      cs += " show " + CardType[word.type].toLowerCase();
      if (this.game.isLocalCodeMaster && word.selected) {
        cs += " ignored";
      }
    }
    return cs;
  }

  displayWord(word: Word): string {
    return this.dict[word.id];
  }
}
