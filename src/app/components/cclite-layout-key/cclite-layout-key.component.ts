import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RawKeyLabel } from 'tangent-cc-lib';
import { KeyLabelComponent } from '../key-label/key-label.component';

@Component({
  selector: '[appCcliteLayoutKey]',
  templateUrl: 'cclite-layout-key.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [KeyLabelComponent],
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
  keyLabel = input<RawKeyLabel | null>(null);
  highlightPositionCodes = input<number[]>([]);
}
