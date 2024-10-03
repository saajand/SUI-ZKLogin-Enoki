import { useAuthCallback, useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "mainnet" | "testnet";

interface LoginContextType {
  isLoggedIn: boolean;
  userDetails: UserDetails;
  login: () => void;
  logOut: () => void;
}

const UserContext = createContext<LoginContextType | undefined>(undefined);

interface UserDetails {
  provider: string;
  salt: string;
  address: string;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserDetailsInitialValues = {
  provider: "",
  salt: "",
  address: "",
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const flow = useEnokiFlow();
  const zkLogin = useZkLogin();
  useAuthCallback();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>(
    UserDetailsInitialValues
  );

  const login = async () => {
    window.location.href = await flow.createAuthorizationURL({
      provider: "google",
      clientId: GOOGLE_CLIENT_ID,
      redirectUrl: window.location.origin,
      network: NETWORK
    });
  };

  const logOut = async () => {
    flow.logout();
    clearStates();
  };

  const clearStates = () => {
    setIsLoggedIn(false);
    setUserDetails(UserDetailsInitialValues);
  };

  useEffect(() => {
    if (zkLogin.address && zkLogin.salt && zkLogin.provider) {
      setUserDetails({
        provider: zkLogin.provider,
        salt: zkLogin.salt,
        address: zkLogin.address,
      });
      setIsLoggedIn(true);
    }
  }, [zkLogin.address]);

  const contextValue: LoginContextType = {
    isLoggedIn,
    userDetails,
    login,
    logOut,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLogin = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useLogin must be used within UserProvider");
  }
  return context;
};
