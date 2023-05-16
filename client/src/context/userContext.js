import { createContext } from 'react';

const userContext = createContext();

export const allProvider = userContext.Provider;
export const allConsumer = userContext.Consumer;

export default userContext;
