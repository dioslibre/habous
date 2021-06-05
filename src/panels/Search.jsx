/* eslint-disable react/prop-types */
import React, { memo, useCallback, useState } from "react";
import VirtualScroll from "../lib/VirtualScroll";
import { useStore } from "effector-react";
import {
  Button,
  TextInput,
  MultiSelect,
  TextArea,
  Loading,
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
} from "../modules/store";
import {
  ArrowRight20,
  Checkmark20,
  Close20,
  Erase20,
} from "@carbon/icons-react";
import { fetchProperties } from "../modules/db";
import AutoSizer from "react-virtualized-auto-sizer";

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
  const value = useStore(searchStores["$Régimes fonciers"]);
  return (
    <MultiSelect
      itemToString={(item) => item}
      id={"ms-statut"}
      titleText={"Régimes fonciers"}
      label="Options"
      size="sm"
      light={true}
      onChange={(event) =>
        console.log(event) &
        searchEvents["Régimes fonciersChanged"](event.selectedItems)
      }
      items={["Titre foncier", "Réquisition", "Non immatriculé"]}
      defaultValue={value}
    ></MultiSelect>
  );
}
function Statut() {
  const value = useStore(searchStores.$Statuts);
  return (
    <MultiSelect
      itemToString={(item) => item}
      id={"ms-statut"}
      titleText={"Statuts de Possession"}
      label="Options"
      size="sm"
      light={true}
      onChange={(event) =>
        console.log(event) & searchEvents["StatutsChanged"](event.selectedItems)
      }
      items={["En possession", "Vendue"]}
      defaultValue={value}
    ></MultiSelect>
  );
}
function AttributeCombo({ field }) {
  const items = useStore(
    attributeStores["$" + field.substring(0, field.length - 1)]
  );
  const attrib = useStore(searchStores["$" + field]);

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
      defaultValue={attrib}
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
      <div className="flex flex-row w-80">
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

  if (!properties?.length) return null;

  return (
    <>
      <div
        style={{ borderTop: "1px solid" }}
        className="border-2 border-blue-700 flex flex-row w-full my-2 px-4"
      >
        <div className="text-base font-bold my-auto">
          Résultats {properties.length}
        </div>
        <Button
          size="sm"
          kind="ghost"
          className="ml-auto my-auto h-12"
          onClick={clear}
        >
          <Close20 className="float-right ml-auto mr-0" slot="icon" />
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
  const [pending, setPending] = useState(false);
  const clear = () => {
    Object.keys(searchEvents).forEach((key) => {
      searchEvents[key](null);
    });
  };
  const go = async () => {
    setPending(true);
    await fetchProperties($search.getState());
    setPending(false);
  };

  return (
    <>
      {pending && <Loading />}
      <div className="flex flex-row z-10 bg-white p-4">
        <div className="text-base font-bold my-auto">Paramètres</div>
        <Button
          size="sm"
          kind="ghost"
          className="ml-auto my-auto h-12"
          onClick={clear}
        >
          <Erase20 className="float-right ml-auto mr-0" slot="icon" />
        </Button>
        <Button size="sm" className="h-12 my-auto" onClick={go}>
          <Checkmark20 className="float-right ml-auto mr-0" slot="icon" />
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
    </div>
  );
};

export default Search;
