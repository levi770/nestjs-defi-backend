import * as admin from 'firebase-admin'
import fastifyCookie from '@fastify/cookie'
import { contentParser } from 'fastify-file-interceptor'
import 'reflect-metadata'
import helmet from '@fastify/helmet'
import { ServiceAccount } from 'firebase-admin'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ValidationPipe } from './common/pipes/validation.pipe'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'

async function start() {
    try {
        const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
            logger: ['error', 'warn'],
        })

        const configService: ConfigService = app.get(ConfigService)
        const adminConfig: ServiceAccount = {
            projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
            privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
            clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        }

        admin.initializeApp({
            credential: admin.credential.cert(adminConfig),
        })

        app.register(fastifyCookie, {
            secret: 'my-secret',
        })

        app.register(helmet, {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: [`'self'`],
                    styleSrc: [`'self'`, `'unsafe-inline'`],
                    imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
                    scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
                },
            },
        })

        app.register(contentParser)

        app.useStaticAssets({
            root: join(process.cwd(), 'uploads'),
            prefix: '/uploads/',
            decorateReply: false,
        })

        app.useStaticAssets({
            root: join(process.cwd(), 'public'),
            prefix: '/public/',
            decorateReply: false,
        })

        app.setViewEngine({
            engine: { handlebars: require('handlebars') },
            templates: join(process.cwd(), 'views'),
        })

        app.enableCors({
            origin: true,
            allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
            methods: 'GET,PUT,POST,PATCH,DELETE,UPDATE',
            credentials: true,
        })

        app.useGlobalPipes(new ValidationPipe())

        app.setGlobalPrefix('v1')

        const config = new DocumentBuilder()
            .setTitle('CHARITY PROJECT')
            .setDescription(
                `REST API documentation \n
    Access levels: \n
    PUBLIC - available for everybody, \n
    ADMIN - available only for users with ADMIN role, \n
    USER - available only for users with USER role,`,
            )
            .setVersion('v1.0.1')
            .build()
        const document = SwaggerModule.createDocument(app, config)
        SwaggerModule.setup('/docs', app, document)

        await app.listen(5000, '127.0.0.1', async () => console.log(`Server started on port ${await app.getUrl()}`))
    } catch (error) {
        console.log(error)
    }
}
start()
