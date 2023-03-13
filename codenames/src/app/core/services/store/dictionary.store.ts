import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { StoreService } from './stores';
import { CacheExpiry } from '../../util/cache-expiry';
import { DictionaryService } from '../asset/dictionary.service';
import { BehaviorSubject } from 'rxjs';

export enum Language {
    NL = "nl",
    EN = "en"
}

@Injectable({ providedIn: 'root' })
export class DictionaryStore extends StoreService<string[]> {
    private cacheExpiry = new CacheExpiry();
    private _language = new BehaviorSubject<Language>(Language.NL);


    constructor(private restService: DictionaryService) {
        super();
    }

    public getLanguage(){
        return this._language
    }

    public changeLanguage(language: Language){
        this._language.next(language)
        this.fetchData(true)
    }

    // get the cached data
    public fetchData(forceExpiry: boolean = false): void {
        if (!this.cacheExpiry.isExpired && !forceExpiry) {
            return;
        }
        this.setStateFetching();
        this.restService.getDictionary(this._language.value.toString()).pipe(
                super.catchErrorAndReset(),
                tap((next: string[]) => {
                    this.store$.next({
                        ...this.store$.value,
                        data: next,
                        error: null,
                        isFetching: false
                    });
                }),
                tap(() => this.cacheExpiry.updated())
            ).subscribe();
    }

    // Retrieve the data uncached
    public refresh(): void {
        this.cacheExpiry.refresh();
        this.fetchData();
    }
}
