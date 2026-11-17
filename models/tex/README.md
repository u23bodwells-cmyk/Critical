# Texture pack slots (photo-scanned PBR textures)

The Critical Point sim makes its own textures when it loads. If you add a photo-scanned set here and list it in
`manifest.json`, the sim uses it in place of the generated one. Slots with no set keep the generated textures,
so nothing changes until you add files.

## Installed

CC0 sets from ambientCG: Asphalt031 (asphalt), Concrete034 (concrete), Concrete046 (floor), Snow006 (snow), Metal032 (steel), at 1024 px.

## Slots

| Slot       | Used for                                             |
|------------|------------------------------------------------------|
| `asphalt`  | roads, the apron and the car park                    |
| `concrete` | cast-concrete walls of the outbuildings              |
| `floor`    | painted concrete floors inside the outbuildings     |
| `snow`     | the snow layer over the yard                         |
| `steel`    | galvanised steel (masts, frames, gantries)           |

## manifest.json

```json
{
  "sets": {
    "asphalt": {
      "albedo": "asphalt_albedo.jpg",
      "normal": "asphalt_normal.jpg",
      "rough": "asphalt_rough.jpg",
      "ao": "asphalt_ao.jpg",
      "scale": 1,
      "tint": 1,
      "roughness": 1
    }
  }
}
```

- `albedo` is read as sRGB colour. `normal` is an OpenGL-style normal map (green up). `rough` and `ao` are greyscale.
- Every map is optional, so a set can be only a normal map.
- `scale` multiplies how often the texture repeats on top of what the material already uses.
- `tint` is a brightness multiplier on the albedo. With `"keepColor": true` the material keeps its own colour and `tint` scales it; otherwise the colour is replaced by `tint`. `roughness` scales the roughness map.
- Keep each file to 2048 × 2048 or smaller (1024 is plenty for most). Use JPEG for albedo, normal, roughness and AO.
- CC0 sources such as ambientCG and Poly Haven work well. Their "1K-JPG" downloads already have the right maps.

The loader lives in `plant.js` (`TEXPACK`). It runs on every graphics setting, including Lite.
