/* eslint-disable react/prop-types */
import React, { memo, useCallback } from "react";
import VirtualScroll from "../lib/VirtualScroll";
import { useStore } from "effector-react";
import {
  Button,
  TextInput,
  MultiSelect,
  TextArea,
} from "carbon-components-react";
import {
  $properties,
  $search,
  attributeStores,
  propertiesChanged,
  propertyChanged,
  propertyEvents,
  PropertyFields,
  searchEvents,
  searchStores,
  tabChanged,
  pendingChanged,
  attributeFields,
} from "../modules/store";
import {
  Add20,
  ArrowRight20,
  Close20,
  Save20,
  Search20,
} from "@carbon/icons-react";
import { fetchProperties } from "../modules/db";
import AutoSizer from "react-virtualized-auto-sizer";
import { saveExcel } from "../modules/utils";

function Titre() {
  const value = useStore(searchStores["$Titre foncier"]);
  return (
    <TextInput
      id={"search-titre"}
      defaultValue={value || ""}
      size="sm"
      light={true}
      labelText="Titre foncier"
      onChange={(event) =>
        searchEvents["Titre foncierChanged"](event.target.value)
      }
    />
  );
}

function Identifiant() {
  const value = useStore(searchStores["$Identifiant"]);
  return (
    <TextInput
      id={"text-id"}
      defaultValue={value || ""}
      size="sm"
      light
      labelText="Identifiant"
      onChange={(event) =>
        searchEvents["IdentifiantChanged"](event.target.value)
      }
    />
  );
}

function Requisition() {
  const value = useStore(searchStores["$N° Réquisition"]);
  return (
    <TextInput
      id={"search-req"}
      defaultValue={value || ""}
      size="sm"
      light={true}
      labelText="N° Réquisition"
      onChange={(event) =>
        searchEvents["N° RéquisitionChanged"](event.target.value)
      }
    />
  );
}
function Regime() {
  return (
    <MultiSelect
      itemToString={(item) => item}
      id={"ms-statut"}
      titleText={"Régimes fonciers"}
      label="Options"
      size="sm"
      light={true}
      onChange={(event) =>
        searchEvents["Régimes fonciersChanged"](event.selectedItems)
      }
      items={["Titre foncier", "Réquisition", "Non immatriculé"]}
    ></MultiSelect>
  );
}
function Statut() {
  return (
    <MultiSelect
      itemToString={(item) => item}
      id={"ms-statut"}
      titleText={"Statuts de Possession"}
      label="Options"
      size="sm"
      light={true}
      onChange={(event) => searchEvents["StatutsChanged"](event.selectedItems)}
      items={["En possession", "Vendue"]}
    ></MultiSelect>
  );
}
function AttributeCombo({ field }) {
  const items = useStore(
    attributeStores["$" + field.substring(0, field.length - 1)]
  );

  if (!items) return null;

  return (
    <MultiSelect
      itemToString={(item) => item.name}
      id={"dropdown-" + field}
      titleText={field}
      label="Options"
      size="sm"
      light={true}
      onChange={(event) =>
        searchEvents[field + "Changed"](event.selectedItems.map((e) => e._id))
      }
      items={items}
    ></MultiSelect>
  );
}

function Numbers({ minfield, maxfield }) {
  const min = useStore(searchStores["$" + minfield]);
  const max = useStore(searchStores["$" + maxfield]);
  return (
    <div className="flex flex-row">
      <TextInput
        id={minfield}
        size="sm"
        labelText={minfield}
        light={true}
        type="number"
        min={(min && Math.floor(min * 100) / 100.0) || ""}
        onChange={(event) =>
          searchEvents[minfield + "Changed"](parseFloat(event.target.value))
        }
      />
      <div className="w-2"></div>
      <TextInput
        id={maxfield}
        size="sm"
        labelText={maxfield}
        light={true}
        type="number"
        defaultValue={(max && Math.floor(max * 100) / 100.0) || ""}
        onChange={(event) =>
          searchEvents[maxfield + "Changed"](parseFloat(event.target.value))
        }
      />
    </div>
  );
}
function Address() {
  const value = useStore(searchStores["$Adresse"]);
  return (
    <TextArea
      rows={2}
      defaultValue={value || ""}
      size="sm"
      light={true}
      labelText="Adresse"
      onChange={(event) => searchEvents["AdresseChanged"](event.target.value)}
    ></TextArea>
  );
}

