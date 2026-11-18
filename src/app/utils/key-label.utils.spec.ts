import {
  ACTIONS,
  ActionType,
  KeyboardLayout,
  KeyLabelType,
} from 'tangent-cc-lib';
import { getKeyLabelMap } from './key-label.utils';

// Action codes: a = 97, Shift+a = 65, Backspace = 298, Enter = 296,
// ShiftLeft = 513, MetaLeft = 515, ControlLeft = 480, PressNext = 523,
// NoKeyPressed = 256, SpaceLeft = 32, é (Windows alt code) = 233.
const layout = {
  id: 'test',
  name: 'Test',
  layout: {
    KeyA: {
      unmodified: { type: 'text', value: 'a' },
      withShift: { type: 'text', value: 'A' },
    },
    Quote: { unmodified: { type: 'dead-key', value: '`' } },
  },
} as unknown as KeyboardLayout;

describe('getKeyLabelMap', () => {
  // `null` means "no keyboard layout" (undefined would pick the default).
  const labelOf = (
    code: number,
    os?: string,
    keyboardLayout: KeyboardLayout | null = layout,
  ) => getKeyLabelMap([code], keyboardLayout ?? undefined, os)[0];

  describe('keys that type a character', () => {
    it('uses the unmodified character of the keyboard layout', () => {
      expect(labelOf(97)).toEqual({
        type: KeyLabelType.String,
        c: 'a',
        title: 'a',
        isDeadKey: false,
      });
    });

    it('uses the shifted character for a "with shift" action', () => {
      expect(labelOf(65)).toEqual({
        type: KeyLabelType.String,
        c: 'A',
        title: 'A',
        isDeadKey: false,
      });
    });

    it('marks a dead key', () => {
      const quote = ACTIONS.find(
        (a) =>
          a.type === ActionType.WSK && a.keyCode === 'Quote' && !a.withShift,
      )!;
      expect(labelOf(quote.codeId)).toEqual(
        jasmine.objectContaining({ c: '`', isDeadKey: true }),
      );
    });

    it('has no label when the layout has no character for the key', () => {
      expect(
        labelOf(97, undefined, { layout: {} } as unknown as KeyboardLayout),
      ).toBeUndefined();
    });

    it('has no label without a keyboard layout', () => {
      expect(labelOf(97, undefined, null)).toBeUndefined();
    });

    it('has no label for the shifted character when the layout only has the plain one', () => {
      const plainOnly = {
        layout: { KeyA: { unmodified: { type: 'text', value: 'a' } } },
      } as unknown as KeyboardLayout;
      expect(labelOf(65, undefined, plainOnly)).toBeUndefined();
    });
  });

  describe('keys that do not type a character', () => {
    it('shows icons for editing keys', () => {
      expect(labelOf(298)).toEqual({
        type: KeyLabelType.Icon,
        c: 'backspace',
        title: 'key-label.backspace',
      });
      expect(labelOf(296)).toEqual({
        type: KeyLabelType.Icon,
        c: 'keyboard_return',
        title: 'key-label.enter',
      });
      expect(labelOf(32)).toEqual({
        type: KeyLabelType.Icon,
        c: 'space_bar',
        title: 'key-label.space-left',
      });
    });

    it('shows modifier keys', () => {
      expect(labelOf(513)).toEqual({
        type: KeyLabelType.Icon,
        c: 'shift',
        title: 'key-label.shift-left',
      });
      expect(labelOf(480)).toEqual({
        type: KeyLabelType.String,
        c: 'CTRL',
        title: 'key-label.control-left',
      });
    });

    it('shows the device actions', () => {
      expect(labelOf(523)).toEqual({
        type: KeyLabelType.Icon,
        c: 'download',
        title: 'key-label.press-next',
      });
      expect(labelOf(256)).toEqual({
        type: KeyLabelType.Icon,
        c: 'block',
        title: 'key-label.no-key-pressed',
      });
    });

    it('does not need a keyboard layout', () => {
      expect(labelOf(298, undefined, null)).toBeDefined();
    });
  });

  describe('the Meta key follows the operating system', () => {
    it('is a generic key when the system is unknown', () => {
      expect(labelOf(515)).toEqual({
        type: KeyLabelType.Icon,
        c: 'apps',
        title: 'key-label.meta-left',
      });
    });

    it('is the Windows logo on Windows', () => {
      expect(labelOf(515, 'Windows')).toEqual({
        type: KeyLabelType.Icon,
        c: 'window',
        title: 'key-label.windows-meta-left',
      });
    });

    it('is the Command key on macOS', () => {
      expect(labelOf(515, 'macOS')).toEqual({
        type: KeyLabelType.Icon,
        c: 'keyboard_command_key',
        title: 'key-label.apple-meta-left',
      });
    });

    it('falls back to the generic key for a system that has no special label', () => {
      expect(labelOf(515, 'Some Unknown OS')).toEqual(
        jasmine.objectContaining({ c: 'apps' }),
      );
    });

    it('does not change keys that do not depend on the system', () => {
      expect(labelOf(97, 'macOS')).toEqual(labelOf(97, 'Windows'));
    });
  });

  describe('other action codes', () => {
    it('shows a Windows alt code as its character', () => {
      expect(labelOf(233)).toEqual({
        type: KeyLabelType.String,
        c: 'é',
        title: 'é',
        isWindowsAltCode: true,
      });
    });

    it('shows an unknown code of 32 or more as the number', () => {
      expect(labelOf(1000)).toEqual({
        type: KeyLabelType.ActionCode,
        c: 1000,
        title: '1000',
      });
    });

    it('shows nothing for unknown codes below 32 and for 0', () => {
      expect(labelOf(0)).toBeUndefined();
      expect(labelOf(5)).toBeUndefined();
      expect(labelOf(31)).toBeUndefined();
    });
  });

  describe('the whole layer', () => {
    it('is keyed by the position of each key, and skips positions without a label', () => {
      const map = getKeyLabelMap([97, 0, 298, 5, 1000], layout, undefined);
      expect(Object.keys(map)).toEqual(['0', '2', '4']);
      expect(map[0].c).toBe('a');
      expect(map[2].c).toBe('backspace');
      expect(map[4].c).toBe(1000);
    });

    it('is empty for an empty layer', () => {
      expect(getKeyLabelMap([], layout, undefined)).toEqual({});
    });
  });
});
