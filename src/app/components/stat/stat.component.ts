import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat',
  standalone: true,
  imports: [],
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.scss']
})
export class StatComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
}
