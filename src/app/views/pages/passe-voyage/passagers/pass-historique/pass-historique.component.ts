import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pass-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pass-historique.component.html',
  styleUrl: './pass-historique.component.scss'
})
export class PassHistoriqueComponent {
  historique = [
    { ticketId: 'TK-998877', passager: 'Diallo Amadou', compagnie: 'UTB', trajet: 'Abidjan - Yamoussoukro', date: '2026-08-12 14:30', montant: 4000, statut: 'Voyage Terminé' },
    { ticketId: 'TK-998878', passager: 'Kouassi Marie', compagnie: 'MT', trajet: 'Abidjan - Bouaké', date: '2026-08-13 08:15', montant: 5500, statut: 'En cours' },
    { ticketId: 'TK-998879', passager: 'Diallo Amadou', compagnie: 'UTB', trajet: 'Yamoussoukro - Abidjan', date: '2026-08-15 09:00', montant: 4000, statut: 'Réservé' },
  ];
}
