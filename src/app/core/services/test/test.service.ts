import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private http: HttpClient = inject(HttpClient);

  searchSome() {
    const url = '/api/search';

    const params = {
      fromLatitude: 48.8575,
      fromLongitude: 2.3514,
      city1: 'Paris',
      toLatitude: 40.4167,
      toLongitude: 3.7033,
      city2: 'Madrid'
    };

    return this.http.get(url, { params });
  }
}
