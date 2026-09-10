import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CompanyService } from '../../../../../../core/services/company/company.service';

@Component({
  selector: 'app-activites-gares',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activites-gares.component.html',
  styleUrl: './activites-gares.component.scss'
})
export class ActivitesGaresComponent implements OnInit {

  searchTerm: string = '';
  showAdvancedFilters: boolean = false;
  advStatusFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';

  stations: any[] = [];
  filteredStations: any[] = [];
  loading: boolean = true;

  constructor(private companyService: CompanyService) { }

  ngOnInit(): void { 
    this.fetchGares();
  }

  fetchGares(): void {
    this.loading = true;
    const filters = {
      search: this.searchTerm,
      status: this.advStatusFilter,
      startDate: this.startDateFilter,
      endDate: this.endDateFilter
    };

    this.companyService.getEspaceActivitesGares(filters).subscribe({
      next: (res: any) => {
        this.stations = res.data?.stations || [];
        this.filteredStations = [...this.stations];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les activités des gares.', 'error');
      }
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  applyFilters(): void {
    this.fetchGares();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.advStatusFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.fetchGares();
  }

  voirDetails(station: any): void {
    Swal.fire({
      title: `<span style="color:#0d6efd"><i class="feather icon-map-pin"></i> ${station.name}</span>`,
      html: `
        <div class="text-start mt-3">
          <p><strong>Ville :</strong> ${station.city}</p>
          <p><strong>Statut :</strong> <span class="badge ${station.status === 'Active' ? 'bg-success' : 'bg-secondary'}">${station.status}</span></p>
          <hr/>
          <p><strong>Agents Déployés :</strong> ${station.activeAgents} agents</p>
          <p><strong>Total Scans (Aujourd'hui) :</strong> ${station.totalScans} billets</p>
          <p><strong>Chiffre d'Affaires :</strong> <span class="text-success fw-bold">${station.revenue}</span></p>
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#3085d6'
    });
  }

  voirStatistiques(station: any): void {
    Swal.fire({
      title: 'Chargement...',
      html: 'Récupération des statistiques...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.companyService.getStationStats(station.uuid).subscribe({
      next: (res: any) => {
        const stats = res.data;
        const weeklyVolumes = stats.weeklyVolumes || [];
        const topAgents = stats.topAgents || [];

        let barsHtml = '';
        for (let i = 0; i < weeklyVolumes.length; i++) {
            const vol = weeklyVolumes[i];
            barsHtml += `
              <div style="display:flex; flex-direction:column; align-items:center; width:50px;">
                <div style="height: 140px; width: 100%; background:#f3f4f6; border-radius:6px; position:relative; overflow:hidden;">
                  <div style="position:absolute; bottom:0; left:0; right:0; height:${vol.percentage}%; background:#0d6efd; border-radius:6px; transition: height 0.5s ease-in-out;"></div>
                </div>
                <span style="font-size:12px; font-weight: 500; color:#6b7280; margin-top:8px;">${vol.day}</span>
              </div>
            `;
        }

        let agentsHtml = '';
        if (topAgents.length === 0) {
            agentsHtml = `<tr><td colspan="3" class="text-center text-muted py-3">Aucun agent assigné ou actif</td></tr>`;
        } else {
            for (const agent of topAgents) {
                agentsHtml += `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 16px; display:flex; align-items:center;"><div style="width:32px; height:32px; background:#e0e7ff; color:#4338ca; border-radius:50%; text-align:center; line-height:32px; font-size:12px; margin-right:12px; font-weight:bold;">${agent.initials}</div> <strong>${agent.name}</strong></td>
                    <td style="padding: 12px 16px; color:#6b7280;">${agent.shift}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight:bold; color:#10b981; font-size: 16px;">${agent.count} val.</td>
                  </tr>
                `;
            }
        }

        Swal.fire({
          title: `<span style="color:#6f42c1; font-size: 24px;"><i class="feather icon-bar-chart-2"></i> Statistiques - ${station.name}</span>`,
          html: `
            <div class="text-start mt-3">
              <p class="text-muted fs-13px text-center mb-5">Volume hebdomadaire des pass scannés localement.</p>
              
              <div style="display:flex; justify-content:space-around; align-items:flex-end; padding:25px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                ${barsHtml}
              </div>

              <h6 class="fw-bold mb-3" style="font-size:15px; text-transform:uppercase; color:#374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Performances des agents de la gare</h6>
              <div style="border: 1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
                <table style="width: 100%; font-size: 14px; text-align:left;">
                  <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="padding: 12px 16px;">Top Agent</th>
                    <th style="padding: 12px 16px;">Tour de garde</th>
                    <th style="padding: 12px 16px; text-align: right;">Scans réalisés</th>
                  </tr>
                  ${agentsHtml}
                </table>
              </div>
            </div>
          `,
          showCloseButton: true,
          confirmButtonText: 'Fermer',
          confirmButtonColor: '#0d6efd',
          width: '750px'
        });
      },
      error: (err: any) => {
        Swal.fire('Erreur', 'Impossible de charger les statistiques de la gare.', 'error');
      }
    });
  }

}
