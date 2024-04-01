export const randomId = () => Math.random().toString(36).slice(2);

export type MaybePromise<T> = Promise<T> | T;
