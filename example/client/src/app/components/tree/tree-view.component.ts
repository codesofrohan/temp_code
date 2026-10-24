import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from './tree-node.model';
import { TreeService } from './tree.service';

function isTreeNode(value: TreeNode | { treeData?: TreeNode[] | TreeNode }): value is TreeNode {
  return 'name' in value;
}

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = signal<TreeNode[]>([]);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  @ViewChildren('childrenList') childrenLists!: QueryList<ElementRef<HTMLElement>>;

  private resizeObserver?: ResizeObserver;

  constructor(private treeService: TreeService) {}

  ngOnInit(): void {
    this.fetchTreeData();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateConnectorLines());
    this.childrenLists.changes.subscribe(() => this.observeTreeLayout());
    this.observeTreeLayout();

    // Center the scroll position after view loads
    setTimeout(() => this.centerScroll(), 100);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  fetchTreeData(): void {
    this.treeService.getTreeData().subscribe({
      next: (res) => {
        console.log('API Response received:', res);
        
        if (!res) {
          console.warn('Response payload is empty');
          return;
        }

        let treeData: TreeNode[];
        if (Array.isArray(res)) {
          treeData = res;
        } else if (isTreeNode(res)) {
          treeData = [res];
        } else if (!res.treeData) {
          treeData = [];
        } else {
          treeData = Array.isArray(res.treeData) ? res.treeData : [res.treeData];
        }
        
        this.setInitialExpansion(treeData);
        this.dataSource.set(treeData);
        
        setTimeout(() => this.centerScroll(), 150);
      },
      error: (err) => {
        console.error('Failed to load tree data', err);
      }
    });
  }

  centerScroll(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }

  private observeTreeLayout(): void {
    if (!this.resizeObserver) {
      return;
    }

    this.resizeObserver.disconnect();
    this.resizeObserver.observe(this.scrollContainer.nativeElement);
    this.childrenLists.forEach(({ nativeElement }) => this.resizeObserver?.observe(nativeElement));
    this.updateConnectorLines();
  }

  private updateConnectorLines(): void {
    this.childrenLists.forEach(({ nativeElement }) => {
      const firstBranch = nativeElement.firstElementChild;
      const lastBranch = nativeElement.lastElementChild;
      const firstCard = firstBranch?.querySelector<HTMLElement>(':scope > .node-box');
      const lastCard = lastBranch?.querySelector<HTMLElement>(':scope > .node-box');

      if (!firstCard || !lastCard) {
        return;
      }

      const listLeft = nativeElement.getBoundingClientRect().left;
      const start = firstCard.getBoundingClientRect().left + firstCard.offsetWidth / 2 - listLeft;
      const end = lastCard.getBoundingClientRect().left + lastCard.offsetWidth / 2 - listLeft;

      nativeElement.style.setProperty('--connector-start', `${start}px`);
      nativeElement.style.setProperty('--connector-end', `${end}px`);
    });
  }

  setInitialExpansion(nodes: TreeNode[]): void {
    nodes.forEach(node => {
      node.expanded = false;
      if (node.children && node.children.length > 0) {
        this.setInitialExpansion(node.children);
      }
    });
  }

  toggleNode(node: TreeNode): void {
    node.expanded = !node.expanded;
    // Re-center slightly or let user scroll freely after expanding
    setTimeout(() => this.centerScroll(), 100);
  }
}