import React, { useEffect } from "react";
import Shell from "./components/Shell";
import Map from "./components/Map";
import Panel from "./components/Panel";
import { $session, $pending } from "./modules/store";
import { useStore } from "effector-react";
import Auth from "./components/Auth";
import { ToastContainer } from "react-toastify";
import "./styles/style.scss";
import { usersCreate } from "./modules/db";
import { Loading } from "carbon-components-react";

const App = () => {
  const pending = useStore($pending);
  const session = useStore($session);

  useEffect(() => {
    usersCreate();
  }, []);
  return (
    <>
      {pending && <Loading />}
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        {session ? <Shell /> : null}
        <div className="h-full w-screen flex flex-row overflow-hidden flex-grow-default">
          <Map />
          {session ? <Panel /> : null}
        </div>
        <ToastContainer />
      </div>
      <Auth />
    </>
  );
};

export default App;
