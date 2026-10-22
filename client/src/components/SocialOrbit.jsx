import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PALETTE = [
  "#ff7058",
  "#55d6be",
  "#ffc857",
  "#6c8cff",
  "#f59bc7",
  "#9b8cff",
  "#6ee7b7",
];

export default function SocialOrbit({ people, onSelect }) {
  const mountRef = useRef(null);
  const selectedRef = useRef(null);
  const peopleRef = useRef(people);
  const onSelectRef = useRef(onSelect);

  peopleRef.current = people;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#111a2b", 18, 42);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.5, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#111a2b", 1);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 18;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    scene.add(new THREE.AmbientLight("#dce9ff", 1.8));
    const keyLight = new THREE.PointLight("#55d6be", 24, 30);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);
    const warmLight = new THREE.PointLight("#ff7058", 18, 24);
    warmLight.position.set(-5, -2, 4);
    scene.add(warmLight);

    const constellation = new THREE.Group();
    scene.add(constellation);
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 2),
      new THREE.MeshStandardMaterial({
        color: "#f7f4ed",
        emissive: "#ff7058",
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.2,
      }),
    );
    constellation.add(core);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: "#55d6be",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    [2.4, 3.5, 4.55].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.012, 8, 96),
        ringMaterial.clone(),
      );
      ring.rotation.x = Math.PI / 2 + index * 0.18;
      ring.rotation.z = index * 0.4;
      constellation.add(ring);
    });

    const nodeGroup = new THREE.Group();
    constellation.add(nodeGroup);
    const nodeMeshes = [];

    const rebuild = () => {
      nodeGroup.clear();
      nodeMeshes.length = 0;
      const members = peopleRef.current.length
        ? peopleRef.current
        : [{ _id: "you", username: "you", name: "Your network" }];
      members.slice(0, 16).forEach((person, index) => {
        const angle = (index / members.length) * Math.PI * 2 + 0.3;
        const radius = 2.5 + (index % 3) * 0.9;
        const y = Math.sin(index * 1.8) * 1.7;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(index % 4 === 0 ? 0.28 : 0.2, 20, 20),
          new THREE.MeshStandardMaterial({
            color: PALETTE[index % PALETTE.length],
            emissive: PALETTE[index % PALETTE.length],
            emissiveIntensity: 0.3,
            roughness: 0.3,
          }),
        );
        mesh.position.set(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius,
        );
        mesh.userData.person = person;
        nodeGroup.add(mesh);
        nodeMeshes.push(mesh);

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          mesh.position.clone(),
        ]);
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: PALETTE[index % PALETTE.length],
            transparent: true,
            opacity: 0.28,
          }),
        );
        nodeGroup.add(line);
      });
    };
    rebuild();

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(240 * 3);
    for (let i = 0; i < starPositions.length; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = (Math.random() - 0.5) * 24;
      starPositions[i + 2] = (Math.random() - 0.5) * 24 - 4;
    }
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    scene.add(
      new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
          color: "#b9c9e9",
          size: 0.035,
          transparent: true,
          opacity: 0.7,
        }),
      ),
    );

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const updatePointer = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };
    const handleMove = (event) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(nodeMeshes)[0];
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
    };
    const handleClick = (event) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(nodeMeshes)[0];
      if (hit) onSelectRef.current(hit.object.userData.person);
    };
    renderer.domElement.addEventListener("pointermove", handleMove);
    renderer.domElement.addEventListener("click", handleClick);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      core.rotation.x += 0.002;
      core.rotation.y += 0.004;
      constellation.rotation.y += 0.0008;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointermove", handleMove);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    selectedRef.current = people;
  }, [people]);

  return (
    <div
      className="orbit-canvas"
      ref={mountRef}
      aria-label="Interactive social network orbit"
      role="img"
    />
  );
}
