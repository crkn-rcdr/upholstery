const db = require("./testdb");

module.exports = {
  manifest: id => {
    if (id === undefined) {
      throw new Error("id argument required.");
    }
    let manifest = db[id];
    if (manifest === undefined) {
      throw new Error(`Manifest ${id} not found.`);
    }

    manifest.canvases.forEach(canvas =>
      Object.assign(canvas, { master: db[canvas.id].master })
    );

    return manifest;
  }
};
