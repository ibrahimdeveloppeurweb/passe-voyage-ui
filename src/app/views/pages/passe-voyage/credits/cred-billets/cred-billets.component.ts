import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cred-billets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cred-billets.component.html',
  styleUrl: './cred-billets.component.scss'
})
export class CredBilletsComponent {
  billets = [
    { num: 'TK-998877', passager: 'Diallo Amadou', compagnie: 'UTB', trajet: 'Abidjan - Yamoussoukro', dateValidite: '2026-08-15', qrStatus: 'Valide' },
    { num: 'TK-998878', passager: 'Kouassi Marie', compagnie: 'MT', trajet: 'Abidjan - Bouaké', dateValidite: '2026-08-14', qrStatus: 'Consommé' },
  ];
}
