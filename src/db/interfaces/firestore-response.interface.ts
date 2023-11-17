import { FirestoreResponseData } from './firestore-response-data.interface';

export interface FirestoreResponse {
  success: boolean;
  data?: FirestoreResponseData | FirestoreResponseData[];
  error?: any;
}
