import React from "react";
import { Tabs, Tab } from "carbon-components-react";
import "carbon-components/scss/components/tabs/_tabs.scss";
import Attributes from "../panels/Attributes";
import Property from "../panels/Property";
import Search from "../panels/Search";
import { useStore } from "effector-react";
import {
  $property,
  $session,
  $tab,
  tabChanged,
  $print,
} from "../modules/store";
import Administration from "../panels/Administration";

const Panel = () => {
  const print = useStore($print);
  const session = useStore($session);
  const tab = useStore($tab);
  const property = useStore($property);

  return (
    <div
      className={`h-full overflow-hidden text-gray-900 ${
        print ? "w-0" : "w-92"
      } flex flex-col`}
    >
      <Tabs selected={tab} type="container">
        <Tab onClick={() => tabChanged(0)} id="tab-1" label="Recherche">
          <Search />
        </Tab>
        <Tab
          disabled={!property}
          onClick={() => tabChanged(1)}
          id="tab-2"
          label="Propriété"
        >
          <div className="p-4 bx-scrollable h-full overflow-auto">
            <Property />
          </div>
        </Tab>
        <Tab onClick={() => tabChanged(2)} id="tab-3" label="Attributs">
          <div className="p-4 bx-scrollable h-full overflow-auto">
            <Attributes />
          </div>
        </Tab>
        {(session.name === "habous" || session.role === "Administrateur") && (
          <Tab
            onClick={() => tabChanged(3)}
            id="tab-5"
            label={"Administration"}
          >
            <div className="p-4 bx-scrollable h-full overflow-auto">
              <Administration />
            </div>
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default Panel;
