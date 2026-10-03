import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { CcliteLayoutComponent } from 'src/app/components/cclite-layout/cclite-layout.component';
import { IconGuardPipe } from 'src/app/pipes/icon-guard.pipe';
import { RealTitleCasePipe } from 'src/app/pipes/real-title-case.pipe';
import { QuickSettingService } from 'src/app/services/quick-setting.service';

// CCLite positionCodes of the physical keys spelling out each word. Picked
// per https://github.com/andy23512 (Tangent)'s mapping for the Lite board.
const CHARA_POSITION_CODES = [15, 32, 27, 43, 27]; // C H A R A
const LITE_POSITION_CODES = [35, 47, 44, 42]; // L I T E
// CharaChorder Lite's indicator light key (top-right); stays lit regardless
// of which word is highlighted.
const LITE_INDICATOR_POSITION_CODE = 66;

function getHighlightPositionCodes(): number[] {
  const wordPositionCodes =
    Math.random() < 0.5 ? CHARA_POSITION_CODES : LITE_POSITION_CODES;
  return [...new Set([...wordPositionCodes, LITE_INDICATOR_POSITION_CODE])];
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    CcliteLayoutComponent,
    IconGuardPipe,
    TranslatePipe,
    RealTitleCasePipe,
  ],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly quickSettingService = inject(QuickSettingService);

  highlightPositionCodes: number[] = getHighlightPositionCodes();

  @HostBinding('class') classes = 'block relative h-full';

  public loadDeviceLayoutAndChordsFromDevice() {
    this.quickSettingService.loadDeviceLayoutAndChordsFromDevice();
  }
}
