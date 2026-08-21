import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PassengerService, PassengerItem } from '../../../../../core/services/passenger/passenger.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pass-blacklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pass-blacklist.component.html',
  styleUrl: './pass-blacklist.component.scss'
})
export class PassBlacklistComponent implements OnInit {
  isLoading: boolean = false;
  allBlacklisted: PassengerItem[] = [];
  blacklist: PassengerItem[] = [];

  // Filter toggle
  showAdvancedFilters: boolean = false;
  advSearchTerm: string = '';

  constructor(private passengerService: PassengerService) {}

  ngOnInit(): void {
    this.loadBlacklist();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadBlacklist(): void {
    this.isLoading = true;
    const params: any = { status: 'BLACKLISTED', count: 1000 };
    if (this.advSearchTerm && this.advSearchTerm.trim() !== '') {
      params.search = this.advSearchTerm.trim();
    }

    this.passengerService.getList(params).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        const list: PassengerItem[] = Array.isArray(data) ? data : (data?.data || []);
        this.allBlacklisted = list;
        this.applyFilters();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Erreur chargement blacklist:', err);
        this.allBlacklisted = [];
        this.blacklist = [];
      }
    });
  }

  applyFilters(): void {
    let result = [...this.allBlacklisted];
    if (this.advSearchTerm && this.advSearchTerm.trim() !== '') {
      const term = this.advSearchTerm.toLowerCase().trim();
      result = result.filter(p =>
        (p.firstname || '').toLowerCase().includes(term) ||
        (p.lastname || '').toLowerCase().includes(term) ||
        (p.fullName || p.nom || '').toLowerCase().includes(term) ||
        (p.phoneNumber || p.telephone || '').toLowerCase().includes(term) ||
        (p.code || '').toLowerCase().includes(term) ||
        (p.uuid || p.id || '').toString().toLowerCase().includes(term) ||
        this.getPassengerId(p).toLowerCase().includes(term)
      );
    }
    this.blacklist = result;
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.loadBlacklist();
  }

  debloquer(passager: PassengerItem): void {
    if (!passager || !passager.uuid) return;
    const name = this.getFullName(passager);

    Swal.fire({
      title: 'Réactiver ce compte ?',
      text: `Êtes-vous sûr de vouloir lever la suspension du passager ${name} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, réactiver',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.passengerService.toggleBlacklist(passager.uuid!, false).subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'Compte Réactivé !',
              text: res?.message || 'Le passager a été retiré de la liste noire avec succès.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadBlacklist();
          },
          error: (err: any) => {
            console.error('Erreur lors de la réactivation:', err);
            Swal.fire('Erreur', 'Impossible de réactiver le compte du passager.', 'error');
          }
        });
      }
    });
  }

  getPassengerId(pass: PassengerItem): string {
    if (!pass) return 'PV-1000';
    if (pass.code) return pass.code;
    if (pass.id) return 'PV-' + (9500 + Number(pass.id));
    return 'PV-1000';
  }

  getFullName(pass: PassengerItem): string {
    if (pass.fullName || pass.nom) return pass.fullName || pass.nom || '';
    return `${pass.firstname || ''} ${pass.lastname || ''}`.trim();
  }

  getInscriptionDate(pass: PassengerItem): string {
    return pass.inscription || pass.createdAt || '2026-07-20';
  }
}
