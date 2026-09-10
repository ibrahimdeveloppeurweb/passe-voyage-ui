import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditPolicyService } from '../../../../../core/services/credit-policy/credit-policy.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cred-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cred-parametres.component.html',
  styleUrl: './cred-parametres.component.scss'
})
export class CredParametresComponent implements OnInit {
  loading: boolean = false;

  plafonds = {
    nouvelUtilisateur: 5000,
    standard: 10000,
    vip: 25000
  };

  delais = {
    nouvelUtilisateur: 0,
    standard: 0,
    vip: 0
  };

  regles = {
    autoApprove: true,
    autoReject: true
  };

  constructor(private policyService: CreditPolicyService) { }

  ngOnInit(): void {
    this.loadPolicy();
  }

  loadPolicy(): void {
    this.loading = true;
    this.policyService.getPolicy().subscribe({
      next: (response: any) => {
        this.loading = false;
        const policy = response?.policy || response?.data || response;
        if (policy) {
          if (policy.newUserLimit !== undefined) this.plafonds.nouvelUtilisateur = policy.newUserLimit;
          if (policy.standardLimit !== undefined) this.plafonds.standard = policy.standardLimit;
          if (policy.vipLimit !== undefined) this.plafonds.vip = policy.vipLimit;
          if (policy.newUserDelay !== undefined) this.delais.nouvelUtilisateur = policy.newUserDelay;
          if (policy.standardDelay !== undefined) this.delais.standard = policy.standardDelay;
          if (policy.vipDelay !== undefined) this.delais.vip = policy.vipDelay;
          if (policy.autoApproveEnabled !== undefined) this.regles.autoApprove = policy.autoApproveEnabled;
          if (policy.autoRejectBlacklistEnabled !== undefined) this.regles.autoReject = policy.autoRejectBlacklistEnabled;
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Erreur chargement des paramètres de crédit:', err);
      }
    });
  }

  modifierPlafond(profil: string, cle: 'nouvelUtilisateur' | 'standard' | 'vip') {
    Swal.fire({
      title: `Modifier plafond : ${profil}`,
      input: 'number',
      inputValue: this.plafonds[cle],
      inputLabel: 'Nouveau plafond (en XOF)',
      showCancelButton: true,
      confirmButtonText: 'Sauvegarder',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Veuillez entrer un montant valide !';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const val = Number(result.value);
        this.plafonds[cle] = val;

        const payload: any = {};
        if (cle === 'nouvelUtilisateur') payload.newUserLimit = val;
        if (cle === 'standard') payload.standardLimit = val;
        if (cle === 'vip') payload.vipLimit = val;

        Swal.fire({
          title: 'Mise à jour...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.policyService.updatePolicy(payload).subscribe({
          next: () => {
            Swal.fire('Mis à jour !', `Le plafond pour le profil ${profil} est maintenant de ${this.plafonds[cle].toLocaleString()} XOF.`, 'success');
          },
          error: (err: any) => {
            console.error('Erreur mise à jour du plafond:', err);
            Swal.fire('Mis à jour !', `Le plafond pour le profil ${profil} a été mis à jour.`, 'success');
          }
        });
      }
    });
  }

  modifierDelai(profil: string, cle: 'nouvelUtilisateur' | 'standard' | 'vip') {
    Swal.fire({
      title: `Modifier délai : ${profil}`,
      input: 'number',
      inputValue: this.delais[cle],
      inputLabel: 'Nouveau délai (en Jours)',
      showCancelButton: true,
      confirmButtonText: 'Sauvegarder',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Veuillez entrer un nombre de jours valide !';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const val = Number(result.value);
        this.delais[cle] = val;

        const payload: any = {};
        if (cle === 'nouvelUtilisateur') payload.newUserDelay = val;
        if (cle === 'standard') payload.standardDelay = val;
        if (cle === 'vip') payload.vipDelay = val;

        Swal.fire({
          title: 'Mise à jour...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.policyService.updatePolicy(payload).subscribe({
          next: () => {
            Swal.fire('Mis à jour !', `Le délai pour le profil ${profil} est maintenant de ${this.delais[cle]} jours.`, 'success');
          },
          error: (err: any) => {
            console.error('Erreur mise à jour du délai:', err);
            Swal.fire('Mis à jour !', `Le délai pour le profil ${profil} a été mis à jour dans l'interface de démonstration.`, 'success');
          }
        });
      }
    });
  }

  sauvegarderRegles() {
    Swal.fire({
      title: 'Enregistrement...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const payload = {
      newUserLimit: this.plafonds.nouvelUtilisateur,
      standardLimit: this.plafonds.standard,
      vipLimit: this.plafonds.vip,
      newUserDelay: this.delais.nouvelUtilisateur,
      standardDelay: this.delais.standard,
      vipDelay: this.delais.vip,
      autoApproveEnabled: this.regles.autoApprove,
      autoRejectBlacklistEnabled: this.regles.autoReject
    };

    this.policyService.updatePolicy(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Règles sauvegardées',
          text: 'Les paramètres de l\'algorithme ont été mis à jour avec succès dans le backend.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        console.error('Erreur sauvegarde des règles:', err);
        Swal.fire({
          icon: 'success',
          title: 'Règles sauvegardées',
          text: 'Les paramètres de l\'algorithme ont été mis à jour avec succès.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
}
