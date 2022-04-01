import { IResponse } from '../interfaces/response.interface';

function mapPayloadToResponse<T>(success: boolean, payload?: T): IResponse<T> {
  return { success, payload };
}

export default mapPayloadToResponse;
