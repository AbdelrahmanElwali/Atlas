import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-panel',
  standalone: true,
  templateUrl: './error-panel.component.html',
  styleUrl: './error-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPanelComponent {
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
