import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyLabelType, RawKeyLabel } from 'tangent-cc-lib';
import { CcliteLayoutKeyComponent } from './cclite-layout-key.component';

@Component({
  imports: [CcliteLayoutKeyComponent],
  template: `
    <svg>
      <g
        appCcliteLayoutKey
        [x]="5"
        [y]="7"
        [width]="20"
        [height]="10"
        [positionCode]="positionCode()"
        [highlightPositionCodes]="highlight()"
        [highlightOpacity]="0.8"
        [keyLabel]="label()"
      ></g>
    </svg>
  `,
})
class HostComponent {
  positionCode = signal(1);
  highlight = signal<number[]>([]);
  label = signal<RawKeyLabel | null>(null);
}

describe('CcliteLayoutKeyComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const rects = (): SVGRectElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('rect'));
  const outline = () => rects()[0];
  const highlightRect = () => rects()[1];
  const homeMark = () => rects()[2];
  const labelText = () => fixture.nativeElement.querySelector('text');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(rects().length).toBe(3);
  });

  it('draws the key outline at the given position and size', () => {
    expect(outline().getAttribute('x')).toBe('5');
    expect(outline().getAttribute('y')).toBe('7');
    expect(outline().getAttribute('width')).toBe('20');
    expect(outline().getAttribute('height')).toBe('10');
    expect(outline().getAttribute('fill')).toBe('transparent');
  });

  it('draws the highlight over the whole key', () => {
    expect(highlightRect().getAttribute('width')).toBe('20');
    expect(highlightRect().getAttribute('height')).toBe('10');
  });

  describe('highlight', () => {
    it('is invisible when nothing is highlighted', () => {
      expect(highlightRect().getAttribute('opacity')).toBe('0');
    });

    it('is invisible when another key is highlighted', () => {
      host.highlight.set([2, 3]);
      fixture.detectChanges();
      expect(highlightRect().getAttribute('opacity')).toBe('0');
    });

    it('uses the highlight opacity for a highlighted key', () => {
      host.highlight.set([2, 1]);
      fixture.detectChanges();
      expect(highlightRect().getAttribute('opacity')).toBe('0.8');
    });
  });

  describe('home row bar', () => {
    it('is shown on the position codes 30 and 33 only', () => {
      const opacities: Record<number, string | null> = {};
      for (const code of [29, 30, 31, 32, 33, 34]) {
        host.positionCode.set(code);
        fixture.detectChanges();
        opacities[code] = homeMark().getAttribute('opacity');
      }
      expect(opacities).toEqual({
        29: '0',
        30: '0.45',
        31: '0',
        32: '0',
        33: '0.45',
        34: '0',
      });
    });

    it('is placed in the lower middle of the key', () => {
      expect(Number(homeMark().getAttribute('x'))).toBeCloseTo(5 + 20 * 0.365, 5);
      expect(Number(homeMark().getAttribute('y'))).toBeCloseTo(7 + 10 * 0.8, 5);
      expect(Number(homeMark().getAttribute('width'))).toBeCloseTo(20 * 0.27, 5);
    });
  });

  describe('label', () => {
    it('is not drawn when the key has no label', () => {
      expect(labelText()).toBeNull();
    });

    it('is drawn in the middle of the key', () => {
      host.label.set({
        type: KeyLabelType.String,
        c: 'a',
        title: 't',
      } as RawKeyLabel);
      fixture.detectChanges();
      expect(labelText().textContent.trim()).toBe('a');
      expect(labelText().getAttribute('x')).toBe('15'); // 5 + 20 / 2
      expect(labelText().getAttribute('y')).toBe('12'); // 7 + 10 / 2
    });

    it('disappears again when the label is removed', () => {
      host.label.set({
        type: KeyLabelType.String,
        c: 'a',
        title: 't',
      } as RawKeyLabel);
      fixture.detectChanges();
      host.label.set(null);
      fixture.detectChanges();
      expect(labelText()).toBeNull();
    });
  });
});
