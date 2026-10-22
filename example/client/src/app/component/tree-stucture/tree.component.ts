import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree'; // Fixed import location
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './tree.component.html',
  styles: [`
    .api-tree { list-style-type: none; padding-left: 0; }
    .api-tree ul { list-style-type: none; padding-left: 24px; }
    .api-tree-invisible { display: none; }
    .mat-tree-node { display: flex; align-items: center; min-height: 48px; }
    .error { color: red; }
  `] // Switched to inline styles to prevent missing file error
})
export class TreeComponent implements OnInit {
  private http = inject(HttpClient);

  // Added explicit type for node to satisfy strict TS rules
  treeControl = new NestedTreeControl<TreeNode>((node: TreeNode) => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.fetchTreeData();
  }

  fetchTreeData(): void {
    this.isLoading = true;
    this.http.get<TreeNode[]>('http://localhost:8080/api/v1/get-tree-details')
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching tree details:', error); // Fixed console.err typo
          this.errorMessage = 'Failed to load tree structure.';
          this.isLoading = false;
        }
      });
  }

  hasChild = (_: number, node: TreeNode): boolean => !!node.children && node.children.length > 0;
}