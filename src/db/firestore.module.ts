import { Module } from '@nestjs/common';
import { FirestoreService } from './firestore.service';
import * as admin from 'firebase-admin';

@Module({
  providers: [
    FirestoreService,
    {
      provide: 'FirebaseAdmin',
      useFactory: () => {
        const serviceAccount = require('../../confraria-api-firebase-adminsdk.json');

        const options: admin.AppOptions = {
          credential: admin.credential.cert(serviceAccount),
        };
        admin.initializeApp(options);
        return admin;
      },
    },
  ],
  exports: [FirestoreService],
})
export class DbModule {}
