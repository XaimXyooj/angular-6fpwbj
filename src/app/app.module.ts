import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { HttpClientInMemoryWebApiModule } from "angular-in-memory-web-api";

import { AppComponent } from "./app.component";
import { GridComponent } from "./grid/grid.component";
import { MenuComponent } from "./menu/menu.component";
import { RecipeService } from "./recipe.service";
import { PagerComponent } from "./pager/pager.component";
import { InMemoryDataService } from "./in-memory-data.service";
import { HttpClientModule } from "@angular/common/http";
import { DetailComponent } from "./detail/detail.component";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
      dataEncapsulation: false
    }),
    HttpClientModule,
    ReactiveFormsModule
  ],
  declarations: [AppComponent, DetailComponent, GridComponent, MenuComponent, PagerComponent],
  providers: [RecipeService],
  bootstrap: [AppComponent]
})
export class AppModule {}
