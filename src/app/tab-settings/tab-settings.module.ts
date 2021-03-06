import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabSettingsPage } from './tab-settings.page';
import { LoginComponent } from '../components/login/login.component'
import {
  AmplifyAngularModule,
  AmplifyIonicModule,
} from 'aws-amplify-angular';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AmplifyAngularModule,
    AmplifyIonicModule,
    RouterModule.forChild([{ path: '', component: TabSettingsPage }])
  ],
  declarations: [
    TabSettingsPage,
    LoginComponent,
  ],
  entryComponents: [
    LoginComponent,
  ]
})
export class TabSettingsPageModule {}
