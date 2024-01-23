import {HttpException, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerModule} from '@nestjs/throttler';

import {AuthModule} from './auth/auth.module';
import {environment} from './environment';
import {GameModule} from './game/game.module';
import {UserModule} from './user/user.module';
import {SentryInterceptor, SentryModule, SentryModuleOptions} from "@ntegral/nestjs-sentry";
import {APP_INTERCEPTOR, HttpAdapterHost} from "@nestjs/core";
import {AchievementModule} from "./achievement/achievement.module";
import {AchievementSummaryModule} from "./achievement-summary/achievement-summary.module";
import {Integrations} from "@sentry/node";
import {EventModule} from '@mean-stream/nestx';
import {Transport} from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, {
      ignoreUndefined: true,
    }),
    ThrottlerModule.forRoot([environment.rateLimit]),
    EventModule.forRoot({
      transport: Transport.NATS,
      transportOptions: environment.nats,
      userIdProvider: async (req) => 'u1',
    }),
    ScheduleModule.forRoot(),
    SentryModule.forRootAsync({
      inject: [HttpAdapterHost],
      useFactory: async (adapterHost: HttpAdapterHost) => ({
        dsn: environment.sentry.dsn,
        environment: environment.nodeEnv,
        release: environment.version,
        tracesSampleRate: environment.sentry.tracesSampleRate,
        integrations: [
          new Integrations.Http({tracing: true}),
          new Integrations.Express({
            app: adapterHost.httpAdapter.getInstance(),
          }),
        ],
      } satisfies SentryModuleOptions),
    }),
    AuthModule,
    UserModule,
    AchievementSummaryModule,
    AchievementModule,
    GameModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new SentryInterceptor({
        filters: [{
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus(),
        }],
      }),
    }
  ]
})
export class AppModule {
}
