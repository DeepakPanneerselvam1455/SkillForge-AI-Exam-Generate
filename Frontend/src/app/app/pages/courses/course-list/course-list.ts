import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '../../../services/course';

@Component({
  selector: 'app-course-list',
  imports: [RouterLink],
  templateUrl: './course-list.html',
  styles: ``,
})
export class CourseList {
  private course = inject(Course);
  items: any[] = [];
  loading = true;
  ngOnInit() {
    this.course.list().subscribe({
      next: (res: any) => { this.items = res?.content || res || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