function Note() {
  const value = useStore(searchStores["$Nota Bene"]);
  return (
    <TextArea
      rows={2}
      defaultValue={value || ""}
      size="sm"
      light={true}
      labelText="Note"
      onChange={(event) => searchEvents["Nota BeneChanged"](event.target.value)}
    ></TextArea>
  );
}

// eslint-disable-next-line react/display-name
const SearchListItem = memo(({ index, row }) => {
  const units = useStore(attributeStores.$Unité);

  const navigate = useCallback(() => {
    propertyChanged(row);
    PropertyFields.forEach((e) => propertyEvents[e + "Changed"](row[e]));
    tabChanged(1);
  }, [row]);

  return (
    <Button
      key={index}
      className="bg-white shadow-md border-r-2 my-2 mx-4 py-2 pr-4 border-blue-700 max-full flex-grow"
      kind="ghost"
      size="lg"
      onClick={navigate}
    >
      <div className="flex flex-row w-120">
        <div>
          <p className="text-base text-black font-bold mb-1">
            Identifiant {row.Identifiant}
          </p>
          <p className="text-black text-base">
            Unité {units?.find((e) => e._id === row.Unité)?.name || "-"}
          </p>
        </div>
        <ArrowRight20 className="float-right ml-auto mr-0" slot="icon" />
      </div>
    </Button>
  );
});

const SearchList = () => {
  const properties = useStore($properties);
  const clear = () => propertiesChanged([]);
  const callback = useCallback(() => 90, []);
  const save = useCallback(() => {
    const attributes = {};
    attributeFields.forEach(
      (e) => (attributes[e] = attributeStores["$" + e].getState())
    );
    saveExcel(properties, attributes);
  }, [properties]);

  if (!properties?.length) return null;

  return (
    <>
      <div
        style={{ borderTop: "1px solid" }}
        className="border-2 border-blue-700 flex flex-row w-full my-2 px-4"
      >
        <div className="text-base font-bold my-auto mr-auto">
          {properties.length} Propriété(s)
        </div>
        {properties?.length && (
          <Button
            size="sm"
            kind="ghost"
            className="ml-auto my-auto h-12"
            onClick={save}
          >
            <Save20 className="float-right ml-auto mr-0" slot="icon" />
          </Button>
        )}
        <Button size="sm" kind="ghost" className="my-auto h-12" onClick={clear}>
          <Close20 className="float-right mr-0" slot="icon" />
        </Button>
      </div>
      <div style={{ height: "150%" }}>
        <AutoSizer>
          {({ height, width }) => {
            return (
              <VirtualScroll
                width={width}
                height={height}
                getChildHeight={callback}
                Item={SearchListItem}
                items={properties}
              />
            );
          }}
        </AutoSizer>
      </div>
    </>
  );
};

const SearchParams = () => {
  return (
    <div className="flex-grow-default bx-scrollable overflow-auto pt-0 p-4">
      <AttributeCombo field={"Unités"} />
      <Identifiant />
      <Titre />
      <Requisition />
      <Regime />
      <Statut />
      {["Conservations", "Affectations", "Consistances", "Propriétaires"].map(
        (field) => (
          <AttributeCombo key={field} field={field} />
        )
      )}
      {[
        ["Surface (min)", "Surface (max)"],
        ["Valeur locative (min)", "Valeur locative (max)"],
        ["Valeur vénale (min)", "Valeur vénale (max)"],
      ].map((field) => (
        <Numbers key={field} minfield={field[0]} maxfield={field[1]} />
      ))}
      <Address />
      <Note />
    </div>
  );
};

const SearchActions = () => {
  const go = async () => {
    pendingChanged(true);
    await fetchProperties($search.getState());
    pendingChanged(false);
  };

  return (
    <>
      <div className="flex flex-row z-10 bg-white p-4">
        <div className="text-base font-bold mr-auto my-auto">Paramètres</div>
        <Button size="sm" className="h-12 my-auto" onClick={go}>
          <Search20 slot="icon" />
        </Button>
      </div>
    </>
  );
};

const Search = () => {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <SearchActions />
      <SearchParams />
      <SearchList />
      <NewPropertyAction />
    </div>
  );
};

const NewPropertyAction = () => {
  return (
    <div className="fixed z-10 right-0 bottom-0">
      <Button
        style={{ width: 400 }}
        className="mt-4 mx-auto pr-4 max-w-full"
        onClick={() => propertyChanged({})}
      >
        <div className="flex flex-row w-full">
          Nouvelle Propriété{" "}
          <Add20 className="float-right ml-auto mr-0" slot="icon" />
        </div>
      </Button>
    </div>
  );
};

export default Search;
