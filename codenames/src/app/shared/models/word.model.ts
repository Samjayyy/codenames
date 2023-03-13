export enum CardType {
  BLUE,
  RED,
  DEATH,
  NEUTRAL,
}

export class Word {
  constructor(public readonly id: number, public readonly type: CardType) {
    this.selected = false;
  }
  selected: boolean;

  public toggle(): void {
    this.selected = !this.selected;
  }

  public getClass(): string {
    return "card";
  }
}
