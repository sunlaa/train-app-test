import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './core/services/test/test.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'train-app';

  testService: TestService = inject(TestService);

  some$: Observable<Object> = of({});

  constructor() {
    localStorage.clear();
  }

  getStation() {
    this.testService.getStation().subscribe();
  }

  getRoute() {
    this.testService.getRoutes().subscribe();
  }

  search() {
    this.testService.searchSome().subscribe();
  }

  create() {
    this.testService.createStation().subscribe(
      (data) => {
        console.log(data);
      },
      (err) => console.log(err)
    );
  }

  login() {
    this.testService.loginAdmin().subscribe();
  }

  profile() {
    this.testService.getProfileData().subscribe();
  }
}
