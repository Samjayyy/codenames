import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DictionaryService {

  constructor(private http: HttpClient) {
  }

  public getDictionary(language: string): Observable<string[]> {
    return this.http
      .get<string[]>(`./assets/dictionary-${language}.json`);
  }
}
