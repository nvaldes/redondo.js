import 'handjs';
import BABYLON from 'babylonjs';
import Hammer from 'hammerjs';

class C21LoadingScreen {
  //init the loader
  constructor(text) {
    this.loadingUIText = text;
  }
  displayLoadingUI() {
    if (document.getElementById('redondo_loading') !== null) {
      return;
    }
    var loading = document.createElement('div');
    loading.id = 'redondo_loading';
    var icon = document.createElement('img');
    icon.id = 'redondo_icon';
    icon.src = 'https://c21stores-weblinc.netdna-ssl.com/media/W1siZiIsIjIwMTcvMTAvMDUvMTMvMDIvNDgvMzcvMzYwX2ljb25fMl8ucG5nIl1d/360_icon%5B2%5D.png?sha=c263947ff57ef86a';
    var progress = document.createElement('img');
    progress.id = 'redondo_loading-progress';
    progress.src = 'https://c21stores-weblinc.netdna-ssl.com/media/W1siZiIsIjIwMTcvMTAvMjcvMTAvNTEvMzgvODk3L0VjbGlwc2UuZ2lmIl1d/Eclipse.gif?sha=7e3884a0c719f01d';
    loading.appendChild(progress);
    var dest = document.getElementById('heroCanvasZone')
    dest.appendChild(loading);
    dest.appendChild(icon);
  }
  hideLoadingUI() {
    var loading = document.getElementById('redondo_loading');
    var icon = document.getElementById('redondo_icon');
    icon.style.top = '6px';
    icon.style.right = '6px';
    icon.style.width = '74px';
    icon.style.opacity = '0.7';
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.remove();
    }, 1000);
  }
}

window.redondo = function(config) {
  window.redondo.killAllCards = function() {
    document.querySelectorAll('.jm-360-outcards').forEach(function(e) {
      e.remove();
    });
  }
  window.redondo.config = config;
  var canvas = document.querySelector(config.selector);
  var engine = new BABYLON.Engine(canvas, true, { stencil: true });

  var createScene = function() {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    window.redondo.scene = scene;
    scene.zoomState = 1;
    scene.zoomSpeed = 0.05;
    scene.pause = true;
    scene.dragging = false;


    // Create Assets Manager
    var assetsManager = new BABYLON.AssetsManager(scene);

    if (window.innerWidth < 1050) {
      assetsManager.useDefaultLoadingScreen = false;
    } else {
      engine.loadingScreen = new C21LoadingScreen('Loading...');
    }

    // Create camera
    // var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(config.target.x, config.target.y, config.target.z), scene);
    var camera = new BABYLON.ArcRotateCamera("Cam_Base", 0.01, 0, 0, new BABYLON.Vector3(config.target.x, config.target.y, config.target.z), scene);
    camera.setPosition(new BABYLON.Vector3.Zero());
    window.camera = camera;
    camera.fov = scene.zoomState;
    camera.lowerRadiusLimit = 0.02;
    camera.upperRadiusLimit = 0.01;
    camera.angularSensibilityX = config.sensitivityX;
    camera.angularSensibilityY = config.sensitivityY;
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
    env_mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    env_mat.backFaceCulling = false;
    dome.material = env_mat;
    var env_texture = assetsManager.addTextureTask("image task", config.background);
    env_texture.onSuccess = function(task) {
      env_mat.diffuseTexture = task.texture;
      env_mat.diffuseTexture.vScale = -1;
      env_mat.emissiveTexture = task.texture;
    }

    // var dev_texture = null;
    // if (config.devTexture) {
    //   var dev_texture = assetsManager.addTextureTask("image task", config.devTexture);
    //   dev_texture.onSuccess = function(task) {
    //     dev_texture = task.texture;
    //   }
    // }
    var glow = [];
    for (var i = 0; i < config.halos.length; i++) {
      var curr = new BABYLON.HighlightLayer('glow' + i, scene, config.halos[i].options);
      curr.innerGlow = config.halos[i].innerGlow;
      curr.outerGlow = config.halos[i].outerGlow;
      glow.push({
        glow: curr,
        color: config.halos[i].color
      });
    }
    var alpha = 0;
    scene.registerBeforeRender(() => {
        alpha += config.twinkleSpeed;
        if (alpha > (Math.PI)) {
          alpha -= Math.PI
        }
        glow.forEach((e) => {
          e.glow.blurHorizontalSize = Math.sin(alpha) * config.glowSize;
          e.glow.blurVerticalSize = Math.sin(alpha) * config.glowSize;
        });
    });

    var linkNames = Object.keys(config.links);
    window.meshes = [];
    for (var i = 0; i < linkNames.length; i++) {
      var curr = config.links[linkNames[i]];
      var mesh = BABYLON.MeshBuilder.CreateSphere(linkNames[i], {
        diameter: curr.diameter,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
      }, scene);
      mesh.actionManager = new BABYLON.ActionManager(scene);
      mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(e) {
        scene.pause = false;
        window.redondo.killAllCards();
        var card = document.createElement('div');
        card.className = 'jm-360-outcards';
        card.id = 'card_' + e.source.name;
        card.innerHTML = config.links[e.source.name].content;
        card.style.top = e.pointerY + 'px';
        card.style.left = e.pointerX + 'px';
        var close = document.createElement('a');
        close.href = '#'
        close.className = 'jm-360-info-card-close';
        close.innerHTML = '&times;'
        close.addEventListener('click', function(e) {
          e.preventDefault();
          e.target.parentNode.remove();
          window.redondo.scene.pause = !window.redondo.scene.pause;
        });
        card.appendChild(close);
        canvas.parentNode.appendChild(card);
      }));
      mesh.material = new BABYLON.StandardMaterial("mat_dev", scene);
      mesh.material.emissiveColor = new BABYLON.Color3.White();
      mesh.material.alpha = curr.alpha;
      // debugger;
      // mesh.position = new BABYLON.Vector3(50, 0, 50);
      mesh.position.x = (config.domeRadius - curr.diameter) * Math.sin(curr.position.phi) * Math.cos(curr.position.theta);
      mesh.position.y = (config.domeRadius - curr.diameter) * Math.cos(curr.position.phi);
      mesh.position.z = (config.domeRadius - curr.diameter) * Math.sin(curr.position.phi) * Math.sin(curr.position.theta);
      if (curr.alpha > 0) {
        glow.forEach((e) => {
          e.glow.addMesh(mesh, BABYLON.Color3.White());
        });
      }
      window.meshes.push(mesh);

      assetsManager.load();
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

  // KillAllCards on touchstart/mousedown
  canvas.addEventListener('touchstart', window.redondo.killAllCards);
  canvas.addEventListener('mousedown', window.redondo.killAllCards);

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