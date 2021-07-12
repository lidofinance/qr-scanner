const Accordion = Vue.component("accordion", {
  template: `
    <div class="qr-item" @click="hideItem" :class="{'is-hidden': hidden}">
        <slot></slot>
    </div>
  `,
  data() {
    return {
      hidden: false,
    };
  },
  methods: {
    hideItem() {
      this.hidden = !this.hidden;
    },
  },
});

var app = new Vue({
  el: "#app",
  data: {
    scanner: null,
    activeCameraId: null,
    cameras: [],
    chunks: {},
    rawChunks: '',
    finished: false,
    chunksTotalLabel: 0,
    decodedChunks: 0,
    scans: [],
  },
  mounted: function () {
    const chunkHeaderSize = 8;
    let self = this;
    self.chunks = {};
    self.chunksTotalLabel = 0;
    self.decodedChunks = 0;
    self.chunksLength = 0;
    self.scanner = new Instascan.Scanner({
      video: document.getElementById("preview"),
      scanPeriod: 5,
    });
    self.scanner.addListener("scan", function (content) {
      if (self.finished) {
        return;
      }

      try {
        let chunkRaw = content.split('').map(function (x) {
          return x.charCodeAt(0);
        });

        let binData = new Uint8Array(chunkRaw);

        if (binData.length <= chunkHeaderSize) {
          return;
        }

        let chunkIndex = binData[1]<<8 | binData[0];
        let chunksTotal = binData[3]<<8 | binData[2];

        if (chunksTotal < 0 || chunkIndex >= chunksTotal) {
          console.log("Cannot decode chunk header")
          return;
        }

        if (!self.chunksTotalLabel) {
          self.chunksTotalLabel = chunksTotal;
        }

        let chunkLength = binData[7] << 8 | binData[6];
        let chunk = {
          start: binData[5] << 8 | binData[4],
          data: binData.slice(chunkHeaderSize, chunkHeaderSize + chunkLength)
        }

        if (chunk.start < 0 || chunkLength < 0 || chunk.data.length !== chunkLength) {
          console.log("Cannot decode chunk body")
          return;
        }

        if (!self.chunks[chunkIndex]) {

          self.chunks[chunkIndex] = chunk;
          self.decodedChunks = Object.keys(self.chunks).length;
          self.chunksLength += chunkLength;
        }

        if (self.decodedChunks === chunksTotal) {
          self.finished = true;

          let compressedData = new Uint8Array(self.chunksLength);

          for (let index in self.chunks) {
            console.log("write " + self.chunks[index].data.length +  "   offset " + self.chunks[index].start);
            compressedData.set(self.chunks[index].data, self.chunks[index].start);
          }

          let uncompressedData = pako.ungzip(compressedData, {to: "string"});
          self.scans.unshift({date: +(Date.now()), content: uncompressedData});
        }
      } catch (e) {
        console.log(e)
        return;
      }
    });
    Instascan.Camera.getCameras()
      .then(function (cameras) {
        self.cameras = cameras;
        if (cameras.length > 0) {
          self.activeCameraId = cameras[0].id;
          self.scanner.start(cameras[0]);
        } else {
          console.error("No cameras found.");
        }
      })
      .catch(function (e) {
        console.error(e);
      });
  },
  methods: {
    formatName: function (name) {
      return name || "(unknown)";
    },
    trimContent: function (content) {
      return content.substring(0, 24) + "...";
    },
    currentScanStats: function () {
      return "Decoded: " + this.decodedChunks + "/" + this.chunksTotalLabel;
    },
    selectCamera: function (camera) {
      this.activeCameraId = camera.id;
      this.scanner.start(camera);
    },
    nextCode: function () {
      this.finished = false;
      this.chunks = [];
      this.decodedChunks = 0;
      this.chunksTotalLabel = 0;
    },
    download: function (content) {
      let filename = "message.json";
      let json_content = JSON.parse(content);
      if (json_content["DKGIdentifier"])  {
        filename = "request.json";
        if (json_content["ResultMsgs"]) {
          filename = "response.json";
        }
      }
      var a = document.createElement("a");
      var file = new Blob([content], { type: "text/plain" });
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.click();
    },
    copy: function (content) {
      navigator.clipboard.writeText(content);
    },
  },
});
