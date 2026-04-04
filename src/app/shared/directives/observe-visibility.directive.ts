import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: '[appObserveVisibility]',
  standalone: true,
})
export class ObserveVisibilityDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly becameVisible = output<void>();

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.becameVisible.emit();
          }
        }
      },
      { rootMargin: '240px 0px', threshold: 0 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
