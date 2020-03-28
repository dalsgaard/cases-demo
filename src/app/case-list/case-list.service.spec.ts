import { TestBed } from '@angular/core/testing';

import { CaseListService } from './case-list.service';

describe('CaseListService', () => {
  let service: CaseListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaseListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
