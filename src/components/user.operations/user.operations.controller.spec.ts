import { Test, TestingModule } from '@nestjs/testing';
import { UserOperationsController } from './user.operations.controller';

describe('UserOperationsController', () => {
  let controller: UserOperationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserOperationsController],
    }).compile();

    controller = module.get<UserOperationsController>(UserOperationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
