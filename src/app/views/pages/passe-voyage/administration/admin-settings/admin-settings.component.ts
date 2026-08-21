import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeatherIconDirective } from '../../../../../core/feather-icon/feather-icon.directive';
import Swal from 'sweetalert2';
import { GeneralSettingService } from '../../../../../core/services/setting/setting.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FeatherIconDirective],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  history: any[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private generalSettingService: GeneralSettingService
  ) {
    this.settingsForm = this.formBuilder.group({
      fraisServiceTicket: [600, [Validators.required, Validators.min(0)]],
      delaiOptionStandard: [14, [Validators.required, Validators.min(1)]],
      reserveFinanciereInitiale: ['10 000 000', [Validators.required]],
      cleApiSmsNotification: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadHistory();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.generalSettingService.getSettings()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && res.data) {
            this.settingsForm.patchValue({
              fraisServiceTicket: res.data.fraisServiceTicket ?? 600,
              delaiOptionStandard: res.data.delaiOptionStandard ?? 14,
              reserveFinanciereInitiale: res.data.reserveFinanciereInitiale ?? '10 000 000',
              cleApiSmsNotification: res.data.cleApiSmsNotification ?? ''
            }, { emitEvent: false });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Erreur lors du chargement des paramètres généraux', err);
        }
      });
  }

  loadHistory(): void {
    this.generalSettingService.getHistory()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.history = res.data;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'error',
        title: 'Veuillez remplir correctement les champs du formulaire.'
      });
      return;
    }

    Swal.fire({
      title: 'Justification de la modification',
      text: 'Veuillez saisir la raison de cette mise à jour (ex: Mise à jour des frais de service)',
      input: 'textarea',
      inputPlaceholder: 'Saisissez la raison ici...',
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez saisir une justification !';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isSaving = true;
        const payload = {
          ...this.settingsForm.value,
          reason: result.value
        };

        this.generalSettingService.saveSettings(payload)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              this.isSaving = false;
              Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                icon: 'success',
                title: 'Paramètres enregistrés avec succès.'
              });
              this.loadHistory();
            },
            error: (err) => {
              this.isSaving = false;
              Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                icon: 'error',
                title: err?.error?.message || 'Erreur serveur lors de la sauvegarde.'
              });
            }
          });
      }
    });
  }
}
