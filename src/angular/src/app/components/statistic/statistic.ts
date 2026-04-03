import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [],
  templateUrl: './statistic.html',
  styleUrl: './statistic.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Statistic {}
