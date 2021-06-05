import { combine, createEvent, createStore } from "effector";
import { create } from "./db";
import { transformOneToLocal } from "./utils";

// tab
export const tabChanged = createEvent();
export const $tab = createStore(0).on(tabChanged, (_, payload) => payload);
// $tab.watch(console.log);

// property
export const PropertyFields = [
  "Unité",
  "Conservation",
  "Statut",
  "Identifiant",
  "Régime foncier",
  "N° Réquisition",
  "Titre foncier",
  "Propriétaire",
  "Consistance",
  "Affectation",
  "Surface",
  "Coordonnées",
  "Valeur locative",
  "Valeur vénale",
  "Adresse",
  "Nota Bene",
];

export const propertyEvents = {};
PropertyFields.forEach(
  (name) => (propertyEvents[name + "Changed"] = createEvent())
);
export const propertyStores = {};
PropertyFields.forEach((name) => {
  propertyStores["$" + name] = createStore(null).on(
    propertyEvents[name + "Changed"],
    (_, payload) => payload
  );
  // propertyStores["$" + name].watch(console.log);
});
export const $propertyCombined = combine(propertyStores);

export const propertyChanged = createEvent();
export const $property = createStore(null).on(
  propertyChanged,
  (_, payload) => payload
);

$property.watch((payload) => {
  if (!payload) {
    PropertyFields.forEach((key) => {
      propertyEvents[key + "Changed"](null);
    });
    tabChanged(0);
    return;
  }
  PropertyFields.forEach((key) => {
    if (payload[key]) propertyEvents[key + "Changed"](payload[key]);
    else propertyEvents[key + "Changed"](null);
  });
  tabChanged(1);
});

export const $coordinates = createStore(null).on(
  propertyEvents["CoordonnéesChanged"],
  (_, payload) =>
    payload?.length
      ? payload.reduce((a, b) => a + `${b[0]} ${b[1]}` + "\n", [])
      : ""
);

// attributes
export const attributeFields = [
  "Unité",
  "Conservation",
  "Propriétaire",
  "Consistance",
  "Affectation",
  "TypeDeDocument",
];
export const attributeEvents = {};
attributeFields.forEach(
  (name) => (attributeEvents[name + "Changed"] = createEvent())
);
export const attributeStores = {};
attributeFields.forEach((name) => {
  attributeStores["$" + name] = createStore(null).on(
    attributeEvents[name + "Changed"],
    (_, payload) => payload
  );
  // attributeStores["$" + name].watch(console.log);
});

export const attributeOpenEvents = {};
attributeFields.forEach(
  (name) => (attributeOpenEvents[name + "Changed"] = createEvent())
);
export const attributeOpenStores = {};
attributeFields.forEach((name) => {
  attributeOpenStores["$" + name] = createStore(null).on(
    attributeOpenEvents[name + "Changed"],
    (_, payload) => payload
  );
  // attributeOpenStores["$" + name].watch(console.log);
});
export const attributeChanged = createEvent();
export const $attribute = createStore(null).on(
  attributeChanged,
  (_, payload) => {
    return payload;
  }
);
$attribute.watch(console.log);
// session
export const sessionChanged = createEvent();
export const $session = createStore(null).on(
  sessionChanged,
  (state, payload) => {
    if (!state) create();
    return payload;
  }
);
//$session.watch(console.log);

// auth
const authFields = ["sessionType", "ip", "name", "password"];
export const authEvents = {};
authFields.forEach((name) => (authEvents[name + "Changed"] = createEvent()));
export const authStores = {};
authFields.forEach((name) => {
  authStores["$" + name] = createStore(null).on(
    authEvents[name + "Changed"],
    (_, payload) => payload
  );
  // authStores["$" + name].watch(console.log);
});
export const $auth = combine(authStores);

// users
export const userFields = ["name", "password", "fullname", "role"];
export const userEvents = {};
userFields.forEach((name) => (userEvents[name + "Changed"] = createEvent()));
export const userStores = {};
userFields.forEach((name) => {
  userStores[name] = createStore(null).on(
    userEvents[name + "Changed"],
    (_, payload) => payload
  );
  userStores[name].watch(console.log);
});
export const $userCombined = combine(userStores);
export const userChanged = createEvent();
export const $user = createStore(null).on(userChanged, (_, payload) => payload);
$user.watch((payload) => {
  userFields.forEach((key) => {
    if (!payload) return;
    if (payload[key]) userEvents[key + "Changed"](payload[key]);
  });
});
export const usersChanged = createEvent();
export const $users = createStore(null).on(usersChanged, (_, payload) => {
  return payload;
});

// search
const searchFields = [
  "Unités",
  "Conservations",
  "Statuts",
  "Identifiant",
  "Régimes fonciers",
  "N° Réquisition",
  "Titre foncier",
  "Propriétaires",
  "Consistances",
  "Affectations",
  "Surface (min)",
  "Surface (max)",
  "Valeur locative (min)",
  "Valeur locative (max)",
  "Valeur vénale (min)",
  "Valeur vénale (max)",
  "Adresse",
  "Nota Bene",
];
export const searchEvents = {};
searchFields.forEach(
  (name) => (searchEvents[name + "Changed"] = createEvent())
);
export const searchStores = {};
searchFields.forEach((name) => {
  searchStores["$" + name] = createStore(null).on(
    searchEvents[name + "Changed"],
    (_, payload) => payload
  );
});
export const $search = combine(searchStores);
$search.watch(console.log);

// session
export const propertiesChanged = createEvent();
export const $properties = createStore(null).on(
  propertiesChanged,
  (state, payload) => {
    if (!state) create();
    return payload;
  }
);
// $properties.watch(console.log);

// geom
export const geometriesChanged = createEvent();
export const $geometries = createStore(null).on(
  geometriesChanged,
  (_, payload) => {
    return payload;
  }
);
// print
export const printChanged = createEvent();
export const $print = createStore(null).on(
  printChanged,
  (_, payload) => payload
);

// baselayer
export const baseLayerChanged = createEvent();
export const $baseLayer = createStore("Hybride").on(
  baseLayerChanged,
  (_, payload) => payload
);

// x/y
export const xChanged = createEvent();
export const $x = createStore(null).on(xChanged, (store, payload) => payload);

export const yChanged = createEvent();
export const $y = createStore(null).on(yChanged, (store, payload) => payload);

export const editGeomChanged = createEvent();
export const $editGeom = createStore(null).on(
  editGeomChanged,
  (store, payload) => payload
);

// view
export const viewChanged = createEvent();
export const $view = createStore({ center: [-7.5898, 33.5731], zoom: 11 }).on(
  viewChanged,
  (_, payload) => payload
);

// center
export const centerChanged = createEvent();
export const $centerProjected = createStore(
  transformOneToLocal($view.getState().center)
).on(centerChanged, (_, payload) => payload);
$view.watch((view) => {
  centerChanged(transformOneToLocal(view.center));
});
