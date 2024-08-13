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
export class AppComponent implements OnInit {
  title = 'train-app';

  testService: TestService = inject(TestService);

  some$: Observable<Object> = of({});

  ngOnInit() {
    this.testService.searchSome().subscribe(
      (data) => {
        console.log('Search results:', data);
      },
      (error) => {
        console.error('Error during train search:', error);
      }
    );
  }
}
