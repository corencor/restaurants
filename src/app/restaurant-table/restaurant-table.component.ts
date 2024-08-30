import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restaurant-table',
  templateUrl: './restaurant-table.component.html',
  styleUrls: ['./restaurant-table.component.css']
})
export class RestaurantTableComponent implements OnInit {
  searchQuery: string = '';
  sortColumn: string = 'rating';
  sortDirection: string = 'desc'; // 'asc' for ascending, 'desc' for descending

  filters = {
    all: true,
    center: false,
    north: false,
    west: false,
    south: false,
    east: false,
    southeast: false
  };

  restaurants: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('/assets/restaurants.json').subscribe(data => {
      this.restaurants = data;
    });
  }

  get filteredRestaurants() {
    let filtered = this.restaurants.filter(restaurant => {
      const nameMatches = restaurant.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const typeMatches = restaurant.type ? restaurant.type.toLowerCase().includes(this.searchQuery.toLowerCase()) : false;
      const areaMatches = this.applyFilters(restaurant.area);
      return (nameMatches || typeMatches) && areaMatches;
    });

    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];

        let comparison = 0;
        if (valueA > valueB) {
          comparison = 1;
        } else if (valueA < valueB) {
          comparison = -1;
        }

        // Secondary sorting by reviews if the primary sort is by rating
        if (comparison === 0 && this.sortColumn === 'rating') {
          const secondaryValueA = a['reviews'];
          const secondaryValueB = b['reviews'];

          if (secondaryValueA > secondaryValueB) {
            comparison = 1;
          } else if (secondaryValueA < secondaryValueB) {
            comparison = -1;
          }
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }

  applyFilters(area: string | null): boolean {
    if (this.filters.all) {
      return true;
    }

    if (!area) {
      return false;
    }

    const lowerCaseArea = area.toLowerCase();
    return (this.filters.center && lowerCaseArea.includes('centrum')) ||
           (this.filters.north && lowerCaseArea.includes('noord')) ||
           (this.filters.west && lowerCaseArea.includes('west')) ||
           (this.filters.south && (lowerCaseArea.includes('zuid') && !lowerCaseArea.includes('zuidoost'))) ||
           (this.filters.east && (lowerCaseArea.includes('oost') && !lowerCaseArea.includes('zuidoost'))) ||
           (this.filters.southeast && lowerCaseArea.includes('zuidoost'));
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  toggleFilter(area: string, checked: boolean) {
    if (area === 'all') {
      this.filters = {
        all: true,
        center: false,
        north: false,
        west: false,
        south: false,
        east: false,
        southeast: false
      };
    } else {
      this.filters.all = false;
      this.filters[area] = checked;
    }
  }
}
