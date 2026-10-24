import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TreeViewComponent } from './components/tree/tree-view.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TreeViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');
}
