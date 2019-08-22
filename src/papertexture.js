function createPaperCard(texture) {
  texture.paperTexture = { onload: null };
  texture.onload = function() {
    let scalingFactor = 8;
    let paperColor = { r: 221 / 255, g: 217 / 255, b: 195 / 255, a: 1 };
    let filterSize = 2;
    let stepRadius = 0.05;
    let stepLimit = 0.5;
    let vertexSize = 4; // in terms of smallData pixels
    let imageData = new ImageData(
      texture.texture.data.width * scalingFactor,
      texture.texture.data.width * scalingFactor
    );
    let smallData = new ImageData(
      texture.texture.data.width,
      texture.texture.data.width
    );
    let imageData2 = new ImageData(
      texture.texture.data.width * scalingFactor,
      texture.texture.data.width * scalingFactor
    );
    filterImage(
      texture.texture.data,
      0,
      0,
      smallData,
      0,
      0,
      smallData.width,
      smallData.height,
      filterSize,
      getGaussFilter(3 / filterSize)
    );
    foreachPixel(imageData, 0, 0, imageData.width, imageData.height, (x, y) => {
      let p = getPixel(
        texture.texture.data,
        Math.floor(x / scalingFactor),
        Math.floor(y / scalingFactor)
      );
      //   return p;
      if (p.a > 0) return { a: 1, r: 1, g: 1, b: 1 };
      else return { a: 0, r: 1, g: 1, b: 1 };
    });
    filterImage(
      imageData,
      0,
      0,
      imageData2,
      0,
      0,
      imageData2.width,
      imageData2.height,
      scalingFactor,
      getGaussFilter((3 * scalingFactor) / filterSize),
      (x, y) => {
        let p = getPixel(
          smallData,
          Math.floor(x / scalingFactor),
          Math.floor(y / scalingFactor)
        );
        return p.a > 0 && p.a < 1;
      }
    );
    foreachPixel(imageData, 0, 0, imageData.width, imageData.height, (x, y) => {
      let p = getPixel(
        texture.texture.data,
        Math.floor(x / scalingFactor),
        Math.floor(y / scalingFactor)
      );
      p = lerpColor(paperColor, p, p.a);
      let a = getPixel(imageData2, x, y).a;
      p.a = softStep(a, stepLimit - stepRadius, stepLimit + stepRadius);
      return p;
    });
    let vertices = [];
    let faces = [];
    let maxSize = Math.max(smallData.width, smallData.height);
    for (let i = 0; i <= smallData.width; i += vertexSize) {
      for (let j = 0; j <= smallData.height; j += vertexSize) {
        let ind3 = vertices.length;
        let ind1 = ind3 - smallData.width / vertexSize;
        vertices.push(
          new Vertex(
            new vec3(
              (i - smallData.width / 2) / maxSize,
              (j - smallData.height / 2) / maxSize
            ),
            new vec3(i / smallData.width, j / smallData.height)
          )
        );
        if (i > 0 && j > 0) {
          let enabled = false;
          for (let subI = 0; subI < vertexSize; ++subI)
            for (let subJ = 0; subJ < vertexSize; ++subJ)
              if (getPixel(smallData, i + subI, j + subJ).a > 0) {
                vertices[ind3].enabled = true;
                vertices[ind3 - 1].enabled = true;
                vertices[ind1].enabled = true;
                vertices[ind1 - 1].enabled = true;
                enabled = true;
                // CAN_BE_REMOVED
                break;
              }
          if (enabled) {
            faces.push(new Face(ind1 - 1, ind1, ind3 - 1));
            faces.push(new Face(ind3, ind1, ind3 - 1));
          }
        }
      }
    }

    this.mesh = new Mesh(vertices, faces);
    let retData = imageData;
    // let retData = smallData;
    texture.paperTexture.texture = extractTexture(retData, {
      x: 0,
      y: 0,
      w: retData.width,
      h: retData.height
    });
    if (texture.paperTexture.onload) texture.paperTexture.onload();
  };
}
