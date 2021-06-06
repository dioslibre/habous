/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useStore } from "effector-react";
import {
  $property,
  attributeStores,
  PropertyFields,
  pendingChanged,
} from "../modules/store";
import { map } from "../modules/map";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

function PrintInfo() {
  const property = useStore($property);

  if (!property) return null;

  return (
    <div className="p-4 pt-0 h-full w-2/5">
      <table>
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
          <tr>
            <td className="font-bold">Date</td>
            <td className="">{new Date().toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const MapContainer = ({ toggle }) => {
  const [source, setSource] = useState();

  useEffect(() => {
    pendingChanged(true);
    setSource(map.getCanvas().toDataURL());
    setTimeout(() => {
      window
        .html2canvas(document.getElementById("print"), {
          allowTaint: false,
          scale: 2,
        })
        .then((canvas) => {
          const data = canvas.toDataURL("image/png");
          const pdf = new jsPDF("l", "mm", "a4");
          let pdfWidth = pdf.internal.pageSize.getWidth();
          let pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(data, "png", 0, 0, pdfWidth, pdfHeight);
          pdf.save("Note.pdf");
          toggle(false);
          toast("Enregistrement réussie", { type: "success", autoClose: 2000 });
          pendingChanged(false);
        });
    }, 1000);
  }, []);

  return (
    <div className="flex-grow-default px-10 pb-10">
      <div
        className="h-full w-full"
        style={{
          backgroundSize: "cover",
          backgroundImage: `url(${source})`,
          backgroundPosition: "center",
        }}
        src={source}
      ></div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="mx-auto flex my-12">
      <div className="flex-grow mr-4 my-auto text-center">
        <p className="text-xl">المملكة المغربية</p>
        <p className="text-xl">وزارة الأوقاف والشؤون الاسلامية</p>
        <p className="text-xl">نظارة أوقاف الدار البيضاء</p>
        <p className="text-xl">مصلحة الإستثمار و المحافظة على الأوقاف</p>
      </div>

      <div className="flex-grow my-auto">
        <img
          className="w-32"
          src="./emblem.jpg"
          alt="Royaume du Maroc"
          width="4rem"
          height="4rem"
        />
      </div>
    </div>
  );
};

function Footer() {
  return (
    <div className="mx-auto mb-12 text-base">
      NB: Cette note est fournie strictement à titre indicatif.
    </div>
  );
}

function Viewport({ toggle }) {
  return (
    <div className="flex-grow-default flex flex-row mx-12">
      <PrintInfo />
      <MapContainer toggle={toggle} />
    </div>
  );
}

function Print({ toggle }) {
  return (
    <div
      id="print"
      style={{
        height: "20.9cm",
        width: "29.7cm",
        margin: "auto",
      }}
      className="flex flex-col bg-white"
    >
      <Header />
      <Viewport toggle={toggle} />
      <Footer />
    </div>
  );
}

export default Print;
