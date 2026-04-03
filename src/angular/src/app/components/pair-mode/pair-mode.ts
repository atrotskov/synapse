import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pair-mode',
  standalone: true,
  imports: [],
  templateUrl: './pair-mode.html',
  styleUrl: './pair-mode.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairMode {}
