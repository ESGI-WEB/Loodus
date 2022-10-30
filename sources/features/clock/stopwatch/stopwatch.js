import "./stopwatch.scss"
import {stopwatchTagName} from "./stopwatch-helpers";

fetch("features/clock/stopwatch/stopwatch.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Stopwatch extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;
            // Write your code here, it will be executed when the component is loaded
        }
    }
    customElements.define(stopwatchTagName, Stopwatch);
}