import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontLogo, KeyLabelType, RawKeyLabel } from 'tangent-cc-lib';
import { KeyLabelComponent } from './key-label.component';

const string = (c: string, extra: Partial<RawKeyLabel> = {}) =>
  ({ type: KeyLabelType.String, c, title: 't', ...extra }) as RawKeyLabel;

describe('KeyLabelComponent', () => {
  let fixture: ComponentFixture<KeyLabelComponent>;
  let component: KeyLabelComponent;

  function create(label: RawKeyLabel, fontSize?: number) {
    fixture = TestBed.createComponent(KeyLabelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('x', 10);
    fixture.componentRef.setInput('y', 20);
    fixture.componentRef.setInput('label', label);
    if (fontSize !== undefined) {
      fixture.componentRef.setInput('fontSize', fontSize);
    }
    fixture.detectChanges();
  }

  const text = (): SVGTextElement => fixture.nativeElement.querySelector('text');
  const lines = (): SVGLineElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('line'));

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [KeyLabelComponent] });
  });

  it('should create', () => {
    create(string('a'));
    expect(component).toBeTruthy();
  });

  describe('getFontSize', () => {
    beforeEach(() => create(string('a'), 100));
    const size = (label: RawKeyLabel) => component.getFontSize(label);

    it('uses the full size for a one character string', () => {
      expect(size(string('a'))).toBe(100);
    });

    it('shrinks two character strings to 80%', () => {
      expect(size(string('ab'))).toBe(80);
    });

    it('shrinks three character strings to 60%', () => {
      expect(size(string('abc'))).toBe(60);
    });

    it('shrinks strings of four or more characters to 40%', () => {
      expect(size(string('abcd'))).toBe(40);
      expect(size(string('abcdefg'))).toBe(40);
    });

    it('uses 60% for action codes', () => {
      expect(
        size({ type: KeyLabelType.ActionCode, c: 5, title: 't' } as RawKeyLabel),
      ).toBe(60);
    });

    it('uses 80% for icons and logos', () => {
      expect(
        size({ type: KeyLabelType.Icon, c: 'backspace', title: 't' } as RawKeyLabel),
      ).toBe(80);
      expect(
        size({ type: KeyLabelType.Logo, c: FontLogo.Ubuntu, title: 't' } as RawKeyLabel),
      ).toBe(80);
    });

    it('defaults the base size to 8', () => {
      create(string('a'));
      expect(component.getFontSize(string('a'))).toBe(8);
    });

    it('throws for an unknown label type', () => {
      expect(() =>
        size({ type: 'mystery', c: 'a', title: 't' } as unknown as RawKeyLabel),
      ).toThrowError(/Unhandled key label type/);
    });
  });

  describe('rendering', () => {
    it('writes the label at the given position', () => {
      create(string('a'));
      expect(text().textContent?.trim()).toBe('a');
      expect(text().getAttribute('x')).toBe('10');
      expect(text().getAttribute('y')).toBe('20');
    });

    it('writes action codes in parentheses and colors them red', () => {
      create({ type: KeyLabelType.ActionCode, c: 123, title: 't' } as RawKeyLabel);
      expect(text().textContent?.replace(/\s+/g, '')).toBe('(123)');
      expect(text().classList.contains('fill-red-500')).toBe(true);
      expect(text().classList.contains('fill-current')).toBe(false);
    });

    it('uses the icon font for icons', () => {
      create({ type: KeyLabelType.Icon, c: 'backspace', title: 't' } as RawKeyLabel);
      expect(text().classList.contains('material-icons')).toBe(true);
    });

    it('draws no marker for an ordinary string', () => {
      create(string('a'));
      expect(lines()).toEqual([]);
    });

    it('draws a marker bar for a dead key', () => {
      create(string('^', { isDeadKey: true }));
      expect(lines().length).toBe(1);
      expect(lines()[0].classList.contains('stroke-chara-900')).toBe(true);
    });

    it('draws a different marker bar for a Windows alt-code character', () => {
      create(string('é', { isWindowsAltCode: true }));
      expect(lines().length).toBe(1);
      expect(lines()[0].classList.contains('stroke-yellow-900')).toBe(true);
    });

    it('sizes the marker bar from the font size', () => {
      create(string('^', { isDeadKey: true }), 20);
      const line = lines()[0];
      expect(line.getAttribute('y1')).toBe('10'); // y 20 - 20 / 2
      expect(line.getAttribute('y2')).toBe('30'); // y 20 + 20 / 2
      expect(line.getAttribute('stroke-width')).toBe('10');
    });
  });
});
