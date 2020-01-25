import { Component, OnInit } from '@angular/core';
import { ThemeServiceProvider, ITheme } from '../providers/theme-service/theme-service';
import { Router } from '@angular/router';
import { Logger, LoggingService } from 'ionic-logging-service';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/state/app.state';
import { getTheme } from '../store/selectors/data.selectors';
import { take } from 'rxjs/operators';
import { SetTheme, ResetData } from '../store/actions/data.actions';

interface ISelectedTheme  {
  selected: boolean;
  theTheme: ITheme;
}

@Component({
  selector: 'app-tab-settings',
  templateUrl: 'tab-settings.page.html',
  styleUrls: ['tab-settings.page.scss']
})
export class TabSettingsPage implements OnInit {
  private logger: Logger;
  themes: ISelectedTheme[];
  selectedSegment = 'themes';
  selectedTheme: string;

  constructor(
    loggingService: LoggingService,
    private themeService: ThemeServiceProvider,
    private store: Store<IAppState>,
    private router: Router,
    ) {
      this.logger = loggingService.getLogger('App.TabSettingsPage');
      this.themes = this.themeService.themes.map(t => ({ selected: false, theTheme: t }));
      this.logger.entry('ctor', this.themes);
    }

    ngOnInit() {
      this.store.select(getTheme)
      .pipe(take(1))
      .subscribe((theme) => {
        this.logger.info('ngOnInit', 'getTheme', theme);
        if (theme) {
          this.selectedTheme = theme;
          this.themes.find(t => t.theTheme.name === theme).selected = true;
        }
      });
    }

   themeSelected(selectedTheme: string) {
    this.selectedTheme = selectedTheme;
    this.themes.forEach(t => t.selected = t.theTheme.name === this.selectedTheme);
    this.logger.debug('theme selected: ', this.selectedTheme);
    this.store.dispatch(new SetTheme(this.selectedTheme));
  }

  getSelectedThemeImage(i: number): string {
    const theme = this.themes.find(t => t.selected);
    if (theme) {
      return `${theme.theTheme.image}-${i}.png`;
    }
  }

  segmentChanged(segment: string) {
    this.selectedSegment = segment;
    this.logger.debug('segmentChanged', this.selectedSegment);
  }

  async resetData() {
    this.store.dispatch(new ResetData());
    this.router.navigate(['']);
  }

}
