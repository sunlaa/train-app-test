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

interface Filter {
  firstAvailableDate: Date;
  lastAvailableDate: Date;
}

interface Ticket {
  departureDate: Date;
  arrivalDate: Date;
  startCity: string;
  endCity: string;
  tripDuaration: number;
  firstRouteStation: string;
  lastRouteStation: string;
  price?: {
    [key: string]: {
      freeSeats: number;
      price: number;
    };
  };
}

interface RouteDetails {
  station: string;
  arrivalTime: string | undefined;
  departureTime: string | undefined;
  stopDuration: string;
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
        return data.find((elem) => elem.id === 5);
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
    const date = new Date(2024, 7, 27, 12).toISOString();
    console.log(date);

    const params = {
      fromLatitude: -48.9776163077342,
      fromLongitude: -119.6638479136875,
      toLatitude: -45.87343039781251,
      toLongitude: 94.28725055293404,
      time: date,
    };

    return this.http.get<SearchResponse>('/api/search', { params }).pipe(
      tap((data) => {
        console.log(data);
        this.handleRoutes(data);
      })
    );
  }

  toTimestamp(iso: string) {
    return new Date(iso).getTime();
  }

  handleRoutes(response: SearchResponse) {
    const routes = response.routes;
    const from = response.from.stationId;
    const to = response.to.stationId;

    const startCity = response.from.city;
    const endCity = response.to.city;

    let filterData: Filter;
    const ticketsData: Ticket[] = [];

    routes.forEach((route) => {
      const firstRouteStationId = route.path[0];
      const lastRouteStationId = route.path[route.path.length - 1];

      const startRide = route.path.indexOf(from);
      const endRide = route.path.indexOf(to);

      const rides = route.schedule;

      rides.forEach((ride) => {
        const wholePath = ride.segments.slice(startRide, endRide + 1);

        const departureDate = new Date(wholePath[0].time[0]);
        const arrivalDate = new Date(wholePath[wholePath.length - 1].time[1]);
        const tripDuaration = arrivalDate.getTime() - departureDate.getTime();

        wholePath.forEach((segment) => {
          const price = segment.price;

          const result: Ticket = {
            departureDate,
            arrivalDate,
            startCity,
            endCity,
            tripDuaration,
            firstRouteStation: `${firstRouteStationId}`,
            lastRouteStation: `${lastRouteStationId}`,
          };

          ticketsData.push(result);
        });
      });
    });
    console.log(ticketsData);
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
