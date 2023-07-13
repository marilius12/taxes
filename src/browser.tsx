import "simpledotcss/simple.min.css";
import "./style.css";

import { hydrate } from "preact";
import { Calculator } from "./Calculator.js";

hydrate(<Calculator />, document.getElementsByTagName("main")[0]);
