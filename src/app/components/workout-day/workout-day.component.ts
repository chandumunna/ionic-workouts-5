import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ItemReorderEventDetail } from '@ionic/core';
import { WorkoutDayBean } from '../../models/WorkoutDay';
import { DisplayMode, RunningState } from '../../models/enums';
import { IAppState } from 'src/app/store/state/app.state';
import {
  StartExercise,
  UpdateWorkoutDay,
  ReorderExerciseSets,
  StopExercise,
  ResetExerciseSetScrollIntoView,
} from 'src/app/store/actions/workoutDays.actions';
import { getWorkoutDay } from 'src/app/store/selectors/workoutDays.selectors';
import { takeUntil } from 'rxjs/operators';
import { UpdateWorkouts } from 'src/app/store/actions/data.actions';
import { Logger, LoggingService } from 'ionic-logging-service';
import { IonList } from '@ionic/angular';

@Component({
  selector: 'app-workout-day',
  templateUrl: './workout-day.component.html',
  styleUrls: ['./workout-day.component.scss'],
})
export class WorkoutDayComponent implements OnInit, OnDestroy {
  private logger: Logger;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private exerciseSets: string[];
  private name: string;

  @Input() dayId: string;
  @Input() displayMode: DisplayMode;
  @ViewChild(IonList, { read: ElementRef, static: false }) list: ElementRef;

  constructor(
    loggingService: LoggingService,
    private store: Store<IAppState>
  ) {
    this.logger = loggingService.getLogger('App.WorkoutDayComponent');
  }

  get IsEditMode() { return this.displayMode === DisplayMode.Edit; }
  get IsDisplayMode() { return this.displayMode === DisplayMode.Display; }
  get IsWorkoutMode() { return this.displayMode === DisplayMode.Workout; }
  get IsDisplayOrWorkout() { return this.IsWorkoutMode || this.IsDisplayMode; }

  ngOnInit() {
    this.store.select(getWorkoutDay(this.dayId))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(workoutDay => {
        if (workoutDay) {
          this.logger.debug('ngOnInit', `${this.dayId} getWorkoutDay`, workoutDay);
          this.exerciseSets = workoutDay.exerciseSets;
          this.name = workoutDay.name;
          this.handleSelectedWorkoutDayStateChange(workoutDay);
          if (workoutDay.scrollToExerciseSetIndex >= 0) {
            this.logger.debug('ngOnInit', 'need to scrollToExerciseSetIndex', workoutDay.scrollToExerciseSetIndex);
            setTimeout(() => {
              const items = this.list.nativeElement.children[0].children;
              const set = items[workoutDay.scrollToExerciseSetIndex];
              set.scrollIntoView({ behavior: 'smooth', block: 'start' });
              this.store.dispatch(new ResetExerciseSetScrollIntoView({ dayId: this.dayId }));
            }, 1);
          }
        }
      });
  }

  ngOnDestroy() {
    this.logger.debug('ngOnDestroy', `${this.dayId} onDestroy`);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  handleSelectedWorkoutDayStateChange(state: WorkoutDayBean) {
    if (state.displayMode === DisplayMode.Workout &&
      state.runningState === RunningState.Completed) {
      if (state.runningExerciseSetIndex + 1 < this.exerciseSets.length) {
        this.store.dispatch(new StartExercise({
          id: state.id,
          runningExerciseSetIndex: state.runningExerciseSetIndex + 1,
        }));
      } else {
        this.store.dispatch(new StopExercise({
          id: this.dayId,
        }));
      }
    }
  }

  workoutDayChanged() {
    this.store.dispatch(new UpdateWorkoutDay({
      dayId: this.dayId,
      name: this.name
    }));
  }

  async saveChanges() {
    this.store.dispatch(new UpdateWorkouts());
  }

  reorderItems(event: CustomEvent<ItemReorderEventDetail>) {
    const from = event.detail.from;
    const to = event.detail.to;
    this.logger.info('reorderItems', `Moving day from ${from} to ${to}`);
    this.store.dispatch(new ReorderExerciseSets({
      dayId: this.dayId,
      fromIndex: from < to ? from : to,
      toIndex: to > from ? to : from
    }));
    event.detail.complete(true);
  }
}
