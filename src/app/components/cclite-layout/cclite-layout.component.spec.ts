import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyLabelType, RawKeyLabel } from 'tangent-cc-lib';
import { CcliteLayoutComponent } from './cclite-layout.component';

type Key = { code: number; x: number; y: number; w: number; h: number };

describe('CcliteLayoutComponent', () => {
  let fixture: ComponentFixture<CcliteLayoutComponent>;
  let component: CcliteLayoutComponent;

  const keyElements = (): SVGGElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('g[appcclitelayoutkey]'));
  const keys = (): Key[] => component.keyboard.keys.map((k) => ({
    code: k.positionCode,
    x: k.x,
    y: k.y,
    w: k.width,
    h: k.height,
  }));
  const keyByCode = (code: number) => keys().find((k) => k.code === code)!;
  const highlightOf = (el: SVGGElement) =>
    el.querySelectorAll('rect')[1].getAttribute('opacity');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CcliteLayoutComponent] });
    fixture = TestBed.createComponent(CcliteLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('keyboard geometry', () => {
    it('has 67 keys, one for each position code from 0 to 66', () => {
      expect(keys().length).toBe(67);
      expect(
        keys()
          .map((k) => k.code)
          .sort((a, b) => a - b),
      ).toEqual(Array.from({ length: 67 }, (_, i) => i));
    });

    it('is 163 wide and 54 high', () => {
      expect(component.keyboard.width).toBe(163);
      expect(component.keyboard.height).toBe(54);
    });

    it('has five rows of 10 high keys, one unit apart', () => {
      const ys = [...new Set(keys().map((k) => k.y))].sort((a, b) => a - b);
      expect(ys).toEqual([0, 11, 22, 33, 44]);
      expect(keys().every((k) => k.h === 10)).toBe(true);
    });

    it('has the number row on top and the space row on the bottom', () => {
      expect(keyByCode(53).y).toBe(0);
      expect(keyByCode(66).y).toBe(0);
      expect(keyByCode(0).y).toBe(44);
      expect(keyByCode(11).y).toBe(44);
    });

    it('ends every row exactly at the right edge', () => {
      for (const y of [0, 11, 22, 33, 44]) {
        const row = keys()
          .filter((k) => k.y === y)
          .sort((a, b) => a.x - b.x);
        const last = row[row.length - 1];
        expect(last.x + last.w).toBeCloseTo(163, 5);
        expect(row[0].x).toBe(0);
      }
    });

    it('leaves a gap of 1 between neighboring keys and no overlap', () => {
      for (const y of [0, 11, 22, 33, 44]) {
        const row = keys()
          .filter((k) => k.y === y)
          .sort((a, b) => a.x - b.x);
        for (let i = 1; i < row.length; i++) {
          expect(row[i].x - (row[i - 1].x + row[i - 1].w)).toBeCloseTo(1, 5);
        }
      }
    });

    it('draws the wide keys wider than ordinary keys', () => {
      expect(keyByCode(39).w).toBe(18); // Tab
      expect(keyByCode(26).w).toBe(19); // CapsLock
      expect(keyByCode(38).w).toBe(22); // Enter
      expect(keyByCode(12).w).toBe(22); // Left Shift
      expect(keyByCode(3).w).toBe(24); // left thumb space
      expect(keyByCode(6).w).toBe(27); // right thumb space
      expect(keyByCode(40).w).toBe(10); // ordinary key
    });

    // Current behavior: the width table says Backspace is 21 wide, but the
    // number row has 14 keys (13 gaps), one more gap than the table's comment
    // counts, so the last-key adjustment shrinks Backspace to 20.
    it('shrinks Backspace to 20 so that the number row fits', () => {
      expect(keyByCode(66).w).toBe(20);
    });

    it('gives the keys of the bottom letter row an equal width', () => {
      for (let code = 13; code <= 25; code++) {
        expect(keyByCode(code).w).toBeCloseTo(128 / 13, 5);
      }
    });

    it('does not change the other rows, whose widths already add up', () => {
      expect(keyByCode(52).w).toBe(12);
      expect(keyByCode(38).w).toBe(22);
      expect(keyByCode(11).w).toBe(11);
    });
  });

  describe('rendering', () => {
    it('draws one key element for each key', () => {
      expect(keyElements().length).toBe(67);
    });

    it('sets the view box to the keyboard size', () => {
      expect(
        fixture.nativeElement.querySelector('svg').getAttribute('viewBox'),
      ).toBe('0 0 163 54');
    });

    it('highlights only the keys in the highlight list', () => {
      fixture.componentRef.setInput('highlightPositionCodes', [15, 44]);
      fixture.detectChanges();
      const lit = component.keyboard.keys
        .filter((_, i) => highlightOf(keyElements()[i]) !== '0')
        .map((k) => k.positionCode)
        .sort((a, b) => a - b);
      expect(lit).toEqual([15, 44]);
    });

    it('highlights nothing by default', () => {
      expect(keyElements().every((el) => highlightOf(el) === '0')).toBe(true);
    });

    it('draws a label only on the keys that have one', () => {
      const label = {
        type: KeyLabelType.String,
        c: 'q',
        title: 't',
      } as RawKeyLabel;
      fixture.componentRef.setInput('keyLabelMap', { 40: label });
      fixture.detectChanges();
      const withText = component.keyboard.keys
        .filter((_, i) => keyElements()[i].querySelector('text') !== null)
        .map((k) => k.positionCode);
      expect(withText).toEqual([40]);
    });

    it('draws the home row bars on the keys 30 and 33', () => {
      const marked = component.keyboard.keys
        .filter((_, i) => keyElements()[i].querySelectorAll('rect')[2].getAttribute('opacity') !== '0')
        .map((k) => k.positionCode)
        .sort((a, b) => a - b);
      expect(marked).toEqual([30, 33]);
    });
  });
});
