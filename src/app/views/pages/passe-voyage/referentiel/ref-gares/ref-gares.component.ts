import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { StationService, StationItem } from '../../../../../core/services/station/station.service';
import { CompanyService, CompanyItem } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ref-gares',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './ref-gares.component.html',
  styleUrl: './ref-gares.component.scss'
})
export class RefGaresComponent implements OnInit, OnDestroy {
  gares: StationItem[] = [];
  compagnies: CompanyItem[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditMode: boolean = false;
  selectedGareUuid: string | null = null;

  gareForm: any = {
    ville: '',
    nom: '',
    compagnie: 'Toutes',
    statut: 'Actif'
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private stationService: StationService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadGares();
    this.loadCompagnies();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  loadGares(): void {
    this.isLoading = true;
    this.stationService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (Array.isArray(res)) {
            this.gares = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            this.gares = res.data;
          } else {
            this.gares = [];
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Erreur chargement gares:', err);
        }
      });
  }

  loadCompagnies(): void {
    this.companyService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            this.compagnies = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            this.compagnies = res.data;
          }
        },
        error: (err: any) => console.error('Erreur chargement compagnies:', err)
      });
  }

  openNewModal(content: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedGareUuid = null;
    const defaultCompany = this.compagnies.length > 0 ? (this.compagnies[0].name || this.compagnies[0].nom || '') : '';
    this.gareForm = {
      ville: '',
      nom: '',
      compagnie: defaultCompany,
      statut: 'Actif'
    };
    this.modalService.open(content, { centered: true });
  }

  openEditModal(content: TemplateRef<any>, gare: StationItem): void {
    this.isEditMode = true;
    this.selectedGareUuid = gare.uuid || (gare.id ? String(gare.id) : null);
    
    let compVal = '';
    if (gare.company && (gare.company.name || gare.company.nom)) {
      compVal = gare.company.name || gare.company.nom;
    } else if (gare.compagnie && gare.compagnie !== 'Toutes' && gare.compagnie !== 'Toutes les compagnies') {
      compVal = gare.compagnie;
    } else if (this.compagnies.length > 0) {
      compVal = this.compagnies[0].name || this.compagnies[0].nom || '';
    }

    let villeVal = '';
    if (gare.city && (gare.city.name || gare.city.nom)) {
      villeVal = gare.city.name || gare.city.nom;
    } else if (gare.ville) {
      villeVal = gare.ville;
    }

    this.gareForm = {
      ville: villeVal,
      nom: gare.nom || gare.name || '',
      compagnie: compVal,
      statut: gare.statut || (gare.isActive ? 'Actif' : 'Inactif')
    };
    this.modalService.open(content, { centered: true });
  }

  submitGareForm(modal: any): void {
    const villeName = (this.gareForm.ville || '').trim().toUpperCase();
    const gareName = (this.gareForm.nom || '').trim().toUpperCase();
    const compagnieName = (this.gareForm.compagnie || '').trim();

    if (!villeName) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner la ville.'
      });
      return;
    }

    if (!gareName) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner le nom de la gare.'
      });
      return;
    }

    if (!compagnieName) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez sélectionner une compagnie.'
      });
      return;
    }

    this.isSaving = true;

    const payload: any = {
      ville: villeName,
      city: villeName,
      nom: gareName,
      name: gareName,
      compagnie: this.gareForm.compagnie,
      company: this.gareForm.compagnie,
      statut: this.gareForm.statut,
      isActive: this.gareForm.statut === 'Actif'
    };

    if (this.isEditMode && this.selectedGareUuid) {
      this.stationService.update(this.selectedGareUuid, payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            this.isSaving = false;
            modal.close('save');
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: res.message || 'Gare modifiée avec succès.'
            });
            this.loadGares();
          },
          error: (err: any) => {
            this.isSaving = false;
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
              icon: 'error', title: err.error?.message || 'Erreur lors de la modification de la gare.'
            });
          }
        });
    } else {
      this.stationService.create(payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            this.isSaving = false;
            modal.close('save');
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: res.message || 'Gare ajoutée avec succès.'
            });
            this.loadGares();
          },
          error: (err: any) => {
            this.isSaving = false;
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
              icon: 'error', title: err.error?.message || 'Erreur lors de la création de la gare.'
            });
          }
        });
    }
  }

  toggleGareStatus(gare: StationItem): void {
    const targetUuid = gare.uuid || (gare.id ? String(gare.id) : null);
    if (!targetUuid) return;

    this.stationService.toggle(targetUuid)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: res.message || 'Statut mis à jour.'
          });
          this.loadGares();
        },
        error: (err: any) => {
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
            icon: 'error', title: err.error?.message || 'Erreur lors du changement de statut.'
          });
        }
      });
  }

  deleteGare(gare: StationItem): void {
    const targetUuid = gare.uuid || (gare.id ? String(gare.id) : null);
    if (!targetUuid) return;

    const name = gare.nom || gare.name || 'cette gare';

    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer ${name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.stationService.delete(targetUuid)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: (res: any) => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: res.message || 'Gare supprimée avec succès.'
              });
              this.loadGares();
            },
            error: (err: any) => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
                icon: 'error', title: err.error?.message || 'Erreur lors de la suppression.'
              });
            }
          });
      }
    });
  }
}
