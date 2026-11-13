import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KeyLabelType, RawKeyLabel } from 'tangent-cc-lib';

@Component({
  selector: '[appKeyLabel]',
  standalone: true,
  templateUrl: './key-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class KeyLabelComponent {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly fontSize = input<number>(8);
  readonly label = input.required<RawKeyLabel>();
  readonly KeyLabelType = KeyLabelType;

  public getFontSize({ type, c }: RawKeyLabel) {
    const fontSize = this.fontSize();
    switch (type) {
      case KeyLabelType.String:
        if (c.length > 3) {
          return fontSize * 0.4;
        }
        if (c.length > 2) {
          return fontSize * 0.6;
        }
        if (c.length > 1) {
          return fontSize * 0.8;
        }
        return fontSize;
      case KeyLabelType.ActionCode:
        return fontSize * 0.6;
      case KeyLabelType.Icon:
      case KeyLabelType.Logo:
        return fontSize * 0.8;
      default:
        const _: never = type;
        throw new Error(`Unhandled key label type case: ${type}`);
    }
  }
}
