// ch2-mountain.js: buffer scenes around the ping-pong station (doc/gameplay.md, doc/zones/03): the crew
// walks up the mountain before the fight and down the other side after it, instead of just appearing.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

function mountainPath(L, up) {
  const slope = up ? 0.16 : -0.16;   // the path climbs (or drops) from left to right
  const gy = (x, z) => x * slope + 0.1 * Math.sin(x * 1.3 + z * 0.8) + (z < -1.2 ? (-1.2 - z) * 0.7 : 0);
  L.groundY = gy;
  put(L, new THREE.SphereGeometry(90, 12, 8), mat({ map: T.sky, em: 1, fog: 0, side: THREE.BackSide }));
  const ground = floorG(34, 18, 34, 18), gp = ground.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, gy(gp.getX(i), gp.getZ(i)));
  ground.computeVertexNormals();
  put(L, ground, mat({ map: T.grass, rep: [14, 8] }));
  const path = floorG(34, 2.2, 34, 2), pp = path.attributes.position;   // the dirt path
  for (let i = 0; i < pp.count; i++) pp.setY(i, gy(pp.getX(i), pp.getZ(i) + 1.3) + 0.03);
  path.computeVertexNormals();
  put(L, path, mat({ color: 0xb89c78 }), 0, 0, 1.3);
  const rockM = mat({ color: 0x8a8090 }), pineM = mat({ color: 0x2a4a2a }), trunkM = mat({ color: 0x4a3222 });
  [[-5, -2.4, 0.8], [-1.5, -3.2, 1.1], [2.8, -2.6, 0.7], [5.6, -3.4, 1.0], [-3.2, 3.4, 0.4], [4.2, 3.2, 0.5], [0.8, -1.6, 0.35]].forEach(([x, z, r]) => {
    const m = put(L, new THREE.DodecahedronGeometry(r, 0), rockM, x, gy(x, z) + r * 0.4, z); m.rotation.set(rnd() * 3, rnd() * 3, 0);
  });
  [[-6.5, -3.5, 1.1], [-3.8, -4.5, 1.4], [0.6, -4.2, 1.2], [3.6, -4.8, 1.5], [6.8, -3.8, 1.2], [-7.4, 3.6, 0.9]].forEach(([x, z, s]) => {
    put(L, new THREE.CylinderGeometry(0.15 * s, 0.22 * s, 1.6 * s, 6), trunkM, x, gy(x, z) + 0.8 * s, z);
    put(L, new THREE.ConeGeometry(0.9 * s, 2.4 * s, 7), pineM, x, gy(x, z) + 2.6 * s, z);
  });
  // the mountain itself, far behind
  put(L, new THREE.ConeGeometry(16, 14, 7), mat({ color: 0x6a6070 }), up ? 10 : -12, 0, -30);
  put(L, new THREE.ConeGeometry(4.2, 3.2, 7), mat({ color: 0xf0f0f4 }), up ? 10 : -12, 5.6, -30);
  const marker = (x, name, go) => {
    const g = group(L, x, gy(x, 1.0), 1.0, 0, { name, exit: true, go, stand: [x * 0.9, 1.3] });
    put(L, boxG(0.14, 1.7, 0.14), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, g);
    return g;
  };
  return { gy, marker };
}

LV.mountainUp = () => {
  const L = newLevel("mountainUp", "Up the Mountain");
  const { gy, marker } = mountainPath(L, true);
  marker(-7.4, "Path back to the beach", "beach");
  marker(7.4, "Path up to the ping-pong station", "pingpong");
  group(L, -1.5, gy(-1.5, -3.2), -3.2, 0, { name: "Big rock", say: [["", "A big mountain rock. The path keeps going up and up."]] });
  crew(L, -6.2, 1.4);
  L.walk = [-6.8, 6.8, 0.3, 2.4];
  L.start = [-6.2, 1.4]; L.entries = { beach: [-6.2, 1.4], pingpong: [6.2, 1.4] };
  L.onEnter = [["", "The crew hikes up the steep, rocky mountain path."], ["", "From somewhere up ahead comes a strange sound... tok... tok... tok..."]];
  L.light = { amb: 0x9a9aa8, dir: [0.3, -1, -0.4], dirCol: 0x707070, pts: [[[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0xa8c8f0, 20, 60]; L.bg = 0xa8c8f0;
  cam(L, [0, 4.0, 10.5], [0, 1.0, 0], 52);
  return L;
};

LV.mountainDown = () => {
  const L = newLevel("mountainDown", "Down the Mountain");
  const { gy, marker } = mountainPath(L, false);
  marker(-7.4, "Path back up to the ping-pong station", "pingpong");
  marker(7.4, "Road down to the gas station", "gas");
  // far below: the little gas station by the road
  const gas = group(L, 12, gy(12, -6) - 2.5, -6, 0, { name: "The gas station, far below", say: [["", "Way down below, there's a little gas station by the road."]] });
  put(L, boxG(1.6, 0.9, 1.0), mat({ color: 0xc82020 }), 0, 0, 0, 0, null, gas);
  put(L, boxG(2.0, 0.12, 1.4), mat({ color: 0xf0e8d0 }), 0, 1.2, 0, 0, null, gas);
  crew(L, -6.2, 1.4);
  L.walk = [-6.8, 6.8, 0.3, 2.4];
  L.start = [-6.2, 1.4]; L.entries = { pingpong: [-6.2, 1.4], gas: [6.2, 1.4] };
  L.onEnter = [["", "The crew hurries down the other side of the mountain, away from the ping-pong station."], ["", "Far below, there's a gas station by the road."]];
  L.light = { amb: 0x9a9aa8, dir: [0.3, -1, -0.4], dirCol: 0x707070, pts: [[[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0xa8c8f0, 20, 60]; L.bg = 0xa8c8f0;
  cam(L, [0, 4.0, 10.5], [0, 1.0, 0], 52);
  return L;
};
