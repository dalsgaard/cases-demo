import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AppComponent } from './app.component';
import { CaseListComponent } from './case-list/case-list.component';

@NgModule({
	declarations: [ AppComponent, CaseListComponent ],
	imports: [
		BrowserModule,
		NoopAnimationsModule,
		MatInputModule,
		MatButtonToggleModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule
	],
	providers: [],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
