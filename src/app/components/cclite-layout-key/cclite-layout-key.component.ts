import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: '[appCcliteLayoutKey]',
  templateUrl: 'cclite-layout-key.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class CcliteLayoutKeyComponent {
  x = input.required<number>();
  y = input.required<number>();
  width = input.required<number>();
  height = input.required<number>();
  strokeWidth = input<number>(0.1);
  positionCode = input.required<number>();
  fontSize = input<number>(8);
  highlightOpacity = input<number>(0.5);
  highlightPositionCodes = input<number[]>([]);
}
