export interface IResponse<T = any> {
  success: boolean;
  payload?: T;
  message?: string;
}
