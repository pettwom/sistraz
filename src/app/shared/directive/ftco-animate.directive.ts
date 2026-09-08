import { AfterContentInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[ftcoAnimate]',
  standalone:true
})

export class FtcoAnimateDirective implements AfterContentInit{
  private el  = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterContentInit(): void {
    this.observer = new IntersectionObserver(
      (entries)=>{
        entries.forEach((entry)=>{
          if(entry.isIntersecting){
            this.el.nativeElement.classList.add('ftco-animate-visible');
            this.observer?.unobserve(this.el.nativeElement);
          }
        })
      },{threshold:0.8}
    );
    this.observer.observe(this.el.nativeElement);
  }
  ngOnDestroy():void{
    this.observer?.disconnect();
  }
}
