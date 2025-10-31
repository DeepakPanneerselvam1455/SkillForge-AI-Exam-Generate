import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Course } from '../../../services/course';

@Component({
  selector: 'app-course-detail',
  imports: [FormsModule],
  templateUrl: './course-detail.html',
  styles: ``,
})
export class CourseDetail {
  private course = inject(Course);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | 'new' = 'new';
  model: any = { title: '', description: '' };
  loading = false;

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param === 'new' ? 'new' : Number(param);
    if (this.id !== 'new') {
      this.loading = true;
      this.course.getById(this.id as number).subscribe({
        next: (res) => { this.model = res; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  save() {
    this.loading = true;
    const req = this.id === 'new'
      ? this.course.create(this.model)
      : this.course.update(this.id as number, this.model);
    req.subscribe({
      next: () => this.router.navigateByUrl('/courses'),
      error: () => this.loading = false
    });
  }
}
