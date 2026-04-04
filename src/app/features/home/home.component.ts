import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);

  readonly searchText = signal('');

  onSearchInput(value: string): void {
    this.searchText.set(value);
  }

  submitSearch(event: Event): void {
    event.preventDefault();
    const q = this.searchText().trim();
    if (!q) {
      return;
    }
    void this.router.navigate(['/countries'], { queryParams: { search: q } });
  }

  browseAll(): void {
    void this.router.navigate(['/countries']);
  }
}
