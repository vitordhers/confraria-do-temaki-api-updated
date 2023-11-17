import { WhereFilterOp } from 'firebase-admin/firestore';

export interface FirestoreFilter {
  fieldPath: string;
  filterOp: WhereFilterOp;
  value: any;
}
