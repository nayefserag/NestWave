import { Test, TestingModule } from '@nestjs/testing';
import { UserOperationsService } from './user.operations.service';

describe('UserOperationsService', () => {
  let service: UserOperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserOperationsService],
    }).compile();

    service = module.get<UserOperationsService>(UserOperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
