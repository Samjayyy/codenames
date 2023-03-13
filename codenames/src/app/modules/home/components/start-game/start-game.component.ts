import { Component, OnInit, Inject } from "@angular/core";
import { GamesStore } from "src/app/core/services/store/games.store";
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { GaService } from "src/app/core/services/ext/ga.service";

@Component({
  selector: "app-start-game",
  templateUrl: "./start-game.component.html",
  styleUrls: ["./start-game.component.scss"],
})
export class StartGameComponent implements OnInit {
  gameid = "";
  typeSecret = true;
  startRandom = false;

  constructor(
    private gameStore: GamesStore,
    private router: Router,
    private gaService: GaService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {}

  enter(asCodeMaster: boolean): void {
    this.gameStore.createNew(this.gameid, asCodeMaster);
    this.gaService.emitEvent(
      "codenames",
      "start",
      this.gameid,
      asCodeMaster ? 1 : 0
    );
    this.router.navigate(["/play"]);
  }

  public get link(): string {
    return this.document.location.toString();
  }

  public takeRandom(): void {
    this.gameid = this.generateRandomString(5);
  }

  private generateRandomString(length: number): string {
    const charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < length; i++) {
      res += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return res;
  }
}
