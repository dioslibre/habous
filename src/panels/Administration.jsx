import { Download20, Upload20 } from "@carbon/icons-react";
import { Button } from "carbon-components-react";
import React, { useRef } from "react";
import { toast } from "react-toastify";
import { attributeFields, pendingChanged } from "../modules/store";
import { bulkRecords } from "../modules/db";
import UserManager from "./UserManager";

export const attributeArrays = {
  Unité: [],
  Conservation: [],
  Propriétaire: [],
  Consistance: [],
  Affectation: [],
};

const Administration = () => {
  const ref = useRef();
  function click() {
    ref.current.click();
  }
  function load(files) {
    var output = ""; //placeholder for text output
    const reader = new FileReader();
    if (files[0]) {
      pendingChanged(true);
      reader.onload = async function (e) {
        try {
          output = e.target.result;
          const ids = [];
          const json = JSON.parse(output);
          attributeFields.forEach((field) => {
            json[field].forEach((f, i) => (f._id = field + i));
          });
          let data = json.data.map((e) => {
            ids.push(e.Identifiant);
            return {
              ...e,
              Identifiant: e.Identifiant.trim(),
              Surface: e.Surface && parseFloat(e.Surface.trim()),
              "Valeur locative":
                e["Valeur locative"] &&
                parseFloat(e.Surface["Valeur locative"].trim()),
              "Valeur vénale":
                e["Valeur vénale"] &&
                parseFloat(e.Surface["Valeur vénale"].trim()),
            };
          });

          // const existing = await allKeys(ids);

          data.forEach((element) => {
            element.type = "Propriété";
            // const idx = binarySearch(existing, element._id);
            // const doc = existing[idx];
            // if (doc?._rev) {
            //   element._rev = doc?._rev;
            // }
            attributeFields.forEach((field) => {
              if (!element[field]) return;
              const index = json[field].findIndex(
                (a) => a.name.trim() === element[field]?.trim()
              );
              if (index < 0) {
                const current = {
                  type: field,
                  _id: field + json[field].length,
                  name: element[field].trim(),
                };
                json[field].push(current);
                element[field] = current._id;
              } else {
                const current = json[field][index];
                element[field] = current._id;
              }
            });
          });

          attributeFields.forEach((key) => {
            data = data.concat(json[key]);
          });

          bulkRecords(data.filter((e) => !!e))
            .then(() => {
              pendingChanged(false);
              toast("Sauvegarde réussie", { type: "success", autoClose: 2000 });
            })
            .catch((e) => {
              pendingChanged(false);
              console.log(e);
              toast("Erreur Sauvegarde", { type: "error", autoClose: 2000 });
            });
        } catch (e) {
          pendingChanged(false);
          console.log(e);
          toast("Erreur Fichier", { type: "error", autoClose: 2000 });
        }
      };
      reader.readAsText(files[0]);
    } else {
      //this is where you could fallback to Java Applet, Flash or similar
      return false;
    }
    return true;
  }

  function download() {}

  return (
    <>
      <div className="flex flex-col h-12">
        <input
          className="hidden"
          ref={ref}
          type="file"
          onChange={(event) => load(event.target.files)}
        />
        <div className="text-base font-bold my-auto">Sauvegarde</div>
      </div>
      <div className="flex flex-row mb-4">
        <Button className="mx-auto w-2/5" onClick={click}>
          <div className="flex flex-row w-48">
            Charger{" "}
            <Upload20 className="float-right ml-auto mr-0" slot="icon" />
          </div>
        </Button>
        <Button className="mx-auto w-2/5" onClick={download}>
          <div className="flex flex-row w-48">
            Télécharger{" "}
            <Download20 className="float-right ml-auto mr-0" slot="icon" />
          </div>
        </Button>
      </div>
      <UserManager />
    </>
  );
};

export default Administration;
