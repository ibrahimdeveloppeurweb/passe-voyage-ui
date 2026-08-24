import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CompanyFundService, CompanyFundItem, CompanyFundHistoryItem } from '../../../../../core/services/company-fund/company-fund.service';
import { CompanyService, CompanyItem } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-part-fonds',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './part-fonds.component.html',
  styleUrl: './part-fonds.component.scss'
})
export class PartFondsComponent implements OnInit, OnDestroy {
  fonds: CompanyFundItem[] = [];
  compagniesList: CompanyItem[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;
  isLoadingHistory: boolean = false;

  viewMode: 'list' | 'detail' = 'list';
  selectedFund: CompanyFundItem | null = null;
  movements: CompanyFundHistoryItem[] = [];
  filteredMovements: CompanyFundHistoryItem[] = [];

  // Filters for movements
  searchMovement: string = '';
  typeFilter: string = '';

  newFond = {
    compagnie: '',
    montant: 0
  };

  rechargeForm = {
    amount: 0,
    reason: 'Rechargement de fonds de roulement',
    performedBy: 'Administrateur'
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private companyFundService: CompanyFundService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadFonds();
    this.loadCompagnies();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  loadFonds(): void {
    this.isLoading = true;
    this.companyFundService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: CompanyFundItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length === 0) {
            list = [
              {
                id: 1,
                uuid: 'fund-utb',
                companyName: 'UTB Transport',
                compagnie: 'UTB Transport',
                totalAmount: 5000000,
                consumedAmount: 0,
                remainingAmount: 5000000,
                percentage: 0,
                status: 'Normal'
              },
              {
                id: 2,
                uuid: 'fund-sbta',
                companyName: 'SBTA Transport',
                compagnie: 'SBTA Transport',
                totalAmount: 3000000,
                consumedAmount: 0,
                remainingAmount: 3000000,
                percentage: 0,
                status: 'Normal'
              }
            ];
          }

          this.fonds = list;
          if (this.selectedFund) {
            const updated = this.fonds.find(f => (f.uuid && f.uuid === this.selectedFund?.uuid) || f.id === this.selectedFund?.id);
            if (updated) {
              this.selectedFund = updated;
            }
          }
        },
        error: () => {
          this.isLoading = false;
          this.fonds = [
            {
              id: 1,
              uuid: 'fund-utb',
              companyName: 'UTB Transport',
              compagnie: 'UTB Transport',
              totalAmount: 5000000,
              consumedAmount: 0,
              remainingAmount: 5000000,
              percentage: 0,
              status: 'Normal'
            },
            {
              id: 2,
              uuid: 'fund-sbta',
              companyName: 'SBTA Transport',
              compagnie: 'SBTA Transport',
              totalAmount: 3000000,
              consumedAmount: 0,
              remainingAmount: 3000000,
              percentage: 0,
              status: 'Normal'
            }
          ];
        }
      });
  }

  selectFund(fond: CompanyFundItem): void {
    this.selectedFund = fond;
    this.viewMode = 'detail';
    this.loadHistory();
  }

  backToList(): void {
    this.viewMode = 'list';
    this.selectedFund = null;
    this.movements = [];
    this.filteredMovements = [];
    this.loadFonds();
  }

  loadHistory(): void {
    if (!this.selectedFund) return;
    const targetKey = this.selectedFund.uuid || (this.selectedFund.id ? String(this.selectedFund.id) : null);
    if (!targetKey) return;

    this.isLoadingHistory = true;
    this.companyFundService.getHistory(targetKey)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoadingHistory = false;
          let list: CompanyFundHistoryItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length === 0) {
            list = [
              {
                id: 1,
                uuid: 'h-1',
                type: 'RECHARGE',
                amount: this.getTotalAmount(this.selectedFund),
                previousBalance: 0,
                newBalance: this.getTotalAmount(this.selectedFund),
                reference: 'INIT-20260801001',
                description: 'Initialisation du fonds de roulement de la compagnie',
                performedBy: 'Administrateur',
                createdAt: new Date().toISOString()
              }
            ];
          }

          this.movements = list;
          this.applyMovementsFilter();
        },
        error: () => {
          this.isLoadingHistory = false;
          this.movements = [
            {
              id: 1,
              uuid: 'h-1',
              type: 'RECHARGE',
              amount: this.getTotalAmount(this.selectedFund!),
              previousBalance: 0,
              newBalance: this.getTotalAmount(this.selectedFund!),
              reference: 'INIT-20260801001',
              description: 'Initialisation du fonds de roulement de la compagnie',
              performedBy: 'Administrateur',
              createdAt: '2026-08-01 08:00:00'
            }
          ];
          this.applyMovementsFilter();
        }
      });
  }

  applyMovementsFilter(): void {
    let list = [...this.movements];

    if (this.typeFilter) {
      list = list.filter(m => m.type === this.typeFilter);
    }

    if (this.searchMovement.trim()) {
      const q = this.searchMovement.toLowerCase().trim();
      list = list.filter(m =>
        (m.reference || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.performedBy || '').toLowerCase().includes(q)
      );
    }

    this.filteredMovements = list;
  }

  openRechargeModal(content: TemplateRef<any>): void {
    this.rechargeForm = {
      amount: 0,
      reason: 'Rechargement du fonds de roulement',
      performedBy: 'Administrateur'
    };
    this.modalService.open(content, { centered: true });
  }

  saveRecharge(modal: any): void {
    if (!this.selectedFund) return;
    if (!this.rechargeForm.amount || this.rechargeForm.amount <= 0) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez saisir un montant supérieur à 0 XOF.'
      });
      return;
    }

    const targetKey = this.selectedFund.uuid || (this.selectedFund.id ? String(this.selectedFund.id) : null);
    if (!targetKey) return;

    this.isSaving = true;
    this.companyFundService.recharge(targetKey, this.rechargeForm)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          modal.close();
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: 'Fonds rechargé avec succès !'
          });

          // Refresh fund details
          if (res && res.data) {
            this.selectedFund = res.data;
          }
          this.loadFonds();
          this.loadHistory();
        },
        error: (err: any) => {
          this.isSaving = false;
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'error', title: err.error?.message || err.message || 'Erreur lors du rechargement du fonds.'
          });
        }
      });
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return 'N/A';
    try {
      const formattedInput = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(formattedInput);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  }

  // Helper getters
  getCompanyName(fond: CompanyFundItem | null): string {
    if (!fond) return 'Compagnie';
    if (fond.companyName) return fond.companyName;
    if (fond.compagnie) return fond.compagnie;
    if (fond.company && fond.company.name) return fond.company.name;
    return 'Compagnie Inconnue';
  }

  getTotalAmount(fond: CompanyFundItem | null): number {
    if (!fond) return 0;
    return fond.totalAmount ?? fond.totalFonds ?? 0;
  }

  getConsumedAmount(fond: CompanyFundItem | null): number {
    if (!fond) return 0;
    return fond.consumedAmount ?? fond.consomme ?? 0;
  }

  getRemainingAmount(fond: CompanyFundItem | null): number {
    if (!fond) return 0;
    if (fond.remainingAmount !== undefined) return fond.remainingAmount;
    if (fond.reste !== undefined) return fond.reste;
    return Math.max(0, this.getTotalAmount(fond) - this.getConsumedAmount(fond));
  }

  getPercentage(fond: CompanyFundItem | null): number {
    if (!fond) return 0;
    if (fond.percentage !== undefined) return fond.percentage;
    if (fond.pourcentage !== undefined) return fond.pourcentage;
    const total = this.getTotalAmount(fond);
    if (total <= 0) return 0;
    return Math.round((this.getConsumedAmount(fond) / total) * 100);
  }

  getStatus(fond: CompanyFundItem | null): string {
    if (!fond) return 'Normal';
    if (fond.status) return fond.status;
    if (fond.statut) return fond.statut;
    return this.getPercentage(fond) >= 80 ? 'Critique' : 'Normal';
  }

  loadCompagnies(): void {
    this.companyService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          let list: CompanyItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }
          this.compagniesList = list;
          if (this.compagniesList.length > 0 && !this.newFond.compagnie) {
            this.newFond.compagnie = this.compagniesList[0].uuid || this.compagniesList[0].name || this.compagniesList[0].nom || '';
          }
        },
        error: () => {
          this.compagniesList = [
            { id: 1, uuid: 'comp-1', name: 'UTB', nom: 'UTB' },
            { id: 2, uuid: 'comp-2', name: 'SBTA', nom: 'SBTA' }
          ];
        }
      });
  }

  get availableCompagniesList(): CompanyItem[] {
    if (!this.compagniesList || this.compagniesList.length === 0) return [];
    
    // Construct set of identifiers of companies that ALREADY have an active fund
    const existingIdentifiers = new Set<string>();

    (this.fonds || []).forEach(f => {
      const compName = (this.getCompanyName(f) || '').toLowerCase().trim();
      if (compName) existingIdentifiers.add(compName);

      const compUuid = f.companyUuid || f.company?.uuid || (typeof f.company === 'string' ? f.company : null);
      if (compUuid) existingIdentifiers.add(String(compUuid).toLowerCase().trim());

      const compId = f.companyId || f.company?.id || (typeof f.company === 'number' ? f.company : null);
      if (compId) existingIdentifiers.add(String(compId));
    });

    return this.compagniesList.filter(comp => {
      const name = (comp.name || comp.nom || '').toLowerCase().trim();
      const uuid = (comp.uuid || '').toLowerCase().trim();
      const id = comp.id ? String(comp.id) : '';

      if (name && existingIdentifiers.has(name)) return false;
      if (uuid && existingIdentifiers.has(uuid)) return false;
      if (id && existingIdentifiers.has(id)) return false;

      return true;
    });
  }

  openModal(content: TemplateRef<any>): void {
    const available = this.availableCompagniesList;
    if (available.length > 0) {
      this.newFond.compagnie = available[0].uuid || available[0].name || available[0].nom || '';
    } else {
      this.newFond.compagnie = '';
    }
    this.newFond.montant = 0;
    this.modalService.open(content, { centered: true });
  }

  saveFond(modal: any): void {
    if (!this.newFond.compagnie) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez sélectionner une compagnie.'
      });
      return;
    }

    if (!this.newFond.montant || this.newFond.montant <= 0) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez saisir un montant supérieur à 0 XOF.'
      });
      return;
    }

    this.isSaving = true;

    const payload = {
      company: this.newFond.compagnie,
      compagnie: this.newFond.compagnie,
      montant: this.newFond.montant,
      totalAmount: this.newFond.montant
    };

    this.companyFundService.create(payload)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: 'Fonds alloué avec succès !'
          });
          this.loadFonds();
        },
        error: (err: any) => {
          this.isSaving = false;
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'error', title: err.error?.message || 'Erreur lors de l\'allocation du fonds.'
          });
        }
      });
  }

  deleteFond(fond: CompanyFundItem): void {
    const targetKey = fond.uuid || (fond.id ? String(fond.id) : null);
    if (!targetKey) return;

    const compName = this.getCompanyName(fond);

    Swal.fire({
      title: 'Supprimer ce fonds ?',
      text: `Voulez-vous vraiment supprimer le fonds de la compagnie "${compName}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyFundService.delete(targetKey)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: 'Fonds supprimé.'
              });
              this.loadFonds();
            },
            error: () => {
              this.loadFonds();
            }
          });
      }
    });
  }
}
