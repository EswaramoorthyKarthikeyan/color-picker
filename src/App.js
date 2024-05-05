import { Pane } from "tweakpane";
import { isDark, toHex, toRgba, toHsla } from "khroma";
import { Toaster, toast } from "sonner";

import "./style.scss";
import { useEffect } from "react";

export default function App() {
    useEffect(() => {
        const wrapperCls = document.querySelector(".wrapper");

        const CONFIG = {
            rows: 10,
            cols: 10,
            showColor: true,
            colorType: "HEX",
        };

        const loadTiles = (noOfRows, noOfCols) => {
            console.log(wrapperCls);
            wrapperCls.style.setProperty("--no-of-rows", noOfRows);
            wrapperCls.style.setProperty("--no-of-cols", noOfCols);

            // Removing old child
            while (wrapperCls.hasChildNodes()) {
                wrapperCls.removeChild(wrapperCls.lastChild);
            }

            for (let i = 1; i <= noOfRows; i++) {
                for (let j = 1; j <= noOfCols; j++) {
                    const childNode = document.createElement("div");
                    childNode.className = "childNode";
                    childNode.id = "childNode" + i + j;

                    wrapperCls.appendChild(childNode);
                    const hue = j * Math.floor(360 / noOfCols);
                    const sat = i * Math.floor(99 / noOfRows);
                    const light = i * Math.floor(99 / noOfRows);

                    let bgColor = `hsl(${hue} ${sat}% ${light}%)`;

                    const ColorTypes = {
                        HSLA: toHsla(bgColor),
                        RGBA: toRgba(bgColor),
                        HEX: toHex(bgColor),
                    };

                    bgColor = ColorTypes[CONFIG.colorType];

                    childNode.style.backgroundColor = bgColor;

                    const isDarkBG = isDark(bgColor);
                    const textColor = isDarkBG ? "#fff" : "#000";
                    childNode.style.color = textColor;
                    if (CONFIG.showColor) {
                        childNode.innerText = bgColor;
                    }
                    childNode.style.setProperty("--grid-row-start", i);
                    childNode.style.setProperty("--grid-row-end", i + 1);
                    childNode.style.setProperty("--grid-col-start", j);
                    childNode.style.setProperty("--grid-col-end", j + 1);
                    childNode.addEventListener("click", () => {
                        navigator.permissions.query({ name: "writeText" }).then((result) => {
                            if (result.state === "granted") {
                                navigator.clipboard.writeText(bgColor);
                                toast.success(` Selected color is ${bgColor}`);
                            } else if (result.state === "prompt") {
                                showButtonToEnableMap();
                            }
                            // Don't do anything if the permission was denied.
                            toast.error(` Selected color is ${bgColor}`);
                        });
                    });
                }
            }
        };

        const UPDATE = () => {
            loadTiles(CONFIG.rows, CONFIG.cols);
        };

        const CTRL = new Pane({ title: "Config", expanded: true });

        CTRL.addBinding(CONFIG, "rows", {
            label: "Rows",
            min: 1,
            max: 99,
            step: 1,
        });

        CTRL.addBinding(CONFIG, "cols", {
            label: "Columns",
            min: 1,
            max: 360,
            step: 1,
        });

        CTRL.addBinding(CONFIG, "showColor", {
            label: "Show Color",
            showColor: true,
        });

        CTRL.addBinding(CONFIG, "colorType", {
            view: "list",
            label: "Color type",
            options: [
                { text: "HSLA", value: "HSLA" },
                { text: "RGBA", value: "RGBA" },
                { text: "HEX", value: "HEX" },
            ],
            value: "HSL",
        });

        CTRL.on("change", UPDATE);

        loadTiles(12, 10);
    }, []);

    return (
        <div className="App">
            <Toaster position="top-right" expand={true} richColors />
            <div className="container">
                <div className="wrapper"></div>
            </div>
        </div>
    );
}
