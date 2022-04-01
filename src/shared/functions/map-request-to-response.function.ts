import { IResponse } from '../interfaces/response.interface';

async function mapRequestToResponse<T = any>(
  context: any,
  method: any,
  ...args: any
): Promise<IResponse<T>> {
  try {
    const entity = await method.apply(context, args);
    return { success: true, payload: entity };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export default mapRequestToResponse;
