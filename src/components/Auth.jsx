/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import {
  $session,
  authEvents,
  authStores,
  sessionChanged,
  usersChanged,
  pendingChanged,
  $pending,
} from "../modules/store";
import { useStore } from "effector-react";
import { Modal, TextInput } from "carbon-components-react";
import { toast } from "react-toastify";
import { allUsers } from "../modules/db";

function Auth() {
  const session = useStore($session);
  const pending = useStore($pending);

  const authenticate = async () => {
    pendingChanged(true);
    const users = await allUsers();
    console.log(users);
    const session = users.find(
      (e) =>
        e.name === authStores.$name.getState() &&
        e.password === authStores.$password.getState()
    );
    if (session) {
      sessionChanged(session);
      usersChanged(users);
      toast("Bienvenue", { type: "success", autoClose: 2000 });
      pendingChanged(false);
    } else {
      pendingChanged(false);
      toast("Erreur Login", { type: "error", autoClose: 2000 });
    }
  };

  if (session) return null;

  return (
    <>
      <Modal
        open
        modalHeading="Portail SIG-Habous"
        modalLabel="Authentification"
        primaryButtonText="Se Connecter"
        shouldSubmitOnEnter
        primaryButtonDisabled={pending}
        hasForm
        onRequestSubmit={authenticate}
        preventCloseOnClickOutside
      >
        <div className="h-full flex flex-row overflow-hidden text-gray-900">
          <div className="flex items-center w-1/2">
            <div className="flex flex-col mx-auto">
              <img
                className="mx-auto"
                src="./emblem.jpg"
                alt="Royaume du Maroc"
                width="300"
                height="300"
              />
              <div className="mt-6">
                <p className="text-center text-2xl">المملكة المغربية</p>
                <p className="text-center text-2xl">
                  وزارة الأوقاف والشؤون الاسلامية
                </p>
                <p className="text-center text-2xl">
                  نظارة أوقاف الدار البيضاء
                </p>
                <p className="text-center text-2xl">
                  مصلحة الإستثمار و المحافظة على الأوقاف
                </p>
              </div>
            </div>
          </div>
          <div className="mt-14 flex items-center w-1/2">
            <div className="flex flex-col mx-auto w-5/6">
              <img
                className="mx-auto my-auto mb-4 inve"
                src="./map.svg"
                alt="Royaume du Maroc"
                width="300"
                height="300"
              />
              <Name />
              <Password />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Name() {
  const ref = useRef();
  const value = useStore(authStores.$name);
  const pending = useStore($pending);

  useEffect(() => {
    if (!ref?.current) return;
    ref.current.focus();
  }, [ref]);

  return (
    <div className="flex flex-row mb-2">
      <TextInput
        id="name"
        ref={ref}
        disabled={pending}
        defaultValue={value || ""}
        light
        labelText="Login"
        onInput={(event) => authEvents.nameChanged(event.target.value)}
      ></TextInput>
    </div>
  );
}

function Password() {
  const value = useStore(authStores.$password);
  const pending = useStore($pending);

  return (
    <div className="flex flex-row mb-2">
      <TextInput
        id="pass"
        light
        type="password"
        defaultValue={value || ""}
        disabled={pending}
        labelText="Mot de Passe"
        onInput={(event) => authEvents.passwordChanged(event.target.value)}
      ></TextInput>
    </div>
  );
}

export default Auth;
