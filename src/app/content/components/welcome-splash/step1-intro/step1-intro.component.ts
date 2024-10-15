import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SettingService } from '../../../../core/services/setting/setting.service';
import { ConfigrationColumns } from '../../../../core/models/enums/configration-columns';
@Component({
  selector: 'm-step1-intro',
  templateUrl: './step1-intro.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Step1IntroComponent implements OnInit {

  videoUrl: string;

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.settingService.getCongigrationColumn(ConfigrationColumns.introductionVideoUrl).subscribe(
      data => {
        this.videoUrl = data.introduction_video_url;
      },
      error => {

      });
  }

}
