import { NestFactory } from '@nestjs/core';
import { AppModule } from 'root_app/app.module';


async function bootstrap() {

  const hostIp = process.env.HOST_IP ?? 'localhost'
  const app = await NestFactory.create(AppModule);
        await app.listen(3100, hostIp);
  app.enableCors({
  origin: ['http://localhost:5175', process.env.FRONTEND_URL ],
  credentials: true,
});
}
bootstrap();
