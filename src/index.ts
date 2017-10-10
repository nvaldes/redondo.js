import * as THREE from "three";
declare function require<T>(module: string): T;
(window as any).THREE = THREE;
require("three/examples/js/controls/OrbitControls.js");
require("three/examples/js/renderers/CSS3DRenderer.js");