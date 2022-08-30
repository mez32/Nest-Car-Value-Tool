import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'password',
        } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'password' } as User]),
      // remove: () => {}
    };
    fakeAuthService = {
      signIn: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with a given email', async () => {
    const user = await controller.findAllUsers('test@test.com');

    expect(user.length).toEqual(1);
    expect(user[0].email).toEqual('test@test.com');
  });

  it('findUser returns user with correct id', async () => {
    const user = await controller.findUser('5');

    expect(user).toBeDefined();
    expect(user.id).toEqual(5);
  });

  it('findUser throwa error if user with given id not found', async () => {
    fakeUsersService.findOne = () => null;

    const promise = controller.findUser('1');

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  });

  it('signIn updates session object and returns user', async () => {
    const session = { userId: null };

    const user = await controller.signIn(
      { email: 'test@test.com', password: 'password' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
