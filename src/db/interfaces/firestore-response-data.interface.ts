import { DocumentData } from 'firebase-admin/firestore';

export interface FirestoreResponseData {
  docId: string;
  data: DocumentData;
}
