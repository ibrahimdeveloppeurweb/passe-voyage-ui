import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rec-relances',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rec-relances.component.html',
  styleUrl: './rec-relances.component.scss'
})
export class RecRelancesComponent {
  alertes = [
    { passager: 'Kone Salif (PS-0892)', telephone: '07 12 34 56 78', dette: 5000, joursRetard: 59, niveau: 'Haut', derniereRelance: 'Jamais' },
    { passager: 'Bamba Ali (PS-1047)', telephone: '01 55 66 77 88', dette: 2000, joursRetard: 24, niveau: 'Moyen', derniereRelance: 'Il y a 3 jours' },
  ];

  envoyerSMS(passager: any) {
    alert(`SMS de relance envoyé à ${passager.passager} au ${passager.telephone}.`);
    passager.derniereRelance = 'À l\'instant';
  }
}
