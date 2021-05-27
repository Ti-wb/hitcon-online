// Copyright 2021 HITCON Online Contributors
// SPDX-License-Identifier: BSD-2-Clause

/**
 * Manages the graphic assets for a map. This will tell which part of which
 * image file represents which value in a layer of the map.
 */
class GraphicAsset {
  /**
   * Construct an empty graphic asset manager.
   * @constructor
   * @param {Object} assetConfig - The JSON object represeting the asset
   * config. It's format is at the end of this file.
   */
  constructor(assetConfig) {
    this.asset_manager = assetConfig;
    if (!this.asset_manager) {
      throw 'No asset config supplied for new GraphicAsset()';
    }
    this.images_arr = [];
  }

  /**
   * Load the assets specified in the asset config.
   * This should only be called when we are running in a browser.
   * @return {Boolean} success - Return true if all assets are loaded.
   */
  async loadAssets() {
    const arr_promise = [];
    const this_ = this;
    for (const img of this.asset_manager.images) {
      arr_promise.push(new Promise((resolve, reject) => {
        const image = new Image();
        this_.images_arr.push(image);
        image.onload = resolve;
        image.onerror = () => {
          reject(`error on loading ${img.url}`);
        };
        image.src = img.url;
      }));
    }

    let success = true;
    await Promise.all(arr_promise).catch((err_msg) => {
      console.error(err_msg);
      success = false;
    });
    return success;
  }

  /**
   * Return the HTMLImageElement for the name of the image.
   * @param {String} getname - The name of the image in the asset config.
   * @return {HTMLImageElement} element - The image
   */
  getImage(getname) {
    for (let i = 0; i < this.asset_manager.images.length; i++) {
      if (this.asset_manager.images[i].name == getname) {
        return this.images_arr[i];
      }
    }
    return undefined;
  }

  /**
   * Return the information for a particular tile.
   * @param {String} layer - The raw layer designation.
   * @param {String} tile - The tile as specified by the map's cell.
   * @return {Object} info - An object denoting the image information. It
   * should contain:
   * - image: The HTMLImageElement for the image from which to render the tile.
   *   If we are not running on the browser or GraphicAsset.loadAssets() is not
   *   called. This field may be absent.
   * - imageRef: The name of the image in the asset config.
   * - srcX: The source X coordinate in the image above.
   * - srcY: The source Y coordinate in the image above.
   * - srcWidth: The width of the tile.
   * - srcHeight: The height of the tile.
   */
  getTile(layer, tile) {
    const info = {};
    info.imageRef = this.asset_manager.layerMap[layer][tile][0];
    info.image = this.getImage(info.imageRef);
    for (const img of this.asset_manager.images) {
      if (img.name === info.imageRef) {
        info.srcWidth = img.gridWidth;
        info.srcHeight = img.gridHeight;
      }
    }
    info.srcX = this.asset_manager.layerMap[layer][tile][1] * info.srcWidth;
    info.srcY = this.asset_manager.layerMap[layer][tile][2] * info.srcHeight;
    return info;
  }

  /**
   * Return drawing information for a particular character.
   * @param {String} char - The character's name.
   * @param {String} facing - The direction the character is facing.
   * @return {Object} info - See the info parameter in getTile.
   */
  getCharacter(char, facing) {
    console.error('Not implemented');
    return undefined;
  }
}

export default GraphicAsset;

/*
Sample format for the asset config:
{
  "images":[
    {
      "name":"base",
      "url":"/static/base.png",
      "gridWidth":16,
      "gridHeight":16
    },
    {
      "name":"object",
      "url":"/static/object.png",
      "gridWidth":16,
      "gridHeight":16
    },
    {
      "name":"characters",
      "url":"/static/characters.png",
      "gridWidth":16,
      "gridHeight":16
    }
  ],
  "layerMap":{
    "ground":{
      "ground1":[
        "base",
        3,
        0
      ],
      "ground2":[
        "base",
        2,
        5
      ]
    },
    "object":{
      "bar0":[
        "object",
        1,
        4
      ],
      "bar1":[
        "object",
        3,
        0
      ]
    }
  },
  "characters":{
    "char1":{
      "L":[
        "characters",
        2,
        0
      ],
      "R":[
        "characters",
        2,
        1
      ],
      "U":[
        "characters",
        2,
        2
      ],
      "D":[
        "characters",
        2,
        3
      ]
    },
    "char2":{
      "L":[
        "characters",
        2,
        0
      ],
      "R":[
        "characters",
        2,
        1
      ],
      "U":[
        "characters",
        2,
        2
      ],
      "D":[
        "characters",
        2,
        3
      ]
    }
  }
}

Fields:
- images: List the images and their grid size.
- layerMap: Maps each value in each layer to the corresponding tile
            (image+coordinates)
- characters: Maps each characters facing direction to the corresponding tile.
*/
