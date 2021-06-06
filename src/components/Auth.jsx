/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  $session,
  authEvents,
  authStores,
  sessionChanged,
  usersChanged,
} from "../modules/store";
import { useStore } from "effector-react";
import { Loading, Modal, TextInput } from "carbon-components-react";
import { toast } from "react-toastify";
import { send } from "../modules/utils";
import { allUsers, usersdb } from "../modules/db";

function Auth() {
  const session = useStore($session);
  const [pending, setPending] = useState(false);

  const authenticate = async ({ name, password }) => {
    setPending(true);
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
      setPending(false);
    } else {
      setPending(false);
      toast("Erreur Login", { type: "error", autoClose: 2000 });
    }
  };

  if (session) return null;

  return (
    <>
      {pending && <Loading />}
      <Modal
        open
        modalHeading="Portail SIG-Habous"
        modalLabel="Authentification"
        primaryButtonText="Se Connecter"
        shouldSubmitOnEnter
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
              <Name pending={pending} />
              <Password pending={pending} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Name({ pending }) {
  const ref = useRef();
  const value = useStore(authStores.$name);

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

function Password({ pending }) {
  const value = useStore(authStores.$password);

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
