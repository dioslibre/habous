/* eslint-disable react/prop-types */
import {
  Add20,
  CaretDown20,
  CaretRight20,
  Checkmark20,
  Close20,
  Edit20,
  PaintBrush20,
  TrashCan20,
} from "@carbon/icons-react";
import { Button, TextInput, Tile } from "carbon-components-react";
import { useStore } from "effector-react";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db, allAttributes } from "../modules/db";
import { colorize } from "../modules/map";
import {
  attributeStores,
  attributeFields,
  attributeOpenStores,
  attributeOpenEvents,
  attributeChanged,
  attributeEvents,
  $attribute,
  pendingChanged,
} from "../modules/store";

const Attributes = () => {
  return attributeFields
    .slice(0, attributeFields.length - 2)
    .map((f) => <AttributeManager key={f} field={f} />);
};

export default Attributes;

const AttributeEditor = ({ name }) => {
  const ref = createRef();
  useEffect(() => setTimeout(() => ref.current.focus()), []);
  return (
    <TextInput
      ref={ref}
      id={"text-attrib"}
      defaultValue={name || ""}
      size="sm"
      light
      labelText="Nom de l'attribut"
      onChange={(event) => attributeChanged(event.target.value)}
    />
  );
};

const AttributeEntry = ({ attribute, remove, edit }) => {
  const [hover, setHover] = useState(false);
  const [removeAttribute, setRemoveAttribute] = useState(false);
  const [editAttribute, setEditAttribute] = useState(
    !attribute._id || attribute._id === "new"
  );

  return (
    <>
      <Tile
        light
        className="flex flex-row mb-2 mt-2 h-16"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="text-base my-auto mr-auto">
          <p>{attribute.name}</p>
        </div>
        {hover && !removeAttribute && !editAttribute && (
          <Button
            kind="danger"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setRemoveAttribute(true)}
          >
            <TrashCan20 slot="icon" />
          </Button>
        )}
        {hover && !removeAttribute && !editAttribute && (
          <Button
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setEditAttribute(true)}
          >
            <Edit20 slot="icon" />
          </Button>
        )}
        {removeAttribute && (
          <Button
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => {
              pendingChanged(true);
              allAttributes().then(
                () => pendingChanged(false) & setRemoveAttribute(false)
              );
            }}
          >
            <Close20 slot="icon" />
          </Button>
        )}
        {removeAttribute && (
          <Button
            kind="danger"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => {
              pendingChanged(true);
              remove(attribute._id).then(
                () => pendingChanged(false) & setRemoveAttribute(false)
              );
            }}
          >
            <Checkmark20 slot="icon" />
          </Button>
        )}
        {editAttribute && (
          <Button
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => {
              pendingChanged(true);
              allAttributes().then(
                () => pendingChanged(false) & setEditAttribute(false)
              );
            }}
          >
            <Close20 color="red" slot="icon" />
          </Button>
        )}
        {editAttribute && (
          <Button
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => {
              const name = $attribute.getState();
              console.log(name);
              if (name?.length)
                edit(attribute._id, name).then(() => setEditAttribute(false));
            }}
          >
            <Checkmark20 slot="icon" />
          </Button>
        )}
      </Tile>
      {editAttribute && <AttributeEditor name={attribute.name} />}
    </>
  );
};

const AttributeManager = ({ field }) => {
  const attributes = useStore(attributeStores["$" + field]);
  const open = useStore(attributeOpenStores["$" + field]);

  const edit = async (_id, name) => {
    console.log(name);
    pendingChanged(true);
    let existing = _id && _id !== "new" ? await db.get(_id) : { type: field };
    existing = { ...existing, name };
    const func = existing._id ? "put" : "post";
    db[func](existing)
      .then(async () => {
        toast("Enregistrement r??ussie", { type: "success", autoClose: 2000 });
        await allAttributes();
        pendingChanged(false);
      })
      .catch(async (e) => {
        console.log(e);
        await allAttributes();
        toast("Erreur d'enregistrement", { type: "error", autoClose: 2000 });
        pendingChanged(false);
      });
  };

  const add = useCallback(
    () => {
      attributeOpenEvents[field + "Changed"](true);
      attributeEvents[field + "Changed"]([
        { _id: "new", name: "Nouvel attribut" },
        ...attributes,
      ]);
      attributeChanged("Nouvel attribut");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attributes, field]
  );

  const remove = async (_id) => {
    pendingChanged(true);
    if (!_id || _id === "new") {
      allAttributes();
      pendingChanged(false);
      return;
    }
    let existing = await db.get(_id);
    existing = { ...existing, _deleted: true };
    db.put(existing)
      .then(async () => {
        toast("Suppression r??ussie", { type: "success", autoClose: 2000 });
        await allAttributes();
        pendingChanged(false);
      })
      .catch(async (e) => {
        console.log(e);
        toast("Erreur de Suppression", { type: "error", autoClose: 2000 });
        await allAttributes();
        pendingChanged(false);
      });
  };

  const toggle = useCallback(() => {
    attributeOpenEvents[field + "Changed"](!open);
  }, [field, open]);

  const paint = useCallback(
    () => colorize(field, attributes),
    [field, attributes]
  );

  return (
    <>
      <div className="flex flex-row h-12">
        <Button size="sm" kind="ghost" className="pl-2" onClick={toggle}>
          {!open && (
            <CaretRight20 className="float-right ml-auto mr-0" slot="icon" />
          )}
          {open && (
            <CaretDown20 className="float-right ml-auto mr-0" slot="icon" />
          )}
        </Button>
        <div className="text-base font-bold my-auto mr-auto">{field}</div>
        <Button size="sm" kind="ghost" className="" onClick={add}>
          <Add20 className="float-right ml-auto mr-0" slot="icon" />
        </Button>
        <Button size="sm" kind="ghost" className="" onClick={paint}>
          <PaintBrush20 className="float-right ml-auto mr-0" slot="icon" />
        </Button>
      </div>
      {open &&
        (attributes || []).map((f) => (
          <AttributeEntry
            key={f._id}
            attribute={f}
            remove={remove}
            edit={edit}
          />
        ))}
    </>
  );
};
