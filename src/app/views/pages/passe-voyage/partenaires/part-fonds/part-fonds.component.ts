import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CompanyFundService, CompanyFundItem } from '../../../../../core/services/company-fund/company-fund.service';
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

  newFond = {
    compagnie: '',
    montant: 0
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

          if (list.length > 0) {
            this.fonds = list;
          } else {
            this.fonds = [];
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
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
            { id: 2, uuid: 'comp-2', name: 'MT', nom: 'MT' }
          ];
        }
      });
  }

  openModal(content: TemplateRef<any>): void {
    if (this.compagniesList.length > 0) {
      this.newFond.compagnie = this.compagniesList[0].uuid || this.compagniesList[0].name || this.compagniesList[0].nom || '';
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

  getCompanyName(fond: CompanyFundItem): string {
    if (fond.companyName) return fond.companyName;
    if (fond.compagnie) return fond.compagnie;
    if (fond.company && fond.company.name) return fond.company.name;
    return 'Compagnie Inconnue';
  }

  getTotalAmount(fond: CompanyFundItem): number {
    return fond.totalAmount ?? fond.totalFonds ?? 0;
  }

  getConsumedAmount(fond: CompanyFundItem): number {
    return fond.consumedAmount ?? fond.consomme ?? 0;
  }

  getRemainingAmount(fond: CompanyFundItem): number {
    if (fond.remainingAmount !== undefined) return fond.remainingAmount;
    if (fond.reste !== undefined) return fond.reste;
    return Math.max(0, this.getTotalAmount(fond) - this.getConsumedAmount(fond));
  }

  getPercentage(fond: CompanyFundItem): number {
    if (fond.percentage !== undefined) return fond.percentage;
    if (fond.pourcentage !== undefined) return fond.pourcentage;
    const total = this.getTotalAmount(fond);
    if (total <= 0) return 0;
    return Math.round((this.getConsumedAmount(fond) / total) * 100);
  }

  getStatus(fond: CompanyFundItem): string {
    if (fond.status) return fond.status;
    if (fond.statut) return fond.statut;
    return this.getPercentage(fond) >= 80 ? 'Critique' : 'Normal';
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

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
