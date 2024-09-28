import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule para manejar solicitudes HTTP
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,             // Importa CommonModule para las directivas comunes de Angular
    FormsModule,              // Importa FormsModule para formularios template-driven
    ReactiveFormsModule,      // Importa ReactiveFormsModule para formularios reactivos
    IonicModule,              // Importa IonicModule para los componentes de la UI de Ionic
    HomePageRoutingModule,    // Importa el módulo de enrutamiento para esta página
    HttpClientModule          // Importa HttpClientModule para realizar solicitudes HTTP al backend
  ],
  declarations: [HomePage]    // Declara la página HomePage como parte de este módulo
})
export class HomePageModule {}
