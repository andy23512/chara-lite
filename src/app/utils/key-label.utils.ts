import {
  ACTIONS,
  ActionType,
  KeyboardLayout,
  KeyLabelType,
  NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP,
  NON_WSK_CODE_2_RAW_KEY_LABEL_MAP,
  OS_2_ALT_KEY_LABEL_MAP,
  OS_2_META_KEY_LABEL_MAP,
  RawKeyLabel,
} from 'tangent-cc-lib';

/**
 * Builds the text label shown on each physical key from one layer of a device
 * layout (`layerActionCodes[positionCode]` is the action code on that key).
 * For keys typing a character, the unmodified (or shifted, for "with shift"
 * actions) character of the OS keyboard layout is used. `title` is plain
 * text (no i18n), since labels are not shown as tooltips here.
 */
export function getKeyLabelMap(
  layerActionCodes: number[],
  keyboardLayout: KeyboardLayout | undefined,
  operatingSystem: string | undefined,
): Record<number, RawKeyLabel> {
  const nonWskLabelMap: Record<string, RawKeyLabel> = {
    ...NON_WSK_CODE_2_RAW_KEY_LABEL_MAP,
    ...(operatingSystem
      ? OS_2_META_KEY_LABEL_MAP[operatingSystem as never]
      : {}),
    ...(operatingSystem
      ? OS_2_ALT_KEY_LABEL_MAP[operatingSystem as never]
      : {}),
  };
  const keyLabelMap: Record<number, RawKeyLabel> = {};
  layerActionCodes.forEach((actionCodeId, positionCode) => {
    const action = ACTIONS.find((a) => a.codeId === actionCodeId);
    let label: RawKeyLabel | null = null;
    if (action?.type === ActionType.WSK && action.keyCode) {
      const output = action.withShift
        ? keyboardLayout?.layout[action.keyCode]?.withShift
        : keyboardLayout?.layout[action.keyCode]?.unmodified;
      if (output) {
        label = {
          type: KeyLabelType.String,
          c: output.value,
          title: output.value,
          isDeadKey: output.type === 'dead-key',
        };
      }
    } else if (action?.type === ActionType.NonWSK && action.keyCode) {
      label = nonWskLabelMap[action.keyCode] ?? null;
    } else if (action?.type === ActionType.NonKey && action.actionName) {
      label =
        NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP[action.actionName] ?? null;
    } else if (action?.type === ActionType.WindowsAltCode && action.character) {
      label = {
        type: KeyLabelType.String,
        c: action.character,
        title: action.character,
        isWindowsAltCode: true,
      };
    } else if (actionCodeId >= 32) {
      label = {
        type: KeyLabelType.ActionCode,
        c: actionCodeId,
        title: String(actionCodeId),
      };
    }
    if (label) {
      keyLabelMap[positionCode] = label;
    }
  });
  return keyLabelMap;
}
