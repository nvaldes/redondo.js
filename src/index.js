import BABYLON from 'babylonjs';
import Hammer from 'hammerjs';

window.redondo = function(config) {
    var canvas = document.querySelector(config.selector);
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {

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
        var camera = new BABYLON.ArcRotateCamera("Cam_Base", 0.01, 0, 0, new BABYLON.Vector3(0.01, 0, 0), scene);
        camera.setPosition(new BABYLON.Vector3.Zero());
        camera.fov = 1;
        camera.lowerRadiusLimit = 0.02;
        camera.upperRadiusLimit = 0.01;
        camera.angularSensibilityX = 3000;
        camera.angularSensibilityY = 2000;
        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas, true);

        // Create meshes
        var dome = BABYLON.Mesh.CreateSphere('Dome', 64, 2000, scene);
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
        env_mat.emissiveColor = new BABYLON.Color3(1,1,1);
        env_mat.backFaceCulling = false;
        dome.material = env_mat;

        var dev_mat = new BABYLON.StandardMaterial("mat_dev", scene);
        var devtext = new BABYLON.Texture(config.devTexture, scene);
        dev_mat.diffuseTexture = devtext;
        dev_mat.diffuseTexture.vScale = -1;
        dev_mat.emissiveTexture = devtext;
        dev_mat.emissiveColor = new BABYLON.Color3(1,1,1);
        dev_mat.backFaceCulling = false;
        dev_mat.alpha = 0.55;

        if (config.links && config.links.length > 0) {
          for (var i = 0; i < products.length; i++) {
              var curr = {
                  mesh: BABYLON.MeshBuilder.CreatePlane(products[i].id, {
                      width: products[i].width,
                      height: products[i].height,
                      sideOrientation: BABYLON.Mesh.DOUBLESIDE
                  }, scene)
              };
              curr.mesh.material = dev_mat;
              var dv = camera.position.subtract(new BABYLON.Vector3(products[i].position.x, products[i].position.y, products[i].position.z))
              curr.mesh.rotation.y = (-1 * Math.atan2(dv.x, dv.z)) - (Math.PI / 3);
              curr.mesh.position.x = products[i].position.x;
              curr.mesh.position.y = products[i].position.y;
              curr.mesh.position.z = products[i].position.z;
          }
        }
        return scene;
    };
    
    var scene = createScene();

    engine.runRenderLoop(function () {
        scene.activeCamera.alpha -= (0.0005 * scene.activeCamera.fov * scene.pause);
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
    window.addEventListener("resize", function () {
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