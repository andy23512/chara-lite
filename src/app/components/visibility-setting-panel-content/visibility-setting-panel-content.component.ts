import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { VisibilitySetting } from 'src/app/models/visibility-setting.models';
import { RealTitleCasePipe } from 'src/app/pipes/real-title-case.pipe';
import { VisibilitySettingStore } from 'src/app/stores/visibility-setting.store';

const VISIBILITY_SETTING_ITEMS: {
  name: string;
  key: keyof VisibilitySetting;
}[] = [
  {
    name: 'visibility-setting.speedometer',
    key: 'speedometer',
  },
];

@Component({
  selector: 'app-visibility-setting-panel-content',
  standalone: true,
  imports: [MatCheckbox, TranslatePipe, RealTitleCasePipe],
  templateUrl: './visibility-setting-panel-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisibilitySettingPanelContentComponent {
  visibilitySettingStore = inject(VisibilitySettingStore);

  visibilitySettingItems = computed(() => {
    return VISIBILITY_SETTING_ITEMS.map((item) => ({
      ...item,
      value: this.visibilitySettingStore[item.key](),
    }));
  });

  setVisible(key: keyof VisibilitySetting, visible: boolean) {
    this.visibilitySettingStore.set(key, visible);
  }
}
