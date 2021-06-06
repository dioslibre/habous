/* eslint-disable react/prop-types */
import React, { useCallback, useState } from "react";
import { useStore } from "effector-react";
import {
  TextInput,
  RadioButtonGroup,
  RadioButton,
  Button,
  Tile,
} from "carbon-components-react";
import {
  $userCombined,
  $users,
  userEvents,
  usersChanged,
  userFields,
  userStores,
  pendingChanged,
} from "../modules/store";
import {
  Add20,
  Checkmark20,
  Close20,
  Edit20,
  TrashCan20,
} from "@carbon/icons-react";
import { allUsers, usersdb } from "../modules/db";
import { toast } from "react-toastify";

function Password({ value }) {
  return (
    <TextInput
      id="pass"
      type="password"
      defaultValue={value || ""}
      color={"light"}
      labelText="Mot de Passe"
      onInput={(event) => userEvents.passwordChanged(event.target.value)}
    ></TextInput>
  );
}
function FullName({ value }) {
  return (
    <TextInput
      id={"text-fullname"}
      defaultValue={value || ""}
      size="sm"
      light={true}
      labelText="Nom"
      onChange={(event) => userEvents["fullnameChanged"](event.target.value)}
    />
  );
}

function Role({ value }) {
  return (
    <div>
      <div className="bx--label">Role</div>
      <RadioButtonGroup
        className="my-2 ml-4"
        orientation="horizontal"
        light={true}
        name="status"
        defaultSelected={value || ""}
        onChange={(event) => userEvents["roleChanged"](event)}
      >
        {["Administrateur", "Utilisateur"].map((r) => (
          <RadioButton key={r} className="mr-3 mb-2" value={r} labelText={r} />
        ))}
      </RadioButtonGroup>
    </div>
  );
}

function Name({ pending, value }) {
  return (
    <div className="flex flex-row mb-2">
      <TextInput
        id="name"
        disabled={pending}
        defaultValue={value || ""}
        light
        labelText="Login"
        onInput={(event) => userEvents.nameChanged(event.target.value)}
      ></TextInput>
    </div>
  );
}
const UserEditor = ({ user }) => {
  return (
    <>
      <Name defaultValue={user.name} />
      <FullName defaultValue={user.fullname} />
      <Password defaultValue={user.password} />
      <Role defaultValue={user.role} />
    </>
  );
};

const UserManager = () => {
  const users = useStore($users);
  console.log(users);

  const edit = async (user) => {
    pendingChanged(true);
    let existing =
      user._id && user._id !== "new"
        ? await usersdb.get(user._id)
        : { ...user, _id: "org.couchdb.user:" + user.name };
    existing = { ...existing, ...$userCombined.getState() };
    usersdb
      .put(existing)
      .then(async () => {
        toast("Enregistrement réussie", { type: "success", autoClose: 2000 });
        await allUsers();
        pendingChanged(false);
      })
      .catch(async (e) => {
        console.log(e);
        await allUsers();
        toast("Erreur d'enregistrement", { type: "error", autoClose: 2000 });
        pendingChanged(false);
      });
  };

  const add = useCallback(
    () => usersChanged([{ _id: "new" }, ...users]),
    [users]
  );

  const remove = async (user) => {
    if (!user._id || user._id === "new") {
      allUsers();
      return;
    }
    pendingChanged(true);
    let existing = await usersdb.get(user._id);
    existing = { ...existing, _deleted: true };
    usersdb
      .put(existing)
      .then(async () => {
        toast("Enregistrement réussie", { type: "success", autoClose: 2000 });
        await allUsers();
        pendingChanged(false);
      })
      .catch(async (e) => {
        console.log(e);
        toast("Erreur d'enregistrement", { type: "error", autoClose: 2000 });
        await allUsers();
        pendingChanged(false);
      });
  };

  return (
    <div className="mb-14">
      <div className="flex flex-row mb-2 h-12">
        <div className="text-base font-bold my-auto">Utilisateurs</div>
        <Button size="sm" kind="ghost" className="ml-auto" onClick={add}>
          <Add20 className="float-right ml-auto mr-0" slot="icon" />
        </Button>
      </div>
      {users?.length &&
        users.map((f) => (
          <UserEntry
            _id={f._id}
            key={f._id}
            user={f}
            remove={remove}
            edit={edit}
          />
        ))}
    </div>
  );
};

const UserEntry = ({ user, remove, edit }) => {
  const [hover, setHover] = useState(false);
  const [removeUser, setRemoveUser] = useState(false);
  const [editUser, setEditUser] = useState(!user._id || user._id === "new");

  return (
    <>
      <Tile
        light
        className="flex flex-row mb-2 mt-2 h-20"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="text-base my-auto mr-auto">
          <p>{user.fullname}</p>
          <p>{user.role}</p>
        </div>
        {hover && !removeUser && !editUser && (
          <Button
            kind="danger"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setRemoveUser(true)}
          >
            <TrashCan20 slot="icon" />
          </Button>
        )}
        {hover && !removeUser && !editUser && (
          <Button
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setEditUser(true)}
          >
            <Edit20 slot="icon" />
          </Button>
        )}
        {removeUser && (
          <Button
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={allUsers}
          >
            <Close20 slot="icon" />
          </Button>
        )}
        {removeUser && (
          <Button
            kind="danger"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => remove(user).then(() => setRemoveUser(false))}
          >
            <Checkmark20 slot="icon" />
          </Button>
        )}
        {editUser && (
          <Button
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={allUsers}
          >
            <Close20 color="red" slot="icon" />
          </Button>
        )}
        {editUser && (
          <Button
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => {
              for (let index = 0; index < userFields.length; index++) {
                const element = userFields[index];
                if (!userStores[element].getState()?.length) {
                  toast("Paramètre Requis", { type: "error", autoClose: 2000 });
                  return;
                }
              }
              edit(user).then(() => setEditUser(false));
            }}
          >
            <Checkmark20 slot="icon" />
          </Button>
        )}
      </Tile>
      {editUser && <UserEditor user={user} />}
    </>
  );
};

export default UserManager;
