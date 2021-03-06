/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "effector-react";
import {
  Button,
  TextInput,
  Dropdown,
  TextArea,
  Tile,
} from "carbon-components-react";
import {
  $coordinates,
  $property,
  $editGeom,
  editGeomChanged,
  $search,
  attributeStores,
  geometriesChanged,
  printChanged,
  propertyChanged,
  propertyEvents,
  PropertyFields,
  propertyStores,
  tabChanged,
  pendingChanged,
} from "../modules/store";
import { draw, map } from "../modules/map";
import {
  TrashCan20,
  Download20,
  Edit20,
  Close20,
  Printer20,
  Save20,
  Checkmark20,
  Add20,
} from "@carbon/icons-react";
import { humanFileSize, transformArrayToLocal } from "../modules/utils";
import { toast } from "react-toastify";
import {
  getRecord,
  saveRecord,
  fetchProperties,
  allGeoms,
  db,
} from "../modules/db";
import Print from "../components/Print";
import { useToggle } from "react-use";

function Titre() {
  const value = useStore(propertyStores["$Titre foncier"]);
  return (
    <TextInput
      id={"text-ref"}
      defaultValue={value || ""}
      size="sm"
      light
      labelText="Titre foncier"
      onChange={(event) =>
        propertyEvents["Titre foncierChanged"](event.target.value)
      }
    />
  );
}
function Identifiant() {
  const value = useStore(propertyStores["$Identifiant"]);
  return (
    <TextInput
      id={"text-id"}
      defaultValue={value || ""}
      size="sm"
      light
      labelText="Identifiant"
      onChange={(event) =>
        propertyEvents["IdentifiantChanged"](event.target.value)
      }
    />
  );
}
function Requisition() {
  const value = useStore(propertyStores["$N° Réquisition"]);
  return (
    <TextInput
      id={"text-req"}
      defaultValue={value || ""}
      size="sm"
      light
      labelText="N° Réquisition"
      onChange={(event) =>
        propertyEvents["N° RéquisitionChanged"](event.target.value)
      }
    />
  );
}
function AttributeCombo({ field }) {
  const items = useStore(attributeStores["$" + field]);
  const attrib = useStore(propertyStores["$" + field]);

  if (!items) return null;

  return (
    <Dropdown
      id={"dropdown-" + field}
      itemToString={(item) => item.name}
      titleText={field}
      label="Options"
      size="sm"
      light
      onChange={(event) =>
        propertyEvents[field + "Changed"](event.selectedItem._id)
      }
      items={items || []}
      selectedItem={items.find((e) => e._id === attrib)}
    ></Dropdown>
  );
}
function Numbers({ field }) {
  const value = useStore(propertyStores["$" + field]);
  return (
    <TextInput
      id={field}
      size="sm"
      labelText={field}
      light
      type="number"
      defaultValue={(value && Math.floor(value * 100) / 100.0) || ""}
      onChange={(event) =>
        propertyEvents[field + "Changed"](parseFloat(event.target.value))
      }
    />
  );
}
function Address() {
  const value = useStore(propertyStores["$Adresse"]);
  return (
    <TextArea
      rows={2}
      defaultValue={value || ""}
      size="sm"
      light
      labelText="Adresse"
      onChange={(event) => propertyEvents["AdresseChanged"](event.target.value)}
    ></TextArea>
  );
}
function Note() {
  const value = useStore(propertyStores["$Nota Bene"]);
  return (
    <TextArea
      rows={2}
      defaultValue={value || ""}
      size="sm"
      light
      labelText="Note"
      onChange={(event) =>
        propertyEvents["Nota BeneChanged"](event.target.value)
      }
    ></TextArea>
  );
}
function Coordinates() {
  const value = useStore($coordinates);

  const parse = (str) =>
    str
      .split("\n")
      .filter((s) => s.length)
      .map((l) =>
        l
          .split(" ")
          .filter((f) => f.length)
          .map((c) => parseFloat(c))
      )
      .filter((e) => e.length === 2);

  const setCoords = (text) => {
    try {
      const parsed = parse(text);
      console.log(parsed);
      propertyEvents["CoordonnéesChanged"](parsed);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <TextArea
      className="mb-4"
      rows={6}
      defaultValue={value}
      size="sm"
      light
      labelText=""
      onChange={(event) => setCoords(event.target.value)}
    ></TextArea>
  );
}
const PropertyTable = ({ property }) => {
  if (!property) return null;

  return (
    <table className="mt-0 w-full">
      <tbody>
        {PropertyFields.filter((e) => e !== "Coordonnées").map((e) =>
          property[e] ? (
            <tr key={e}>
              <td className="font-bold w-2/5">{e}</td>
              <td>
                {attributeStores["$" + e]
                  ? attributeStores["$" + e]
                      .getState()
                      .find((f) => f._id === property[e])?.name
                  : property[e]}
              </td>
            </tr>
          ) : null
        )}
      </tbody>
    </table>
  );
};
const CoordsTable = () => {
  const coords = useStore(propertyStores["$Coordonnées"]);

  if (!coords?.length) return "Aucune coordonnées";

  return (
    <div className="w-full mb-4">
      <table className="shadow-md mt-0">
        <tbody>
          <tr>
            <td className="w-1/2 font-bold">X</td>
            <td className="font-bold">Y</td>
          </tr>
          {(coords || []).map((e, i) => (
            <tr key={i}>
              <td className="w-1/2">{e[0]}</td>
              <td>{e[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const PropertyEditor = () => {
  return (
    <>
      <AttributeCombo field={"Unité"} />
      <Identifiant />
      <Titre />
      <Requisition />
      {[
        "Régime foncier",
        "Statut de possession",
        "Conservation",
        "Affectation",
        "Consistance",
        "Propriétaire",
      ].map((field) => (
        <AttributeCombo key={field} field={field} />
      ))}
      {["Surface", "Valeur locative", "Valeur vénale"].map((field) => (
        <Numbers key={field} field={field} />
      ))}
      <Address />
      <Note />
    </>
  );
};
const FileManager = () => {
  const property = useStore($property);
  const ref = useRef();

  function click() {
    ref.current.click();
  }

  const upload = useCallback(
    async (files) => {
      if (!files?.length) return;
      pendingChanged(true);
      let existing = await getRecord(property?._id);
      var file = files[0]; // file is a Blob
      const attachment = {
        type: file.type,
        data: file,
      };
      existing._attachments = existing._attachments
        ? { ...existing._attachments, [file.name]: attachment }
        : { [file.name]: attachment };
      await db.put(existing);
      await fetchProperties($search.getState());
      existing = await getRecord(property?._id);
      propertyChanged(existing);
      pendingChanged(false);
    },
    [property]
  );

  const remove = useCallback(
    async (name) => {
      pendingChanged(true);
      let existing = await getRecord(property?._id);
      await db.removeAttachment(existing._id, name, existing._rev);
      await fetchProperties($search.getState());
      existing = await getRecord(property?._id);
      propertyChanged(existing);
      pendingChanged(false);
    },
    [property]
  );

  const edit = useCallback(
    async (name, kind) => {
      pendingChanged(true);
      let existing = await getRecord(property?._id);
      existing.attachmentTypes = existing.attachmentTypes ?? {};
      existing.attachmentTypes = {
        ...existing.attachmentTypes,
        [name]: kind,
      };
      await saveRecord(existing);
      await fetchProperties($search.getState());
      existing = await getRecord(property?._id);
      propertyChanged(existing);
      pendingChanged(false);
    },
    [property]
  );

  if (!property?._id) return null;

  return (
    <div className="mb-14">
      <input
        className="hidden"
        ref={ref}
        type="file"
        onChange={(event) => upload(event.target.files)}
      />
      <div className="flex flex-row mb-2 h-12">
        <div className="text-base font-bold my-auto">Documents</div>
        <Button size="sm" kind="ghost" className="ml-auto" onClick={click}>
          <Add20 className="float-right ml-auto mr-0" slot="icon" />
        </Button>
      </div>
      {property?._attachments &&
        Object.keys(property._attachments)
          .filter((f) => f !== "_id" && f !== "_rev")
          .map((f) => (
            <FileEntry
              _id={property?._id}
              key={f}
              name={f}
              length={property._attachments[f].length}
              kind={property.attachmentTypes && property.attachmentTypes[f]}
              remove={remove}
              edit={edit}
            />
          ))}
    </div>
  );
};

const FileEntry = ({ length, kind, name, _id, remove, edit }) => {
  const items = useStore(attributeStores["$Type de document"]);
  const [hover, setHover] = useState(false);
  const [removeFile, setRemoveFile] = useState(false);
  const [editFile, setEditFile] = useState(false);
  const [newkind, setKind] = useState(kind);

  const download = async () => {
    pendingChanged(true);
    const blob = await db.getAttachment(_id, name);
    const url = URL.createObjectURL(blob);
    window.saveAs(url, name);
    pendingChanged(false);
  };

  const go = useCallback(
    () => edit(name, newkind).then(() => setEditFile(false)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newkind]
  );

  return (
    <>
      <Tile
        light
        className="flex flex-row mb-2 mt-2 h-20"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="text-base my-auto mr-auto">
          <p>{name}</p>
          <p>{items.find((e) => e._id === kind)?.name || "Type non définie"}</p>
        </div>
        {!hover && !removeFile && !editFile && (
          <div className="text-base my-auto w-24 text-right">
            {humanFileSize(length)}
          </div>
        )}
        {hover && !removeFile && !editFile && (
          <Button
            onClick={download}
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
          >
            <Download20 slot="icon" />
          </Button>
        )}
        {hover && !removeFile && !editFile && (
          <Button
            kind="danger"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setRemoveFile(true)}
          >
            <TrashCan20 slot="icon" />
          </Button>
        )}
        {hover && !removeFile && !editFile && (
          <Button
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setEditFile(true)}
          >
            <Edit20 slot="icon" />
          </Button>
        )}
        {removeFile && (
          <Button
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setRemoveFile(false)}
          >
            <Close20 slot="icon" />
          </Button>
        )}
        {removeFile && (
          <Button
            kind="danger"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => remove(name)}
          >
            <Checkmark20 slot="icon" />
          </Button>
        )}
        {editFile && (
          <Button
            kind="ghost"
            size="sm"
            className="w-auto h-12 my-auto"
            onClick={() => setEditFile(false)}
          >
            <Close20 color="red" slot="icon" />
          </Button>
        )}
        {editFile && (
          <Button size="sm" className="w-auto h-12 my-auto" onClick={go}>
            <Checkmark20 slot="icon" />
          </Button>
        )}
      </Tile>
      {editFile && (
        <Dropdown
          id={"dropdown-doctype"}
          itemToString={(item) => item.name}
          titleText={""}
          label="Options"
          size="sm"
          light
          onChange={(event) => setKind(event.selectedItem._id)}
          items={items || []}
          defaultValue={items.find((e) => e._id === newkind)}
        ></Dropdown>
      )}
    </>
  );
};

const PropertyActions = ({ editData, setEditData, toggle }) => {
  const editGeom = useStore($editGeom);
  const [removeData, setRemoveData] = useState(false);
  const save = async () => {
    pendingChanged(true);
    const edited = $property.getState()._id
      ? await getRecord($property.getState()._id)
      : { type: "Propriété" };
    PropertyFields.forEach((key) => {
      edited[key] = propertyStores["$" + key].getState();
    });
    const coords = propertyStores["$Coordonnées"].getState();
    if (coords?.length > 0 && coords?.length < 4) {
      toast("Nombre de Points insuffisant", { type: "error", autoClose: 2000 });
      pendingChanged(false);
      return;
    } else if (coords?.length > 4) {
      const p1 = coords[0];
      const p2 = coords[coords.length - 1];
      if (Math.abs(p1[0] - p2[0] > 0.01) || Math.abs(p1[1] - p2[1]) > 0.01) {
        toast("les premier et dernier points sont differents", {
          type: "error",
          autoClose: 2000,
        });
        pendingChanged(false);
        return;
      }
    }

    const func = edited._id ? "put" : "post";
    db[func](edited)
      .then(async (res) => {
        console.log(res);
        await fetchProperties($search.getState());
        propertyChanged(await db.get(res.id));
        toast("Enregistrement réussie", { type: "success", autoClose: 2000 });
        setEditData(false);
        pendingChanged(false);
        PropertyFields.forEach((key) => {
          propertyEvents[key + "Changed"]();
        });
      })
      .catch((e) => {
        console.log(e);
        toast("Erreur d'enregistrement", { type: "error", autoClose: 2000 });
        pendingChanged(false);
      });
  };
  const remove = async () => {
    pendingChanged(true);
    const deleted = (await getRecord($property.getState()._id)) ?? {};
    deleted._deleted = true;
    saveRecord(deleted)
      .then(async () => {
        await fetchProperties($search.getState());
        propertyChanged(null);
        setRemoveData(false);
        const geoms = await allGeoms();
        geometriesChanged(geoms);
        toast("Suppression réussie", { type: "success", autoClose: 2000 });
        tabChanged(0);
        pendingChanged(false);
      })
      .catch((e) => {
        console.log(e);
        toast("Erreur de Suupression", { type: "error", autoClose: 2000 });
        pendingChanged(false);
      });
  };
  async function onUpdateGeometry(e) {
    pendingChanged(true);
    const f = e.features[0];
    const coords = f.geometry.coordinates[0];
    const transformed = transformArrayToLocal(coords);
    const _id = $property.getState()._id;
    const res = await getRecord(_id);
    res.Coordonnées = transformed.map((e) =>
      e.map((c) => Math.trunc(100 * c) / 100.0)
    );
    await saveRecord(res);
    propertyChanged(res);
    pendingChanged(false);
  }
  async function onDeleteGeometry(e) {
    pendingChanged(true);
    const f = e.features[0];
    const _id = f.properties._id;
    const res = await getRecord(_id);
    res.Coordonnées = undefined;
    await saveRecord(res);
    propertyChanged(res);
    pendingChanged(false);
  }
  const onCreateGeometry = async function (e) {
    if (!$editGeom.getState()) return;
    pendingChanged(true);
    const f = e.features[0];
    const coords = f.geometry.coordinates[0];
    const transformed = transformArrayToLocal(coords);
    const _id = $property.getState()._id;
    const res = await getRecord(_id);
    res.Coordonnées = transformed.map((e) =>
      e.map((c) => Math.trunc(100 * c) / 100.0)
    );
    await saveRecord(res);
    const geoms = await allGeoms();
    geometriesChanged(geoms);
    propertyChanged(res);
    draw.changeMode("simple_select", { featureIds: [res._id] });
    pendingChanged(false);
  };
  const subscribe = () => {
    setTimeout(() => {
      map.on("draw.create", onCreateGeometry);
      map.on("draw.delete", onDeleteGeometry);
      map.on("draw.update", onUpdateGeometry);
    }, 1000);
  };
  const unsubscribe = () => {
    map.off("draw.create", onCreateGeometry);
    map.off("draw.delete", onDeleteGeometry);
    map.off("draw.update", onUpdateGeometry);
  };

  useEffect(() => {
    subscribe();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed z-10 right-0 bottom-0 flex flex-row"
      style={{ width: 400 }}
    >
      {!editData && !editGeom && (
        <>
          {!removeData && (
            <Button
              kind="danger"
              className="mt-4 mx-auto w-1/2 pr-4"
              onClick={() => setRemoveData(true)}
            >
              <div className="flex flex-row w-full">
                Supprimer{" "}
                <TrashCan20 className="float-right ml-auto mr-0" slot="icon" />
              </div>
            </Button>
          )}
          {removeData && (
            <Button
              kind="ghost"
              className="mt-4 bg-white text-red-600 mx-auto w-1/4 pr-4"
              onClick={() => setRemoveData(false)}
            >
              <Close20
                color="red"
                className="float-right mx-auto"
                slot="icon"
              />
            </Button>
          )}
          {removeData && (
            <Button
              kind="danger"
              className="mt-4 mx-auto w-1/4 pr-4"
              onClick={remove}
            >
              <Checkmark20 className="float-right mx-auto" slot="icon" />
            </Button>
          )}
        </>
      )}
      {!editData && !editGeom && (
        <Button
          kind="ghost"
          className="mt-4 bg-white mx-auto w-1/2 pr-4"
          onClick={() => printChanged(false) & toggle(true)}
        >
          <div className="flex flex-row w-full">
            Imprimer{" "}
            <Printer20 className="float-right ml-auto mr-0" slot="icon" />
          </div>
        </Button>
      )}
      {(editData || editGeom) && (
        <Button
          kind="ghost"
          className="mt-4 bg-white text-red-600 mx-auto w-1/2 pr-4"
          onClick={() => {
            if (!$property.getState()?._id) {
              propertyChanged(null);
              return;
            }
            setEditData(false);
            editGeomChanged(false);
          }}
        >
          <div className="flex flex-row w-full">
            Annuler{" "}
            <Close20
              color="red"
              className="float-right ml-auto mr-0"
              slot="icon"
            />
          </div>
        </Button>
      )}
      {(editData || editGeom) && (
        <Button className="mt-4 mx-auto w-1/2 pr-4" onClick={save}>
          <div className="flex flex-row w-full">
            Enregistrer{" "}
            <Save20 className="float-right ml-auto mr-0" slot="icon" />
          </div>
        </Button>
      )}
    </div>
  );
};

const PropertyData = ({ setEditData, editData }) => {
  const property = useStore($property);
  return (
    <>
      <div className="flex flex-row mb-2 h-12">
        <div className="text-base font-bold my-auto mr-auto">
          Données Attributaires
        </div>
        {!editData && (
          <Button
            size="sm"
            kind="ghost"
            className="ml-auto"
            onClick={() => setEditData(true)}
          >
            <Edit20 className="float-right ml-auto mr-0" slot="icon" />
          </Button>
        )}
      </div>
      {editData && <PropertyEditor />}
      {!editData && <PropertyTable property={property} />}
    </>
  );
};

const PropertyGeometry = () => {
  const property = useStore($property);
  const editGeom = useStore($editGeom);
  if (!property?._id) return null;
  return (
    <>
      <div className="flex flex-row mb-2 mt-4 h-12">
        <div className="text-base font-bold my-auto">Coordonnées</div>
        <Button
          size="sm"
          kind="ghost"
          className="ml-auto"
          onClick={() => editGeomChanged(!editGeom)}
        >
          <Edit20 className="float-right ml-auto mr-0" slot="icon" />
        </Button>
      </div>
      {!editGeom && <CoordsTable />}
      {editGeom && <Coordinates />}
    </>
  );
};

const Property = () => {
  const property = useStore($property);
  const [editData, setEditData] = useState();
  const editGeom = useStore($editGeom);
  const ref = useRef(null);
  const [show, toggle] = useToggle(false);

  useEffect(() => {
    editGeomChanged(false);
    setEditData(false);
    if (property && !property._id) setEditData(true);
  }, [property]);

  useEffect(() => {
    if (!draw) return;
    if (editGeom && !$property.getState()?.Coordonnées?.length)
      draw.changeMode("draw_polygon");
    else if (draw.getMode() === "draw_polygon") {
      draw.changeMode("simple_select", { featureIds: draw.getSelectedIds() });
    }
  }, [editGeom]);

  return (
    <div className="mb-12">
      <PropertyData {...{ editData, setEditData }} />
      <PropertyGeometry />
      <FileManager />
      <PropertyActions {...{ editData, setEditData, toggle }} />
      <div ref={ref} style={{ backgroundColor: "black" }}>
        {show ? <Print toggle={toggle} /> : null}
      </div>
    </div>
  );
};

export default Property;
