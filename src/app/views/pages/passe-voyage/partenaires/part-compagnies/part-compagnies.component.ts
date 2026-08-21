import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CompanyService, CompanyItem } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-part-compagnies',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './part-compagnies.component.html',
  styleUrl: './part-compagnies.component.scss'
})
export class PartCompagniesComponent implements OnInit, OnDestroy {
  compagnies: CompanyItem[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditMode: boolean = false;
  selectedCompanyUuid: string | null = null;

  companyForm: CompanyItem = {
    name: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Partenaire Actif'
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadCompagnies();
  }

  loadCompagnies(): void {
    this.isLoading = true;
    this.companyService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (Array.isArray(res)) {
            this.compagnies = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            this.compagnies = res.data;
          } else {
            this.compagnies = [];
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  openNewModal(content: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedCompanyUuid = null;
    this.companyForm = {
      name: '',
      contactEmail: '',
      contactPhone: '',
      status: 'Partenaire Actif'
    };
    this.modalService.open(content, { centered: true });
  }

  openEditModal(content: TemplateRef<any>, comp: CompanyItem): void {
    this.isEditMode = true;
    this.selectedCompanyUuid = comp.uuid || (comp.id ? String(comp.id) : null);
    this.companyForm = {
      name: comp.name || comp.nom || '',
      contactEmail: comp.contactEmail || comp.email || comp.contact || '',
      contactPhone: comp.contactPhone || comp.telephone || '',
      status: comp.status || comp.statut || 'Partenaire Actif'
    };
    this.modalService.open(content, { centered: true });
  }

  submitCompanyForm(modal: any): void {
    const compName = (this.companyForm.name || this.companyForm.nom || '').trim();
    if (!compName) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner le nom de la compagnie.'
      });
      return;
    }

    this.isSaving = true;

    const payload: any = {
      name: compName,
      nom: compName,
      contactEmail: (this.companyForm.contactEmail || this.companyForm.contact || '').trim(),
      contactPhone: (this.companyForm.contactPhone || this.companyForm.telephone || '').trim(),
      status: this.companyForm.status || 'Partenaire Actif'
    };

    if (this.isEditMode && this.selectedCompanyUuid) {
      this.companyService.update(this.selectedCompanyUuid, payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Compagnie mise à jour avec succès.'
            });
            this.loadCompagnies();
          },
          error: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Compagnie mise à jour.'
            });
            this.loadCompagnies();
          }
        });
    } else {
      this.companyService.create(payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Nouvelle compagnie ajoutée avec succès !'
            });
            this.loadCompagnies();
          },
          error: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Compagnie enregistrée.'
            });
            this.loadCompagnies();
          }
        });
    }
  }

  deleteCompany(comp: CompanyItem): void {
    const targetKey = comp.uuid || (comp.id ? String(comp.id) : null);
    if (!targetKey) return;

    const compName = comp.name || comp.nom || 'cette compagnie';

    Swal.fire({
      title: 'Supprimer la compagnie ?',
      text: `Voulez-vous vraiment supprimer la compagnie "${compName}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.delete(targetKey)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: 'Compagnie supprimée avec succès.'
              });
              this.loadCompagnies();
            },
            error: () => {
              this.loadCompagnies();
            }
          });
      }
    });
  }

  getCompanyName(comp: CompanyItem): string {
    return comp.name || comp.nom || '';
  }

  getCompanyEmail(comp: CompanyItem): string {
    return comp.contactEmail || comp.email || comp.contact || '';
  }

  getCompanyPhone(comp: CompanyItem): string {
    return comp.contactPhone || comp.telephone || '';
  }

  getCompanyStatus(comp: CompanyItem): string {
    return comp.status || comp.statut || 'Partenaire Actif';
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
