import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { GridComponent } from "./grid/grid.component";
import { MenuComponent } from "./menu/menu.component";
import { RecipeService } from "./recipe.service";
import { PagerComponent } from "./pager/pager.component";

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, GridComponent, MenuComponent, PagerComponent],
  providers: [RecipeService],
  bootstrap: [AppComponent]
})
export class AppModule {}
