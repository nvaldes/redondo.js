import 'handjs';
import BABYLON from 'babylonjs';
import Hammer from 'hammerjs';

window.redondo = function(config) {
  window.redondo.config = config;
  var canvas = document.querySelector(config.selector);
  var engine = new BABYLON.Engine(canvas, true);

  var createScene = function() {

    // var products = [{
    //     id: "0000-0000",
    //     name: "foobar",
    //     width: 2.5,
    //     height: 8,
    //     position: {
    //         x: -31.75,
    //         y: -1,
    //         z: -20
    //     },
    //     tooltip: {
    //         position: {
    //             h: 1,
    //             v: 1
    //         },
    //         content: 'DESIGNER\nMadonna and Child Statue\n$29,999.99'
    //     }
    // }];
    // var productHitBoxes = {};

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    scene.zoomState = 1;
    scene.zoomSpeed = 0.05;
    scene.pause = true;
    scene.dragging = false;

    // Create camera
    // var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(config.target.x, config.target.y, config.target.z), scene);
    var camera = new BABYLON.ArcRotateCamera("Cam_Base", 0.01, 0, 0, new BABYLON.Vector3(config.target.x, config.target.y, config.target.z), scene);
    camera.setPosition(new BABYLON.Vector3.Zero());
    window.camera = camera;
    camera.fov = scene.zoomState;
    camera.lowerRadiusLimit = 0.02;
    camera.upperRadiusLimit = 0.01;
    camera.angularSensibilityX = 3000;
    camera.angularSensibilityY = 2000;
    camera.panningSensibility = 0;
    scene.activeCamera = camera;
    scene.activeCamera.attachControl(canvas, true);

    // Create meshes
    var dome = BABYLON.MeshBuilder.CreateSphere('Dome', {diameter: config.domeRadius * 2}, scene);
    dome.actionManager = new BABYLON.ActionManager(scene);
    dome.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function() {
      scene.pause = !scene.pause;
    }));
    dome.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnDoublePickTrigger, function() {
      scene.pause = !scene.pause;
      if (scene.zoomState == 1) {
        scene.zoomState = 0.3;
      } else {
        scene.zoomState = 1;
      }
    }));


    // Create 360 view
    var env_mat = new BABYLON.StandardMaterial("Mat_Dome", scene);
    var envtext = new BABYLON.Texture(config.background, scene);
    env_mat.diffuseTexture = envtext;
    env_mat.diffuseTexture.vScale = -1;
    env_mat.emissiveTexture = envtext;
    env_mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    env_mat.backFaceCulling = false;
    dome.material = env_mat;

    var dev_mat = new BABYLON.StandardMaterial("mat_dev", scene);
    var devtext = new BABYLON.Texture(config.devTexture, scene);
    dev_mat.diffuseTexture = devtext;
    dev_mat.diffuseTexture.vScale = -1;
    dev_mat.emissiveTexture = devtext;
    dev_mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    dev_mat.backFaceCulling = false;
    dev_mat.alpha = 0.55;

    var linkNames = Object.keys(config.links);

    for (var i = 0; i < linkNames.length; i++) {
      var curr = config.links[linkNames[i]];
      var mesh = BABYLON.MeshBuilder.CreateSphere(linkNames[i], {
        diameter: curr.diameter,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
      }, scene);
      mesh.actionManager = new BABYLON.ActionManager(scene);
      mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(e) {
        alert(config.links[e.source.name].content);
      }));
      mesh.material = dev_mat;
      // debugger;
      // mesh.position = new BABYLON.Vector3(50, 0, 50);
      mesh.position.x = config.domeRadius * Math.sin(curr.position.phi) * Math.cos(curr.position.theta);
      mesh.position.y = config.domeRadius * Math.sin(curr.position.phi) * Math.sin(curr.position.theta);
      mesh.position.z = config.domeRadius * Math.cos(curr.position.phi);
      window.sampleMesh = mesh;
    }
    return scene;
  };

  var scene = createScene();

  engine.runRenderLoop(function() {
    scene.activeCamera.alpha -= (0.0002 * scene.activeCamera.fov * scene.pause);
    if (scene.zoomState > scene.activeCamera.fov.toFixed(2)) {
      scene.activeCamera.fov += scene.zoomSpeed;
      scene.activeCamera.angularSensibilityX = (3000 / scene.activeCamera.fov);
      scene.activeCamera.angularSensibilityY = (2000 / scene.activeCamera.fov);
    } else if (scene.zoomState < scene.activeCamera.fov.toFixed(2)) {
      scene.activeCamera.fov -= scene.zoomSpeed;
      scene.activeCamera.angularSensibilityX = (3000 / scene.activeCamera.fov);
      scene.activeCamera.angularSensibilityY = (2000 / scene.activeCamera.fov);
    }
    scene.render();
  });

  // Resize
  window.addEventListener("resize", function() {
    engine.resize();
  });

  // Pinch
  var hammer = new Hammer(canvas, {
    domEvents: true
  });
  hammer.get('pinch').set({
    enable: true
  });
  hammer.on('pinch', function(e) {
    if (e.scale < 1.0) {
      scene.zoomState = 1;
    } else if (e.scale > 1.0) {
      scene.zoomState = 0.3;
    }
  })
}