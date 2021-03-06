import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabLibraryPage } from './tab-library.page';
import { Camera } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ExpandableComponentModule } from '../components/expandable/expandable.module';
import { ChooseMediaActionPopoverComponent } from '../components/choose-media-action-popover/choose-media-action-popover.component'
import { ExerciseDetailModalComponent } from '../components/exercise-detail-modal/exercise-detail-modal/exercise-detail-modal.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TabLibraryPage
  },
  {
    path: 'select-muscle',
    loadChildren: () => import('../pages/select-muscle/select-muscle.module').then(m => m.SelectMusclePageModule)
  }
];
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExpandableComponentModule,
    RouterModule.forChild(routes),
    PinchZoomModule,
  ],
  declarations: [
    TabLibraryPage,
    ChooseMediaActionPopoverComponent,
    ExerciseDetailModalComponent,
  ],
  entryComponents: [
    ChooseMediaActionPopoverComponent,
    ExerciseDetailModalComponent,
  ],
  providers: [
    Camera,
    FilePath,
  ]
})
export class TabLibraryPageModule { }
