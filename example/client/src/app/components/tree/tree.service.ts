import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreeNode } from './tree-node.model';

type TreeDataResponse = TreeNode[] | TreeNode | { treeData?: TreeNode[] | TreeNode };

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private apiUrl = 'http://localhost:8080/api/v1/get-tree-data';

  constructor(private http: HttpClient) {}

  getTreeData(): Observable<TreeDataResponse> {
    return this.http.get<TreeDataResponse>(this.apiUrl);
  }
}