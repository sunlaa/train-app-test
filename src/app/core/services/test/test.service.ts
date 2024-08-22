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

interface SearchResponse {
  from: FromTo;
  to: FromTo;
  routes: SearchRoute[];
}

interface FromTo {
  stationId: number;
  city: string;
  geolocation: {
    latitude: number;
    longitude: number;
  };
}

interface SearchRoute {
  id: number;
  path: number[];
  carriages: string[];
  schedule: Ride[];
}

interface Ride {
  rideId: number;
  segments: Segment[];
}

interface Segment {
  occupiedSeats: number[];
  price: { [key: string]: number };
  time: string[];
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
        return data.find((elem) => elem.id === 112);
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
    const date = new Date(2024, 8, 27, 12).toISOString();
    console.log(date);

    const params = {
      fromLatitude: 53.597204803371056,
      fromLongitude: -28.57250258982822,
      toLatitude: 84.87996460407012,
      toLongitude: 171.1223311508151,
      time: date,
    };

    return this.http.get<SearchResponse>('/api/search', { params }).pipe(
      tap((data) => {
        console.log(data);
        this.handleRoutes(data);
      })
    );
  }

  handleRoutes(response: SearchResponse) {
    const routes = response.routes;
    const from = response.from.stationId;
    const to = response.to.stationId;

    routes.map((route) => {
      const startIndex = route.path.indexOf(from);
      const endIndex = route.path.indexOf(to);

      route.schedule.map((ride) => {
        const wholePath = ride.segments.slice(startIndex, endIndex + 1);
        const startTime = new Date(wholePath[0].time[0]).getTime();
        const endTime = new Date(
          wholePath[wholePath.length - 1].time[1]
        ).getTime();

        const travelTime = this.convertTimestamp(endTime - startTime);

        const pathWithCities = wholePath.map((segment, i) => {
          return { ...segment, stationId: route.path[i] };
        });

        let lastDeaprture: number | undefined;
        const routeDetails = pathWithCities.map((segment, i) => {
          const arrival = new Date(segment.time[0]).getTime();
          const stopTime =
            lastDeaprture === undefined
              ? 'station'
              : `${this.convertTimestamp(arrival - lastDeaprture).min} min`;
          const departure = new Date(segment.time[1]).getTime();
          lastDeaprture = departure;

          return {
            cityId: segment.stationId,
            arrival: i === 0 ? undefined : this.formatTime(arrival),
            departure:
              i === pathWithCities.length - 1
                ? undefined
                : this.formatTime(departure),

            stopTime,
          };
        });

        console.log(routeDetails);
      });
    });
  }

  convertTimestamp(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    return { days, hours: remainingHours, min: remainingMinutes };
  }

  formatTime(num: number) {
    const date = new Date(num);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Добавляем ведущий ноль для чисел меньше 10
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
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
