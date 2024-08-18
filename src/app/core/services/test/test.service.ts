import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

interface Connected {
  id: number;
  distance: number;
}

interface Station {
  id: number;
  city: string;
  latitude: number;
  longitude: number;
  connectedTo: Connected[];
}

interface Route {
  id: number;
  path: number[];
  carriages: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private http: HttpClient = inject(HttpClient);

  data: Observable<Object> = of({});

  getStation() {
    return this.http.get<Station[]>('/api/station').pipe(
      map((data) => {
        return data.find((elem) => elem.id === 111);
      }),
      tap((data) => {
        console.log(data);
      })
    );
  }

  getRoutes() {
    return this.http.get<Route[]>('/api/route').pipe(
      tap((data) => {
        console.log(data);
      })
    );
  }

  searchSome() {
    const params = {
      fromLatitude: 12.18492639936359,
      fromLongitude: 94.88108644502307,
      toLatitude: -37.078825496504294,
      toLongitude: 119.71189152553796,
    };

    return this.http.get('/api/search/1', { params }).pipe(
      tap((data) => {
        console.log(data);
      })
    );
  }

  createStation() {
    const createStationBody = {
      city: 'Madrid',
      latitude: 40.416775,
      longitude: -3.70379,
      relations: [1, 2, 3],
    };

    return this.http.post('/api/station', createStationBody);
  }

  loginAdmin() {
    const body = {
      email: 'admin@admin.com',
      password: 'my-password',
    };

    return this.http.post<{ token: string }>('/api/signin', body).pipe(
      map(({ token }) => {
        localStorage.setItem('token', token);
      }),
      tap((data) => {
        console.log(data);
      })
    );
  }

  getProfileData() {
    return this.http.get('/api/profile').pipe(
      tap((data) => {
        console.log(data);
      })
    );
  }
}
