import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rec-creances',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rec-creances.component.html',
  styleUrl: './rec-creances.component.scss'
})
export class RecCreancesComponent {
  creances = [
    { id: 'CR-9012', passager: 'Bamba Ali (PS-1047)', montant: 2000, dateEmission: '2026-07-20', joursRetard: 24, statut: 'En retard' },
    { id: 'CR-9015', passager: 'Kouassi Marie (PS-1046)', montant: 5500, dateEmission: '2026-08-10', joursRetard: 3, statut: 'Dans les temps' },
    { id: 'CR-8920', passager: 'Kone Salif (PS-0892)', montant: 5000, dateEmission: '2026-06-15', joursRetard: 59, statut: 'Critique' },
  ];

  get totalCreances() {
    return this.creances.reduce((acc, curr) => acc + curr.montant, 0);
  }
}
