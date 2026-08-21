import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../../core/services/ticket/ticket.service';

@Component({
  selector: 'app-pass-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pass-historique.component.html',
  styleUrl: './pass-historique.component.scss'
})
export class PassHistoriqueComponent implements OnInit {
  loading: boolean = false;
  allHistorique: any[] = [];
  historique: any[] = [];

  // Filter toggle state
  showAdvancedFilters: boolean = false;

  // Advanced Filters Form State
  advSearchTerm: string = '';
  advCompagnieFilter: string = '';
  advStatusFilter: string = '';
  advMinPrice: number | null = null;
  advMaxPrice: number | null = null;
  advCountFilter: number = 20;

  // KPI Getters
  get totalCount(): number {
    return (this.allHistorique.length > 0 ? this.allHistorique : this.historique).length;
  }

  get validCount(): number {
    const list = this.allHistorique.length > 0 ? this.allHistorique : this.historique;
    return list.filter(h => {
      const st = (h.statut || '').toUpperCase();
      return st === 'VALIDE' || st === 'VALID' || st === 'VALIDATED';
    }).length;
  }

  get usedCount(): number {
    const list = this.allHistorique.length > 0 ? this.allHistorique : this.historique;
    return list.filter(h => {
      const st = (h.statut || '').toUpperCase();
      return st === 'CONSOMMÉ' || st === 'CONSOMME' || st === 'USED' || st === 'VOYAGE TERMINÉ';
    }).length;
  }

  get expiredCount(): number {
    const list = this.allHistorique.length > 0 ? this.allHistorique : this.historique;
    return list.filter(h => {
      const st = (h.statut || '').toUpperCase();
      return st === 'EXPIRÉ' || st === 'EXPIRE' || st === 'ANNULÉ' || st === 'ANNULE' || st === 'CANCELLED';
    }).length;
  }

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadHistorique();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadHistorique(): void {
    this.loading = true;
    this.ticketService.getList().subscribe({
      next: (response: any) => {
        this.loading = false;
        const data = response?.data || response?.tickets || response;
        if (Array.isArray(data)) {
          const list = data.map((t: any) => ({
            ticketId: t.num || `TK-${t.id}`,
            passager: t.passager || 'Passager Inconnu',
            compagnie: t.compagnie || 'UTB',
            trajet: t.trajet || 'Abidjan - Yamoussoukro',
            date: t.dateValidite || 'Aujourd\'hui',
            montant: t.unitPrice || 5000,
            statut: t.qrStatus || t.status || 'Valide'
          }));
          this.allHistorique = list;
          this.applyLocalFilters();
        } else {
          this.allHistorique = [];
          this.historique = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Erreur chargement historique:', err);
        this.allHistorique = [];
        this.historique = [];
      }
    });
  }

  applyLocalFilters(): void {
    let result = [...this.allHistorique];

    if (this.advSearchTerm && this.advSearchTerm.trim() !== '') {
      const term = this.advSearchTerm.toLowerCase().trim();
      result = result.filter(h =>
        (h.ticketId || '').toLowerCase().includes(term) ||
        (h.passager || '').toLowerCase().includes(term) ||
        (h.compagnie || '').toLowerCase().includes(term) ||
        (h.trajet || '').toLowerCase().includes(term)
      );
    }

    if (this.advCompagnieFilter && this.advCompagnieFilter.trim() !== '') {
      result = result.filter(h => (h.compagnie || '').toLowerCase().includes(this.advCompagnieFilter.toLowerCase()));
    }

    if (this.advStatusFilter && this.advStatusFilter.trim() !== '') {
      const stFilter = this.advStatusFilter.toUpperCase();
      result = result.filter(h => {
        const st = (h.statut || '').toUpperCase();
        if (stFilter === 'VALIDE') return st === 'VALIDE' || st === 'VALID' || st === 'VALIDATED';
        if (stFilter === 'CONSOMME') return st === 'CONSOMMÉ' || st === 'CONSOMME' || st === 'USED' || st === 'VOYAGE TERMINÉ';
        if (stFilter === 'EXPIRE') return st === 'EXPIRÉ' || st === 'EXPIRE';
        if (stFilter === 'ANNULE') return st === 'ANNULÉ' || st === 'ANNULE' || st === 'CANCELLED';
        return st.includes(stFilter);
      });
    }

    if (this.advMinPrice !== null && this.advMinPrice !== undefined && this.advMinPrice !== ('' as any)) {
      result = result.filter(h => h.montant >= Number(this.advMinPrice));
    }

    if (this.advMaxPrice !== null && this.advMaxPrice !== undefined && this.advMaxPrice !== ('' as any)) {
      result = result.filter(h => h.montant <= Number(this.advMaxPrice));
    }

    if (this.advCountFilter && Number(this.advCountFilter) > 0 && Number(this.advCountFilter) < 1000) {
      result = result.slice(0, Number(this.advCountFilter));
    }

    this.historique = result;
  }

  applyAdvancedFilters(): void {
    this.applyLocalFilters();
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.advCompagnieFilter = '';
    this.advStatusFilter = '';
    this.advMinPrice = null;
    this.advMaxPrice = null;
    this.advCountFilter = 20;

    this.applyLocalFilters();
  }

  getStatusBadgeInfo(statut: string): { label: string; bgClass: string } {
    const st = (statut || '').toUpperCase();
    if (st === 'VALIDE' || st === 'VALID' || st === 'VALIDATED') {
      return { label: 'Valide', bgClass: 'bg-success text-white' };
    }
    if (st === 'CONSOMMÉ' || st === 'CONSOMME' || st === 'USED' || st === 'VOYAGE TERMINÉ') {
      return { label: 'Consommé', bgClass: 'bg-info text-white' };
    }
    if (st === 'EXPIRÉ' || st === 'EXPIRE') {
      return { label: 'Expiré', bgClass: 'bg-warning text-dark' };
    }
    if (st === 'ANNULÉ' || st === 'ANNULE' || st === 'CANCELLED' || st === 'REJECTED') {
      return { label: 'Annulé', bgClass: 'bg-danger text-white' };
    }
    return { label: statut || 'Valide', bgClass: 'bg-success text-white' };
  }
}
