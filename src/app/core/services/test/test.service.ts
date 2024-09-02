import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

const cars = {
  carriage1: 140,
  carriage2: 44,
  carriage3: 40,
  carriage4: 60,
  carriage5: 32,
  carriage6: 78,
};

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
interface Filter {
  firstAvailableDate: Date;
  lastAvailableDate: Date;
}

interface RouteDetails {
  routeId: number;
  stopInfo: StopInfo[];
}

interface StopInfo {
  station: string;
  departureTime: string | undefined;
  arrivalTime: string | undefined;
  duration: number | 'first station' | 'last station';
}

export type SearchResponse = {
  from: Location;
  to: Location;
  routes: SearchRoute[];
};

export type Location = {
  stationId: number;
  city: string;
  geolocation: {
    latitude: number;
    longitude: number;
  };
};

export type SearchRoute = {
  schedule: Ride[];
} & Route;

export type Ride = {
  rideId: number;
  segments: Segment[];
};

export type Segment = {
  time: string[];
  price: { [key: string]: number };
  occupiedSeats: number[];
};

export type Ticket = {
  departureDate: string;
  arrivalDate: string;
  startCity: string;
  endCity: string;
  tripDuration: number;
  firstRouteStation: string;
  lastRouteStation: string;
  // temporarily
  price?: { [key: string]: number };
  routeDetails: RouteDetails;
};

export type DayTickets = {
  date: string;
  tickets: Ticket[];
};

export type FilteredTickets = DayTickets[];

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private http: HttpClient = inject(HttpClient);

  data: Observable<Object> = of({});

  getStation() {
    return this.http.get<Station[]>('/api/station').pipe(
      map((data) => {
        return data.find((elem) => elem.id === 92);
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

  getCarriage() {
    return this.http.get('/api/carriage').pipe(
      tap((data) => {
        console.log(data);
      })
    );
  }

  searchSome() {
    const date = new Date(2024, 7, 26, 12).toISOString();
    console.log(date);

    // const params = {
    //   fromLatitude: -48.9776163077342,
    //   fromLongitude: -119.6638479136875,
    //   toLatitude: -45.87343039781251,
    //   toLongitude: 94.28725055293404,
    //   time: date,
    // };

    const params = {
      fromLatitude: 53.59595202548519,
      fromLongitude: 101.990273414809,
      toLatitude: 77.278899529396,
      toLongitude: 100.08084407927123,
      time: '2024-08-30T10:00:00.000Z',
    };

    return this.http.get<SearchResponse>('/api/search/1').pipe(
      tap((data) => {
        console.log(data);
        this.filterTicketsByDate(this.getTicketsData(data));
      })
    );
  }

  getTicketsData(response: SearchResponse) {
    const { routes, from, to } = response;
    const { stationId: fromStationId, city: startCity } = from;
    const { stationId: toStationId, city: endCity } = to;

    const ticketsData: Ticket[] = routes.flatMap((route) => {
      // change to the city string using selectors
      const { id } = route;

      const firstRouteStationId = route.path[0];
      const lastRouteStationId = route.path[route.path.length - 1];

      const startRide = route.path.indexOf(fromStationId);
      const endRide = route.path.indexOf(toStationId);

      return route.schedule.map((ride) => {
        const wholePathIds = route.path.slice(startRide, endRide + 1);

        const wholePath = ride.segments.slice(startRide, endRide + 1);

        const departureDate = new Date(wholePath[0].time[0]);
        const arrivalDate = new Date(wholePath[wholePath.length - 1].time[1]);
        const tripDuration = arrivalDate.getTime() - departureDate.getTime();

        const stopInfo = handleRoute(wholePathIds, wholePath);

        const ticket: Ticket = {
          departureDate: departureDate.toISOString(),
          arrivalDate: arrivalDate.toISOString(),
          startCity,
          endCity,
          tripDuration,
          firstRouteStation: `${firstRouteStationId}`,
          lastRouteStation: `${lastRouteStationId}`,
          routeDetails: { routeId: id, stopInfo },
        };

        return ticket;
      });
    });

    console.log(ticketsData);

    return ticketsData;
  }

  filterTicketsByDate(tickets: Ticket[]): FilteredTickets {
    const ticketsMap = new Map<string, Ticket[]>();

    if (tickets.length === 0) return [];

    const minDate = new Date(
      Math.min(
        ...tickets.map((ticket) => {
          return new Date(ticket.departureDate).getTime();
        })
      )
    );

    console.log('minDate: ', minDate.toISOString());

    const dates: string[] = [];

    for (let i = 0; i < 10; i += 1) {
      const date = new Date(minDate);
      date.setDate(minDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    dates.forEach((date) => {
      ticketsMap.set(
        date,
        tickets.filter((ticket) => date === ticket.departureDate.split('T')[0])
      );
    });

    const filteredTickets: FilteredTickets = [];

    ticketsMap.forEach((t, date) => {
      filteredTickets.push({ date, tickets: t });
    });

    return filteredTickets;
  }

  getOrders() {
    return this.http.get('/api/order').pipe(
      tap((data) => {
        console.log(data);
      })
    );
  }

  makeOrder() {
    const body = { rideId: 68, seat: -15, stationStart: 44, stationEnd: 26 };
    return this.http.post('/api/order', body).pipe(
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

    return this.http.post('/api/station/1138', createStationBody);
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

  registerUser() {
    const body = {
      email: 'test.hello123576@gmail.com',
      password: 'password',
    };

    return this.http.post('/api/signup', body).pipe(
      tap((data) => {
        console.log(data);
      })
    );
  }

  loginUser() {
    const body = {
      email: 'test.hello123576@gmail.com',
      password: 'password',
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

function getCarriages(carriagesSeats: number[], occupiedSeats: number[]) {
  const seatsNumber = carriagesSeats.reduce<number[]>((acc, elem, i) => {
    if (i === 0) return [elem];
    return [...acc, acc[acc.length - 1] + elem];
  }, []);

  return seatsNumber.map((count, i, arr) => {
    if (i === 0) return occupiedSeats.filter((x) => x < count);

    return occupiedSeats.filter((x) => x > arr[i - 1] && x < count);
  });
}

console.log(
  getCarriages(
    [60, 78, 140, 60],
    [1, 3, 4, 20, 15, 87, 88, 96, 120, 130, 140, 190, 400]
  )
);

function handleCarriagePrice(wholePath: Segment[]) {
  return wholePath.reduce((acc, elem) => {
    for (const [key, value] of Object.entries(elem.price)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {} as { [key: string]: number });
}

function hundleCarriageSeats(
  carriages: ('carriage1' | 'carriage2')[],
  occupiedSeats: number[]
) {
  const seatsNumber = carriages.map((car) => cars[car]);
}

function handleRoute(ridePath: number[], segmentPath: Segment[]) {
  let prevArrival: string;

  return segmentPath.map((segment, i) => {
    const stationId = ridePath[i];
    const departureTime = segment.time[0];
    const arrivalTime = prevArrival;
    const duration =
      new Date(departureTime).getTime() - new Date(arrivalTime).getTime();

    prevArrival = segment.time[1];

    return {
      station: `${stationId}`,
      departureTime,
      arrivalTime,
      duration,
    };
  });
}
