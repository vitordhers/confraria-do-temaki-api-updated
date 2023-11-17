import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { app } from 'firebase-admin';
import {
  DocumentData,
  Firestore,
  Query,
  CollectionReference,
} from 'firebase-admin/firestore';
import { Collection } from './collection.enum';
import { v4 as uuid } from 'uuid';
import { inspect } from 'util';
import { DbCategory } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { DbMessageContact } from '../messages/entities/db-message-contact.entity';
import { DbFranchisingLead } from '../messages/entities/db-franchising-lead.entity';
import { DbUnit } from '../units/entities/unit.entity';
import { DbProduct } from '../products/entities/product.entity';
import {
  FirestoreFilter,
  FirestoreOrderBy,
  FirestorePaginate,
  FirestoreResponse,
  FirestoreResponseData,
} from './interfaces';
import { IDbUser } from 'src/shared/interfaces/db-user.interface';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private _firestore?: Firestore;
  private logger = new Logger('FirestoreService');

  constructor(
    @Inject('FirebaseAdmin')
    private readonly admin: app.App,
  ) {}

  onModuleInit() {
    this.instantiateFirestore();
  }

  private instantiateFirestore() {
    this._firestore = this.admin.firestore();
    this._firestore.settings({ ignoreUndefinedProperties: true });
  }

  private get firestore() {
    if (!this._firestore) {
      this._firestore;
    }
    return this._firestore as Firestore;
  }

  getCollectionPath(collection: Collection) {
    switch (collection) {
      case Collection.USERS_AUTH:
        return 'users';
      case Collection.USERS:
        return 'users';
      case Collection.CATEGORIES:
        return 'categories';
      case Collection.MESSAGES:
        return 'messages';
      case Collection.PRODUCTS:
        return 'products';
      case Collection.UNITS:
        return 'units';
      case Collection.LEADS:
        return 'leads';
    }
  }

  getCollectionRef(collection: Collection) {
    const collectionPath = this.getCollectionPath(collection);
    return this.firestore.collection(collectionPath);
  }

  async create<D>(collection: Collection, data: D): Promise<FirestoreResponse> {
    const collectionRef = this.getCollectionRef(collection);
    const docId = uuid();
    try {
      const result = await collectionRef.doc(docId).set(data);
      if (!result) {
        throw new BadRequestException(
          `create failed ${inspect({ result }, { depth: null })}`,
        );
      }
      return { success: true, data: { docId, data } } as FirestoreResponse;
    } catch (error) {
      const err = `create error ${inspect({ error }, { depth: null })}`;
      this.logger.error(err);
      return { success: false, error: err } as FirestoreResponse;
    }
  }

  async update<D>(collection: Collection, id: string, data: D) {
    try {
      const docId = await this.getDocId(collection, id);
      const collectionRef = this.getCollectionRef(collection);
      const docRef = collectionRef.doc(docId);
      const result = await docRef.set(data, { merge: true });
      if (!result || !result.writeTime) {
        throw new BadRequestException(
          `missing result ${inspect({ result }, { depth: null })}`,
        );
      }
      const updatedResult = await this.getOne(collection, id);

      return this.parseFirebaseResult(collection, updatedResult);
    } catch (error) {
      this.logger.error(`update error: ${inspect(error, { depth: null })}`);
    }
  }

  async getOne(collection: Collection, id: string) {
    const id_filter: FirestoreFilter = {
      fieldPath: 'id',
      filterOp: '==',
      value: id,
    };
    return await this.get(collection, [id_filter]);
  }

  async get(
    collection: Collection,
    filters?: FirestoreFilter[],
    orderBy?: FirestoreOrderBy,
    paginate?: FirestorePaginate,
  ): Promise<FirestoreResponse> {
    let collectionRef: Query<DocumentData> | CollectionReference<DocumentData> =
      this.getCollectionRef(collection);

    try {
      if (filters && filters.length) {
        filters.forEach((filter) => {
          collectionRef = collectionRef.where(
            filter.fieldPath,
            filter.filterOp,
            filter.value,
          );
        });
      }

      if (orderBy) {
        collectionRef = collectionRef.orderBy(orderBy.field, orderBy.order);

        if (paginate) {
          if (paginate.startAfter) {
            collectionRef = collectionRef.startAfter(paginate.startAfter);
          }
          collectionRef = collectionRef.limit(paginate.pageSize);
        }
      }

      const snapshot = await collectionRef.get();
      const results: FirestoreResponseData[] = [];
      snapshot.forEach((doc) =>
        results.push({ docId: doc.id, data: doc.data() }),
      );

      const data = results?.length > 1 ? results : results[0];
      const response: FirestoreResponse = { success: true, data };
      return response;
    } catch (error) {
      this.logger.error(`${inspect(error, { depth: null })}`);
      return { success: false, error: error };
    }
  }

  async getDocId(collection: Collection, id: string) {
    try {
      const document = await this.getOne(collection, id);
      if (!document || !document.success || !document.data) {
        throw new BadRequestException(
          `getDocId -> record with id ${id} not found!`,
        );
      }
      return (document.data as FirestoreResponseData).docId;
    } catch (error) {
      this.logger.error(`${inspect(error, { depth: null })}`);
    }
  }

  async delete(collection: Collection, id: string): Promise<boolean> {
    try {
      const docId = await this.getDocId(collection, id);
      const collectionRef = this.getCollectionRef(collection);
      const docRef = collectionRef.doc(docId);
      const result = await docRef.delete();
      if (!result || !result.writeTime) {
        throw new BadRequestException(
          `missing result ${inspect({ result }, { depth: null })}`,
        );
      }
      return true;
    } catch (error) {
      this.logger.error(`delete error: ${inspect(error, { depth: null })}`);
      return false;
    }
  }

  parseFirebaseResult(collection: Collection, response: FirestoreResponse) {
    if (!response.success || !response.data) {
      this.logger.warn(
        `parseFirebaseResult invalid response ${inspect(
          { response },
          { depth: null },
        )}`,
      );
      return;
    }

    const { data } = response;

    switch (collection) {
      case Collection.USERS_AUTH:
        return this.parseUserAuthResults(data);
      case Collection.USERS:
        return this.parseUserResults(data);
      case Collection.CATEGORIES:
        return this.parseCategoryResults(data);
      case Collection.MESSAGES:
        return this.parseMessageResults(data);
      case Collection.LEADS:
        return this.parseLeadResults(data);
      case Collection.PRODUCTS:
        return this.parseProductResults(data);
      case Collection.UNITS:
        return this.parseUnitResults(data);
    }
  }

  private parseCategoryResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (c) =>
          new DbCategory(
            c.data.id,
            c.data.name,
            c.data.slug,
            c.data.rank,
            c.data.description,
          ),
      );
    }
    return new DbCategory(
      response.data.id,
      response.data.name,
      response.data.slug,
      response.data.rank,
      response.data.description,
    );
  }

  private parseUserResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (u) =>
          new User({
            id: u.data.id,
            name: u.data.name,
            email: u.data.email,
            surname: u.data.surname,
            unitsOwnedIds: u.data.unitsOwnedIds,
            role: u.data.role,
          }),
      );
    }
    return new User({
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      surname: response.data.surname,
      unitsOwnedIds: response.data.unitsOwnedIds,
      role: response.data.role,
    });
  }

  private parseUserAuthResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (u) =>
          ({
            id: u.data.id,
            name: u.data.name,
            email: u.data.email,
            password: u.data.password,
            surname: u.data.surname,
            unitsOwnedIds: u.data.unitsOwnedIds,
            role: u.data.role,
          }) as IDbUser,
      );
    }
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      password: response.data.password,
      surname: response.data.surname,
      unitsOwnedIds: response.data.unitsOwnedIds,
      role: response.data.role,
    } as IDbUser;
  }

  private parseMessageResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (m) =>
          new DbMessageContact(
            m.data.id,
            m.data.name,
            m.data.email,
            m.data.message,
            m.data.sentAt,
            m.data.readAt,
          ),
      );
    }
    return new DbMessageContact(
      response.data.id,
      response.data.name,
      response.data.email,
      response.data.message,
      response.data.sentAt,
      response.data.readAt,
    );
  }

  private parseLeadResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (l) =>
          new DbFranchisingLead(
            l.data.id,
            l.data.name,
            l.data.email,
            l.data.celphone,
            l.data.telephone,
            l.data.city,
            l.data.state,
            l.data.investment,
            l.data.reference,
            l.data.message,
            l.data.sentAt,
            l.data.readAt,
          ),
      );
    }
    return new DbFranchisingLead(
      response.data.id,
      response.data.name,
      response.data.email,
      response.data.celphone,
      response.data.telephone,
      response.data.city,
      response.data.state,
      response.data.investment,
      response.data.reference,
      response.data.message,
      response.data.sentAt,
      response.data.readAt,
    );
  }

  private parseUnitResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (u) =>
          new DbUnit(
            u.data.id,
            u.data.name,
            u.data.location,
            u.data.address,
            u.data.telephone,
            u.data.workingHours,
            u.data.lat,
            u.data.lng,
            u.data.whatsapp,
          ),
      );
    }
    return new DbUnit(
      response.data.id,
      response.data.name,
      response.data.location,
      response.data.address,
      response.data.telephone,
      response.data.workingHours,
      response.data.lat,
      response.data.lng,
      response.data.whatsapp,
    );
  }

  private parseProductResults(
    response: FirestoreResponseData | FirestoreResponseData[],
  ) {
    if (Array.isArray(response)) {
      return response.map(
        (p) =>
          new DbProduct(
            p.data.id,
            p.data.name,
            p.data.categoriesIds,
            p.data.unitsAvailable,
            p.data.price,
            p.data.slug,
            p.data.imageUrl,
            p.data.description,
            p.data.attributes,
            p.data.requested,
            p.data.conditions,
            p.data.notes,
            p.data.ingredients,
            p.data.rank,
          ),
      );
    }

    return new DbProduct(
      response.data.id,
      response.data.name,
      response.data.categoriesIds,
      response.data.unitsAvailable,
      response.data.price,
      response.data.slug,
      response.data.imageUrl,
      response.data.description,
      response.data.attributes,
      response.data.requested,
      response.data.conditions,
      response.data.notes,
      response.data.ingredients,
      response.data.rank,
    );
  }
}
