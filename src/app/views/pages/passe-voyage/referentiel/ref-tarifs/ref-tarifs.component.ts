import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { TariffService, TariffItem } from '../../../../../core/services/tariff/tariff.service';
import { RouteItem } from '../../../../../core/services/route/route.service';
import { CompanyItem } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ref-tarifs',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './ref-tarifs.component.html',
  styleUrl: './ref-tarifs.component.scss'
})
export class RefTarifsComponent implements OnInit, OnDestroy {
  tarifs: TariffItem[] = [];
  routes: RouteItem[] = [];
  compagnies: CompanyItem[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditMode: boolean = false;
  selectedTariffUuid: string | null = null;

  tarifForm: any = {
    trajet: '',
    compagnie: 'Toutes',
    prixBase: 0
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private tariffService: TariffService
  ) {}

  ngOnInit(): void {
    this.loadTarifs();
    this.loadRoutes();
    this.loadCompagnies();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  loadTarifs(): void {
    this.isLoading = true;
    this.tariffService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (Array.isArray(res)) {
            this.tarifs = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            this.tarifs = res.data;
          } else {
            this.tarifs = [];
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Erreur chargement tarifs:', err);
        }
      });
  }

  loadRoutes(): void {
    this.tariffService.getRoutes()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            this.routes = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            this.routes = res.data;
          }
        },
        error: (err: any) => console.error('Erreur chargement trajets:', err)
      });
  }

  loadCompagnies(): void {
    this.tariffService.getCompanies()
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
    this.selectedTariffUuid = null;
    const defaultRoute = this.routes.length > 0 ? (this.routes[0].uuid || (this.routes[0].villeDepart + ' - ' + this.routes[0].villeArrivee)) : '';
    const defaultCompany = this.compagnies.length > 0 ? (this.compagnies[0].name || this.compagnies[0].nom || '') : '';
    this.tarifForm = {
      trajet: defaultRoute,
      compagnie: defaultCompany,
      prixBase: 0
    };
    this.modalService.open(content, { centered: true });
  }

  openEditModal(content: TemplateRef<any>, tarif: TariffItem): void {
    this.isEditMode = true;
    this.selectedTariffUuid = tarif.uuid || (tarif.id ? String(tarif.id) : null);

    let routeVal = '';
    if (tarif.route && tarif.route.uuid) {
      routeVal = tarif.route.uuid;
    } else if (tarif.trajet) {
      routeVal = tarif.trajet;
    }

    let compVal = '';
    if (tarif.company && (tarif.company.name || tarif.company.nom)) {
      compVal = tarif.company.name || tarif.company.nom;
    } else if (tarif.compagnie && tarif.compagnie !== 'Toutes' && tarif.compagnie !== 'Général') {
      compVal = tarif.compagnie;
    } else if (this.compagnies.length > 0) {
      compVal = this.compagnies[0].name || this.compagnies[0].nom || '';
    }

    this.tarifForm = {
      trajet: routeVal,
      compagnie: compVal,
      prixBase: tarif.prix || tarif.price || 0
    };
    this.modalService.open(content, { centered: true });
  }

  submitTarifForm(modal: any): void {
    const routeVal = (this.tarifForm.trajet || '').trim();
    const compagnieVal = (this.tarifForm.compagnie || '').trim();
    const priceVal = Number(this.tarifForm.prixBase) || 0;

    if (!routeVal) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez sélectionner un trajet.'
      });
      return;
    }

    if (!compagnieVal) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez sélectionner une compagnie.'
      });
      return;
    }

    if (priceVal <= 0) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez saisir un prix de base valide.'
      });
      return;
    }

    this.isSaving = true;

    const payload: any = {
      trajet: routeVal,
      route: routeVal,
      routeUuid: routeVal,
      compagnie: this.tarifForm.compagnie,
      company: this.tarifForm.compagnie,
      prix: priceVal,
      price: priceVal,
      prixBase: priceVal
    };

    if (this.isEditMode && this.selectedTariffUuid) {
      this.tariffService.update(this.selectedTariffUuid, payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            this.isSaving = false;
            modal.close('save');
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: res.message || 'Tarif modifié avec succès.'
            });
            this.loadTarifs();
          },
          error: (err: any) => {
            this.isSaving = false;
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
              icon: 'error', title: err.error?.message || 'Erreur lors de la modification du tarif.'
            });
          }
        });
    } else {
      this.tariffService.create(payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            this.isSaving = false;
            modal.close('save');
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: res.message || 'Tarif créé avec succès.'
            });
            this.loadTarifs();
          },
          error: (err: any) => {
            this.isSaving = false;
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
              icon: 'error', title: err.error?.message || 'Erreur lors de la création du tarif.'
            });
          }
        });
    }
  }

  deleteTarif(tarif: TariffItem): void {
    const targetUuid = tarif.uuid || (tarif.id ? String(tarif.id) : null);
    if (!targetUuid) return;

    const name = tarif.trajet || 'ce tarif';

    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer le tarif de base pour ${name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tariffService.delete(targetUuid)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: (res: any) => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: res.message || 'Tarif supprimé avec succès.'
              });
              this.loadTarifs();
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
