# People and vehicle models (optional glTF pack)

The yard walkers and the site van are built in code. If you add `.glb` models here and list them in
`manifest.json`, the sim swaps them in. The built-in walkers keep their routes and movement, and the model rides
along in their place, playing its walk animation. With an empty manifest (`{}`), nothing changes.

```json
{
  "worker": { "file": "worker.glb", "walk": "Walk", "scale": 1 },
  "van":    { "file": "van.glb", "scale": 1, "rotY": 0 }
}
```

- `worker`: a rigged person about 1.75 m tall, standing on the origin and facing +Z. `walk` is the name of the
  walk-cycle animation clip. If no clip has that name, the first clip plays.
- `van`: a vehicle model, origin at ground level in the middle. Use `rotY` (radians) if it faces the wrong way.
  The built-in van faces +X.
- Keep each file under about 3 MB. CC0 sources: Quaternius (animated characters, vehicles) and Kenney (vehicles).

The loader lives in `plant.js` (`MODELPACK`). It loads `vendor/GLTFLoader.js` only if the manifest lists something.
