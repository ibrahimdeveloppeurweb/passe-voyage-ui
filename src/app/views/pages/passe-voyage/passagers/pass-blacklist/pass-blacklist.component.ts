import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pass-blacklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pass-blacklist.component.html',
  styleUrl: './pass-blacklist.component.scss'
})
export class PassBlacklistComponent {
  blacklist = [
    { id: 'PS-1047', nom: 'Bamba Ali', telephone: '01 55 66 77 88', dette: 2000, dateBlocage: '2026-07-20', motif: 'Dette de crédit non remboursée' },
    { id: 'PS-0892', nom: 'Kone Salif', telephone: '07 12 34 56 78', dette: 5000, dateBlocage: '2026-06-15', motif: 'Dette de crédit non remboursée' },
  ];

  debloquer(passagerId: string) {
    this.blacklist = this.blacklist.filter(p => p.id !== passagerId);
  }
}
