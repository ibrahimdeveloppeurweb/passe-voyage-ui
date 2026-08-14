import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cred-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cred-parametres.component.html',
  styleUrl: './cred-parametres.component.scss'
})
export class CredParametresComponent {
  plafonds = {
    nouvelUtilisateur: 5000,
    standard: 10000,
    vip: 25000
  };

  regles = {
    autoApprove: true,
    autoReject: true
  };

  modifierPlafond(profil: string, cle: 'nouvelUtilisateur' | 'standard' | 'vip') {
    Swal.fire({
      title: `Modifier plafond : ${profil}`,
      input: 'number',
      inputValue: this.plafonds[cle],
      inputLabel: 'Nouveau plafond (en FCFA)',
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
        this.plafonds[cle] = Number(result.value);
        Swal.fire('Mis à jour !', `Le plafond pour le profil ${profil} est maintenant de ${this.plafonds[cle]} FCFA.`, 'success');
      }
    });
  }

  sauvegarderRegles() {
    Swal.fire({
      icon: 'success',
      title: 'Règles sauvegardées',
      text: 'Les paramètres de l\'algorithme ont été mis à jour avec succès.',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
