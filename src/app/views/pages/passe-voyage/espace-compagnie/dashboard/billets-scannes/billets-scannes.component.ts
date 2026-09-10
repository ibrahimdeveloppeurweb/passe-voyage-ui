import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../../../../core/services/company/company.service';

@Component({
  selector: 'app-billets-scannes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billets-scannes.component.html',
  styleUrl: './billets-scannes.component.scss'
})
export class BilletsScannesComponent implements OnInit {

  loading: boolean = false;
  searchTerm: string = '';
  showAdvancedFilters: boolean = false;
  advStationFilter: string = '';
  startDate: string = '';
  endDate: string = '';

  scannedTickets: any[] = [];
  stationsList: string[] = [];

  // Pagination states
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  Math = Math;

  constructor(private companyService: CompanyService) { }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    const filters: any = {
      page: this.currentPage,
      limit: this.pageSize
    };
    
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      filters.search = this.searchTerm.trim();
    }
    if (this.advStationFilter && this.advStationFilter.trim() !== '') {
      filters.station = this.advStationFilter.trim();
    }
    if (this.startDate) {
      filters.startDate = this.startDate;
    }
    if (this.endDate) {
      filters.endDate = this.endDate;
    }

    this.companyService.getEspaceBilletsScannes(filters).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.scannedTickets = Array.isArray(data) ? data : [];
        if (res.meta) {
          this.totalItems = res.meta.total || 0;
        }

        // Setup station list globally (naïve approach if relying on current page unless backend provides global stats, 
        // to simplify we can extract stations from the current page's results but optimally backend should give it)
        const allStations: Set<string> = new Set();
        this.scannedTickets.forEach(t => {
          if (t.station) allStations.add(t.station);
        });
        this.stationsList = Array.from(allStations).sort();

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching scanned tickets', err);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalItems / this.pageSize)) {
      this.currentPage = page;
      this.loadTickets();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1; // reset to first page
    this.loadTickets();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.advStationFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.loadTickets();
  }
}
