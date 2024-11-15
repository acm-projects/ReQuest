import { createContext } from "react";

interface CurrentUserContextType {
  signedIn: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export default CurrentUserContext;

