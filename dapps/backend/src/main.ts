
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Simple Storage dApp API')
  .setDescription(
    'Backend API untuk membaca data blockchain Avalanche Fuji\n\n' +
    'Nama: Dwi Yantoro\n\n' +
    'NIM: 231011403367'
  )
  .setVersion('1.0')
  .addTag('Blockchain')
  .build();


  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
