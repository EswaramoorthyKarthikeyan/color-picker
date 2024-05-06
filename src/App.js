import { useEffect, useState, useRef } from "react";
import { Pane } from "tweakpane";
import { isDark, toHex, toRgba, toHsla } from "khroma";
import { Toaster, toast } from "sonner";

import "./style.scss";

export default function App() {
    const containerRef = useRef(null);
    const [bg, setBg] = useState("");
    const [color, setColor] = useState("");

    const [rowVal, setRowVal] = useState(8);
    const [colVal, setColVal] = useState(8);
    const [showColor, setShowColor] = useState(true);
    const [colorType, setColorType] = useState("HEX");

    const loadTiles = (noOfRows, noOfCols) => {
        const wrapperCls = containerRef.current;
        wrapperCls.style.setProperty("--no-of-rows", noOfRows);
        wrapperCls.style.setProperty("--no-of-cols", noOfCols);

        wrapperCls.innerHTML = null;

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

                bgColor = ColorTypes[colorType];

                childNode.style.backgroundColor = bgColor;

                const textColor = isDark(bgColor) ? "#fff" : "#000";

                if (showColor) {
                    childNode.style.color = textColor;
                    childNode.innerText = bgColor;
                }
                childNode.style.setProperty("--grid-row-start", i);
                childNode.style.setProperty("--grid-row-end", i + 1);
                childNode.style.setProperty("--grid-col-start", j);
                childNode.style.setProperty("--grid-col-end", j + 1);

                childNode.addEventListener("click", () => writeClipboardText(bgColor, textColor));

                async function writeClipboardText(bgColor, textColor) {
                    setBg(bgColor);
                    setColor(textColor);
                    try {
                        await navigator.clipboard.writeText(bgColor);
                        toast.success(` Selected color is ${bgColor}`);
                    } catch (error) {
                        toast.error(error.message);
                    }
                }
            }
        }
    };

    useEffect(() => {
        const CTRL = new Pane({ title: "Config", expanded: true });

        const CONFIG = {
            rows: rowVal,
            cols: colVal,
            showColor: true,
            colorType: "HEX",
        };

        const UPDATE = () => {
            setRowVal(CONFIG.rows);
            setColVal(CONFIG.cols);
            setShowColor(CONFIG.showColor);
            setColorType(CONFIG.colorType);
        };

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
    }, []);

    useEffect(() => {
        loadTiles(rowVal, colVal);
    }, [colorType, showColor, rowVal, colVal]);

    return (
        <div className="App">
            <Toaster
                position="top-right"
                expand={true}
                richColors
                toastOptions={{ style: { backgroundColor: bg, color: color, border: "none" } }}
            />
            <div className="container">
                <div className="wrapper" ref={containerRef}></div>
            </div>
        </div>
    );
}
