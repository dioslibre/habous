import { propertiesChanged, geometriesChanged, attributeEvents } from "./store";

export let db = null;
export let usersdb = null;
export let remotedb = null;
export let remoteusersdb = null;

export async function usersCreate() {
  const rurl =
    "https://67e14099-4c90-446a-b70a-569cb72630ba-bluemix:cfeff486e95f33ac12b69fa6cf1e5a538140758f14f89e032d5695122776786a@67e14099-4c90-446a-b70a-569cb72630ba-bluemix.cloudantnosqldb.appdomain.cloud/users";
  const url =
    "http://habous:habous@" +
    window.location.host.replace("3000", "5984") +
    "/users";
  usersdb = new window.PouchDB(url);
  remoteusersdb = new window.PouchDB(rurl);

  usersdb.sync(remoteusersdb, {
    live: true,
    retry: true,
  });

  const users = await allUsers();

  if (!users.length) {
    await usersdb.post({
      name: "habous",
      password: "habous",
      role: "Administrateur",
      fullname: "Administrateur",
    });
  }
}

export const allUsers = async () => {
  return (
    (await usersdb.allDocs({ include_docs: true })).rows.map((e) => e.doc) || []
  );
};

export async function create() {
  const rurl =
    "https://67e14099-4c90-446a-b70a-569cb72630ba-bluemix:cfeff486e95f33ac12b69fa6cf1e5a538140758f14f89e032d5695122776786a@67e14099-4c90-446a-b70a-569cb72630ba-bluemix.cloudantnosqldb.appdomain.cloud/habous";
  const url =
    "http://habous:habous@" +
    window.location.host.replace("3000", "5984") +
    "/habous";

  db = new window.PouchDB(url);
  remotedb = new window.PouchDB(rurl);

  usersdb.sync(remoteusersdb, {
    live: true,
    retry: true,
  });

  const geoms = await allGeoms();
  geometriesChanged(geoms);
  allAttributes();
  // reactToChanges(db);
}

export const allAttributes = async () => {
  const Unité = await allofType("Unité");
  attributeEvents["UnitéChanged"](Unité);
  await sleep(200);
  const Conservation = await allofType("Conservation");
  attributeEvents["ConservationChanged"](Conservation);
  await sleep(200);
  const Propriétaire = await allofType("Propriétaire");
  attributeEvents["PropriétaireChanged"](Propriétaire);
  await sleep(200);
  const Consistance = await allofType("Consistance");
  attributeEvents["ConsistanceChanged"](Consistance);
  await sleep(200);
  const Affectation = await allofType("Affectation");
  attributeEvents["AffectationChanged"](Affectation);
  await sleep(200);
  const TypeDeDocument = await allofType("Type de document");
  attributeEvents["Type de documentChanged"](TypeDeDocument);
  await sleep(200);
  const StatutDePossession = await allofType("Statut de possession");
  attributeEvents["Statut de possessionChanged"](StatutDePossession);
  await sleep(200);
  const RégimeFoncier = await allofType("Régime foncier");
  attributeEvents["Régime foncierChanged"](RégimeFoncier);
  await sleep(200);
};

function sleep(ms) {
  return new window.Promise((resolve) => setTimeout(resolve, ms));
}

export function destroy() {
  db?.close();
}

export function binarySearch(arr, docId) {
  let low = 0,
    high = arr.length,
    mid;
  while (low < high) {
    mid = (low + high) >>> 1; // faster version of Math.floor((low + high) / 2)
    arr[mid]._id || "" < docId ? (low = mid + 1) : (high = mid);
  }
  return low;
}

export async function allRecords() {
  return (
    (await db.allDocs({ include_docs: true }))?.rows?.map((e) => e.doc) || []
  );
}

export async function allGeoms() {
  try {
    await db.createIndex({
      index: {
        fields: ["type", "Coordonnées"],
      },
    });
    return (
      (
        await db.find({
          selector: { type: "Propriété", Coordonnées: { $gt: null } },
        })
      )?.docs || []
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function allofType(type) {
  try {
    if (!type) return [];
    return (
      (
        await db.find({
          selector: { type },
        })
      )?.docs || []
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function addRecord(record) {
  return db.post(record);
}
export async function saveRecord(record) {
  return db.put(record);
}
export async function getRecord(_id) {
  return db.get(_id);
}
export async function bulkRecords(records) {
  return db.bulkDocs(records);
}
export async function allKeys(keys) {
  return (
    (await db.allDocs({ keys, include_docs: true })).rows
      ?.map((e) => e.doc)
      ?.filter((e) => e) || []
  );
}

export const fetchProperties = async (search = {}) => {
  const q = { type: "Propriété" };

  if (search["$Unités"] && search["$Unités"].length)
    q["Unité"] = { $in: search["$Unités"] };

  if (search["$Conservations"] && search["$Conservations"].length)
    q["Conservation"] = { $in: search["$Conservations"] };

  if (search["$Statuts"] && search["$Statuts"].length)
    q["Statut"] = { $in: search["$Statuts"] };

  if (search["$Identifiant"]) q["Identifiant"] = search["$Identifiant"];

  if (search["$Régimes fonciers"] && search["$Régimes fonciers"].length)
    q["Régime foncier"] = { $in: search["$Régimes fonciers"] };

  if (search["$N° Réquisition"])
    q["N° Réquisition"] = search["$N° Réquisition"];

  if (search["$Titre foncier"]) q["Titre foncier"] = search["$Titre foncier"];

  if (search["$Propriétaires"] && search["$Propriétaires"].length)
    q["Propriétaire"] = { $in: search["$Propriétaires"] };

  if (search["$Consistances"] && search["$Consistances"].length)
    q["Consistance"] = { $in: search["$Consistances"] };

  if (search["$Affectations"] && search["$Affectations"].length)
    q["Affectation"] = { $in: search["$Affectations"] };

  let qs = {
    $gte: search["$Surface (min)"] ? search["$Surface (min)"] : undefined,
    $lte: search["$Surface (max)"] ? search["$Surface (max)"] : undefined,
  };
  if (!qs.$gte) delete qs.$gte;
  if (!qs.$lte) delete qs.$lte;
  if (qs.$gte || qs.$lte) q["Surface"] = qs;

  qs = {
    $gte: search["$Valeur locative (min)"]
      ? search["$Valeur locative (min)"]
      : undefined,
    $lte: search["$Valeur locative (max)"]
      ? search["$Valeur locative (max)"]
      : undefined,
  };
  if (!qs.$gte) delete qs.$gte;
  if (!qs.$lte) delete qs.$lte;
  if (qs.$gte || qs.$lte) q["Valeur locative"] = qs;

  qs = {
    $gte: search["$Valeur vénale (min)"]
      ? search["$Valeur vénale (min)"]
      : undefined,
    $lte: search["$Valeur vénale (max)"]
      ? search["$Valeur vénale (max)"]
      : undefined,
  };
  if (!qs.$gte) delete qs.$gte;
  if (!qs.$lte) delete qs.$lte;
  if (qs.$gte || qs.$lte) q["Valeur vénale"] = qs;

  console.log(q);

  let all = (await db.find({ selector: q }))?.docs || [];

  if (search["$Adresse"])
    all = all.filter((e) =>
      e["Adresse"].toLowerCase().includes(search["$Adresse"])
    );

  if (search["$Nota Bene"])
    all = all.filter((e) =>
      e["Nota Bene"].toLowerCase().includes(search["$Nota Bene"])
    );

  propertiesChanged(all);
};
