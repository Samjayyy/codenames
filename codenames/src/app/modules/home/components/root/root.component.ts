import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  DictionaryStore,
  Language,
} from "src/app/core/services/store/dictionary.store";
import { GamesStore } from "src/app/core/services/store/games.store";
import { Game } from "src/app/shared/models/game.model";
import { takeUntil } from "rxjs/operators";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Router, NavigationEnd } from "@angular/router";
import { GaService } from "src/app/core/services/ext/ga.service";

@Component({
  selector: "app-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.scss"],
})
export class RootComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  lastGame: Game = null;

  constructor(
    private dictionaryStore: DictionaryStore,
    private gameStore: GamesStore,
    private gaService: GaService,
    private router: Router
  ) {}

  Language = Language;

  ngOnInit() {
    if (environment.enableAnalytics) {
      if (this.gaService.isEnabled()) {
        this.gaService.create();
        // subscribe to router events and send page views to Google Analytics
        this.router.events
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((event) => {
            if (!(event instanceof NavigationEnd)) {
              return;
            }
            this.gaService.pageVisited(event.urlAfterRedirects);
          });
      }
    }

    this.dictionaryStore.fetchData(); // ensure dictionary is fetched
    this.gameStore.store$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((store) => {
        if (!store.isFetching && !store.error) {
          this.lastGame = store.data;
        }
      });
  }

  getLanguage(): BehaviorSubject<Language> {
    return this.dictionaryStore.getLanguage();
  }

  changeLanguage(language: Language): void {
    this.dictionaryStore.changeLanguage(language);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
