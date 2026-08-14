import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cred-demandes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cred-demandes.component.html',
  styleUrl: './cred-demandes.component.scss'
})
export class CredDemandesComponent {
  demandes = [
    { id: 'REQ-4501', passager: 'Diallo Amadou', compagnie: 'UTB', typeTrajet: 'Aller simple', passagers: 1, billets: 1, prixUnitaire: 5000, montant: 5000, frais: 250, trajet: 'Abidjan - Bouaké', score: 85, dateVoyage: '15/08/2026', dateRetour: null, date: 'Il y a 5 min', statut: 'En attente' },
    { id: 'REQ-4502', passager: 'Kouassi Marie', compagnie: 'AHD', typeTrajet: 'Aller-retour', passagers: 2, billets: 4, prixUnitaire: 2000, montant: 8000, frais: 400, trajet: 'Abidjan - Yamoussoukro', score: 92, dateVoyage: '16/08/2026', dateRetour: '18/08/2026', date: 'Il y a 10 min', statut: 'En attente' },
    { id: 'REQ-4499', passager: 'Bamba Ali', compagnie: 'SBTA', typeTrajet: 'Aller simple', passagers: 1, billets: 1, prixUnitaire: 10000, montant: 10000, frais: 500, trajet: 'Bouaké - Korhogo', score: 30, dateVoyage: '20/08/2026', dateRetour: null, date: 'Hier', statut: 'Rejeté' },
  ];

  approuver(demande: any) {
    demande.statut = 'Approuvé';
  }

  rejeter(demande: any) {
    demande.statut = 'Rejeté';
  }
}
