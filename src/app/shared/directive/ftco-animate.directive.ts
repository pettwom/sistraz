import { AfterContentInit, Directive, ElementRef, OnDestroy, inject, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ftcoAnimate]',
  standalone: true
})

export class FtcoAnimateDirective implements AfterViewInit, OnDestroy {

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
/*     console.log(
      'FtcoAnimate ejecutándose:',
      this.el.nativeElement
    ); */
    const elemento = this.el.nativeElement;

    // Estado inicial
    this.renderer.addClass(elemento, 'ftco-animate');

    this.observer = new IntersectionObserver(
      (entries) => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            // console.log('Elemento visible');

            // this.renderer.setStyle(elemento, 'visibility', 'visible');
            // this.renderer.setStyle(elemento, 'opacity', '1');

            // this.renderer.addClass(elemento, 'ftco-animated');
            // this.renderer.addClass(elemento, this.animation);

            // this.observer?.unobserve(elemento);
              /* console.log('Elemento visible'); */

              this.renderer.addClass(
                elemento,
                'fadeInUp'
              );

              this.renderer.addClass(
                elemento,
                'ftco-animated'
              );

            //   Animar solamente una vez
              this.observer?.unobserve(elemento);
          }

        });

      },
      {
        threshold: 0.15
      }
    );

    this.observer.observe(elemento);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
