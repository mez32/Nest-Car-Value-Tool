import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/signup (POST)', () => {
    const userEmail = 'test1@test.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: userEmail, password: 'password' })
      .expect(201)
      .then((res) => {
        const { email, id } = res.body;
        expect(email).toEqual(userEmail);
        expect(id).toBeDefined();
      });
  });

  it('log in as new user, thtn get currently logged in user', async () => {
    const email = 'test@test.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'password' })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
