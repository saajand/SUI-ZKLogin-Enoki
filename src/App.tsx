import "./App.css";
import { useLogin } from "./context/UserContext";

function App() {
  const { isLoggedIn, userDetails, login, logOut } = useLogin();

  return (
    <>
      <h3>ZKLogin + Enoki</h3>

      <div>
        <div>Address: {userDetails.address}</div>
        <div>Provider: {userDetails.provider}</div>
        {!isLoggedIn ? (
          <button onClick={login}>Sign in with Google</button>
        ) : (
          <button onClick={logOut}>Sign Out</button>
        )}
      </div>

      <div></div>
    </>
  );
}

export default App;
