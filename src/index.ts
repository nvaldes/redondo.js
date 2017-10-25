import * as THREE from "three";
import * as Hammer from "hammerjs";
declare function require<T>(module: string): T;
(window as any).THREE = THREE;
(window as any).Hammer = Hammer;
require("three/examples/js/controls/OrbitControls.js");
require("three/examples/js/renderers/CSS3DRenderer.js");