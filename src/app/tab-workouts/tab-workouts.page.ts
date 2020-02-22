import { Store } from '@ngrx/store';
import { IonFab, IonList } from '@ionic/angular';
import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { WorkoutBean } from '../models/Workout';
import { DisplayMode } from '../models/enums';
import { IAppState } from '../store/state/app.state';
import { AddWorkout, ImportWorkout } from '../store/actions/workouts.actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateWorkouts } from '../store/actions/data.actions';
import { getWorkouts } from '../store/selectors/workouts.selectors';
import { Guid } from 'guid-typescript';
import { WorkoutDayBean } from '../models/WorkoutDay';
import { Logger, LoggingService } from 'ionic-logging-service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab-workouts',
  templateUrl: 'tab-workouts.page.html',
  styleUrls: ['tab-workouts.page.scss']
})
export class TabWorkoutsPage implements OnInit, OnDestroy {
  private logger: Logger;

  @ViewChild('fabEdit', { static: true }) fabEdit: IonFab;
  @ViewChild(IonList, { static: true, read: ElementRef }) list: ElementRef;

  workouts: WorkoutBean[];

  displayMode = DisplayMode;
  private mode: DisplayMode = DisplayMode.Display;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    loggingService: LoggingService,
    private store: Store<IAppState>,
    private alertController: AlertController,
  ) {
    this.logger = loggingService.getLogger('App.TabWorkoutsPage');
  }

  ngOnInit() {
    this.store.select(getWorkouts)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(workouts => {
        this.logger.debug('ngOnInit', 'getWorkouts', workouts);
        this.workouts = workouts;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get DisplayMode(): DisplayMode {
    return this.mode;
  }
  set DisplayMode(val: DisplayMode) {
    if (this.mode !== val) {
      this.mode = val;
      if (this.DisplayMode === DisplayMode.Display) {
        this.logger.debug('DisplayMode', this.workouts);
        this.store.dispatch(new UpdateWorkouts());
      }
    }
  }

  editWorkouts() {
    switch (this.DisplayMode) {
      case DisplayMode.Display:
        this.DisplayMode = DisplayMode.Edit;
        break;
      case DisplayMode.Edit:
        this.DisplayMode = DisplayMode.Display;
        break;
    }
  }

  async addWorkout(event: any) {
    event.stopPropagation();
    const newWorkoutId = Guid.raw();
    const newDayId = Guid.raw();
    const workout = WorkoutBean.create({ id: newWorkoutId, dayId: newDayId });
    const day = WorkoutDayBean.create({ id: newDayId, workoutId: newWorkoutId });
    this.store.dispatch(new AddWorkout({ workout, day }));
    setTimeout(() => {
      const items = this.list.nativeElement.children;
      const newWorkout = items[this.workouts.length - 1];
      if (newWorkout) {
        newWorkout.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1);
  }

  async importWorkout() {
    await this.presentAlertPrompt();
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Import workout',
      subHeader: 'Type the key of the workout to be imported',
      inputs: [{
        name: 'workoutId',
        type: 'text',
        placeholder: 'Workout Key'
      },
      ],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          this.logger.debug('presentAlertPrompt', 'import cancelled');
        }
      }, {
        text: 'Import',
        handler: (data) => {
          if (data.workoutId) {
            this.logger.debug('presentAlertPrompt', 'importing', data.workoutId);
            this.store.dispatch(new ImportWorkout({ workoutId: data.workoutId }));
          } else {
            return false;
          }
        }
      }
      ]
    });

    await alert.present();
  }
}
