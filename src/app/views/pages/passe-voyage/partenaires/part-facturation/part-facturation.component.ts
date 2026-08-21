import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CompanyInvoiceService, CompanyInvoiceItem } from '../../../../../core/services/company-invoice/company-invoice.service';
import { CompanyService, CompanyItem } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-part-facturation',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './part-facturation.component.html',
  styleUrl: './part-facturation.component.scss'
})
export class PartFacturationComponent implements OnInit, OnDestroy {
  factures: CompanyInvoiceItem[] = [];
  compagniesList: CompanyItem[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;

  newFacture = {
    reference: '',
    compagnie: '',
    periode: '',
    montant: 0,
    statut: 'En attente'
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private companyInvoiceService: CompanyInvoiceService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
    this.loadCompagnies();
  }

  loadFactures(): void {
    this.isLoading = true;
    this.companyInvoiceService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: CompanyInvoiceItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }
          this.factures = list;
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
          if (this.compagniesList.length > 0 && !this.newFacture.compagnie) {
            this.newFacture.compagnie = this.compagniesList[0].uuid || this.compagniesList[0].name || this.compagniesList[0].nom || '';
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
      this.newFacture.compagnie = this.compagniesList[0].uuid || this.compagniesList[0].name || this.compagniesList[0].nom || '';
    } else {
      this.newFacture.compagnie = '';
    }
    
    // Default period to current month in YYYY-MM format
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    this.newFacture.periode = `${now.getFullYear()}-${month}`;
    this.newFacture.montant = 0;
    this.modalService.open(content, { centered: true });
  }

  saveFacture(modal: any): void {
    if (!this.newFacture.compagnie) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez sélectionner une compagnie.'
      });
      return;
    }

    if (!this.newFacture.periode) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner la période de facturation.'
      });
      return;
    }

    if (!this.newFacture.montant || this.newFacture.montant <= 0) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez saisir un montant supérieur à 0 XOF.'
      });
      return;
    }

    this.isSaving = true;

    // Convert YYYY-MM to readable French period (e.g. 2026-08 -> Août 2026)
    let formattedPeriod = this.newFacture.periode;
    if (this.newFacture.periode.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = this.newFacture.periode.split('-');
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      const monthIdx = parseInt(month, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        formattedPeriod = `${monthNames[monthIdx]} ${year}`;
      }
    }

    const payload = {
      company: this.newFacture.compagnie,
      compagnie: this.newFacture.compagnie,
      periode: formattedPeriod,
      period: formattedPeriod,
      montant: this.newFacture.montant,
      amount: this.newFacture.montant
    };

    this.companyInvoiceService.create(payload)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: 'Facture générée avec succès !'
          });
          this.loadFactures();
        },
        error: (err: any) => {
          this.isSaving = false;
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'error', title: err.error?.message || 'Erreur lors de la génération de la facture.'
          });
        }
      });
  }

  togglePaid(fac: CompanyInvoiceItem): void {
    const targetKey = fac.uuid || (fac.id ? String(fac.id) : null);
    if (!targetKey) return;

    this.companyInvoiceService.togglePaid(targetKey)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          const newStatus = fac.statut === 'Payé' || fac.status === 'Payé' ? 'En attente' : 'Payé';
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: `Statut mis à jour : ${newStatus}`
          });
          this.loadFactures();
        },
        error: () => {
          this.loadFactures();
        }
      });
  }

  downloadInvoice(fac: CompanyInvoiceItem): void {
    const ref = fac.reference || 'Facture';
    Swal.fire({
      toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
      icon: 'info', title: `Téléchargement du bordereau ${ref}...`
    });
  }

  deleteInvoice(fac: CompanyInvoiceItem): void {
    const targetKey = fac.uuid || (fac.id ? String(fac.id) : null);
    if (!targetKey) return;

    const ref = fac.reference || 'cette facture';

    Swal.fire({
      title: 'Supprimer la facture ?',
      text: `Voulez-vous vraiment supprimer la facture "${ref}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyInvoiceService.delete(targetKey)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: 'Facture supprimée.'
              });
              this.loadFactures();
            },
            error: () => {
              this.loadFactures();
            }
          });
      }
    });
  }

  getInvoiceReference(fac: CompanyInvoiceItem): string {
    return fac.reference || 'FAC-2026-00-000';
  }

  getCompanyName(fac: CompanyInvoiceItem): string {
    if (fac.companyName) return fac.companyName;
    if (fac.compagnie) return fac.compagnie;
    if (fac.company && fac.company.name) return fac.company.name;
    return 'Compagnie Inconnue';
  }

  getPeriod(fac: CompanyInvoiceItem): string {
    return fac.periode || fac.period || '';
  }

  getAmount(fac: CompanyInvoiceItem): number {
    return fac.montant ?? fac.amount ?? 0;
  }

  getStatus(fac: CompanyInvoiceItem): string {
    return fac.statut || fac.status || 'En attente';
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
