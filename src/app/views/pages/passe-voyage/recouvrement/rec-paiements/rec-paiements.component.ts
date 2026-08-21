import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreditService } from '../../../../../core/services/credit/credit.service';
import { Subject, takeUntil } from 'rxjs';

export interface PaiementDisplayItem {
  id: string;
  ref: string;
  txId: string;
  refCredit: string;
  passagerName: string;
  passagerIdCode: string;
  passagerPhone: string;
  date: string;
  dateHeure: string;
  montant: number;
  methode: string;
  modePaiement: string;
  typePaiement: 'Frais de Service' | 'Remboursement Crédit';
  statut: string;
  compagnie: string;
  rawItem?: any;
}

@Component({
  selector: 'app-rec-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './rec-paiements.component.html',
  styleUrl: './rec-paiements.component.scss'
})
export class RecPaiementsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  showAdvancedFilters: boolean = false;

  advSearchTerm: string = '';
  advModeFilter: string = '';
  advMethodFilter: string = '';
  advTypeFilter: string = '';

  allPaiements: PaiementDisplayItem[] = [];
  paiements: PaiementDisplayItem[] = [];
  selectedPaiement: PaiementDisplayItem | null = null;

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private creditService: CreditService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadPaiements(): void {
    this.isLoading = true;
    const params: any = {};
    const mode = this.advMethodFilter || this.advModeFilter;
    if (this.advSearchTerm && this.advSearchTerm.trim() !== '') {
      params.search = this.advSearchTerm.trim();
    }
    if (mode && mode.trim() !== '') {
      params.paymentMethod = mode.trim();
    }
    if (this.advTypeFilter && this.advTypeFilter.trim() !== '') {
      params.type = this.advTypeFilter.trim();
    }

    this.creditService.getPayments(params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          const list: any[] = Array.isArray(data) ? data : (data?.data || []);

          const items: PaiementDisplayItem[] = [];

          list.forEach((item: any) => {
            const pass = item.passenger;
            const credit = item.creditRequest;

            let passName = 'Passager Inconnu';
            let phone = 'N/A';
            let passCode = 'PASS-N/A';

            if (pass) {
              const fn = pass.firstname || pass.firstName || pass.prenom || '';
              const ln = pass.lastname || pass.lastName || pass.nom || '';
              const full = `${fn} ${ln}`.trim();
              passName = full || pass.fullName || pass.phoneNumber || 'Passager Inconnu';
              phone = pass.phoneNumber || pass.phone || 'N/A';
              passCode = pass.code || (pass.id ? `PASS-${pass.id}` : 'PASS-N/A');
            }

            const refCred = credit ? (credit.code ? `CR-${credit.code}` : `CR-${credit.id}`) : 'CR-N/A';
            const comp = credit?.company?.name || credit?.departureCompany || 'UTB';

            const txId = item.transactionId || `TX-${item.id}`;
            const typePaiement: 'Frais de Service' | 'Remboursement Crédit' = 
              (txId.toUpperCase().includes('TX-FEE-') || (item.paymentMethod || '').toUpperCase().includes('SERVICE'))
                ? 'Frais de Service'
                : 'Remboursement Crédit';

            const dtStr = this.formatDateTime(item.paymentDate || item.createdAt);
            const pmtMode = item.paymentMethod || 'Wave';

            items.push({
              id: String(item.id),
              ref: txId,
              txId: txId,
              refCredit: refCred,
              passagerName: passName,
              passagerIdCode: passCode,
              passagerPhone: phone,
              date: dtStr,
              dateHeure: dtStr,
              montant: Number(item.amount || 0),
              methode: pmtMode,
              modePaiement: pmtMode,
              typePaiement: typePaiement,
              statut: item.status || 'Confirmé',
              compagnie: comp,
              rawItem: item
            });
          });

          this.allPaiements = items;
          this.filterLocally();
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Erreur chargement des paiements:', err);
          this.allPaiements = [];
          this.paiements = [];
        }
      });
  }

  applyFilters(): void {
    this.loadPaiements();
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.advModeFilter = '';
    this.advMethodFilter = '';
    this.advTypeFilter = '';
    this.loadPaiements();
  }

  private filterLocally(): void {
    let result = [...this.allPaiements];
    const mode = this.advMethodFilter || this.advModeFilter;

    if (mode && mode.trim() !== '') {
      result = result.filter(p => p.modePaiement.toLowerCase().includes(mode.toLowerCase()));
    }

    if (this.advTypeFilter && this.advTypeFilter.trim() !== '') {
      result = result.filter(p => p.typePaiement === this.advTypeFilter);
    }

    this.paiements = result;
  }

  openReceiptModal(content: TemplateRef<any>, paiement: PaiementDisplayItem): void {
    this.selectedPaiement = paiement;
    this.modalService.open(content, { centered: true, size: 'md' });
  }

  get totalEncaisse(): number {
    return this.allPaiements.reduce((acc, curr) => acc + curr.montant, 0);
  }

  get countEncaissements(): number {
    return this.allPaiements.length;
  }

  get totalMontantRembourse(): number {
    return this.totalRemboursementCredit;
  }

  get totalFraisService(): number {
    return this.allPaiements
      .filter(p => p.typePaiement === 'Frais de Service')
      .reduce((acc, curr) => acc + curr.montant, 0);
  }

  get countMobileMoney(): number {
    return this.allPaiements.filter(p => {
      const mode = (p.modePaiement || '').toLowerCase();
      return mode.includes('wave') || mode.includes('orange') || mode.includes('mtn') || mode.includes('moov') || mode.includes('mobile');
    }).length;
  }

  get countCB(): number {
    return this.allPaiements.filter(p => {
      const mode = (p.modePaiement || '').toLowerCase();
      return mode.includes('carte') || mode.includes('cb') || mode.includes('visa') || mode.includes('mastercard');
    }).length;
  }

  get countFraisService(): number {
    return this.allPaiements.filter(p => p.typePaiement === 'Frais de Service').length;
  }

  get totalRemboursementCredit(): number {
    return this.allPaiements
      .filter(p => p.typePaiement === 'Remboursement Crédit')
      .reduce((acc, curr) => acc + curr.montant, 0);
  }

  private formatDateTime(dateVal: any): string {
    if (!dateVal) return new Date().toLocaleString('fr-FR');
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateVal);
    }
  }
}
