import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of AuthService', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp('test@test.com', 'aklsjfla');

    expect(user.password).not.toEqual('aklsjfla');
    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error  if a user signs up with an email that is already in use', async () => {
    await service.signUp('test@test.com', 'password');

    const promise = service.signUp('test@test.com', 'password');

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).not.toEqual({
      id: 1,
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('throws an error if a user signs in with an unused email', async () => {
    const promise = service.signIn('test@test.com', 'password');

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).not.toEqual({
      id: 1,
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signUp('test@test.com', 'password');

    const promise = service.signIn('test@test.com', 'ksjdlfa');

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns user if right password is provided', async () => {
    await service.signUp('test@test.com', 'password');

    const user = await service.signIn('test@test.com', 'password');

    expect(user).toBeDefined();
  });
});
