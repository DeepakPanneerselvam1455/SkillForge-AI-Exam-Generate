import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ai } from '../../services/ai';

@Component({
  selector: 'app-ai-assistant',
  imports: [FormsModule],
  templateUrl: './ai-assistant.html',
  styles: ``,
})
export class AiAssistant {
  private ai = inject(Ai);

  prompt = '';
  response: any = null;
  loading = false;
  error = '';

  generate() {
    if (!this.prompt) return;
    this.loading = true;
    this.error = '';
    this.response = null;
    this.ai.analyzeText(this.prompt).subscribe({
      next: (res) => { this.response = res; this.loading = false; },
      error: () => { this.error = 'AI request failed'; this.loading = false; }
    });
  }
}
