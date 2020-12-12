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
    сhunks: {},
    finished: false,
    totalChunks: 0,
    decodedChunks: 0,
    scans: [],
  },
  mounted: function () {
    var self = this;
    self.chunks = {};
    self.decodedChunks = 0;
    self.totalChunks = 0;
    self.scanner = new Instascan.Scanner({
      video: document.getElementById("preview"),
      scanPeriod: 5,
    });
    self.scanner.addListener("scan", function (content) {
      if (self.finished) {
        return;
      }
      try {
        JSON.parse(content);
      } catch (e) {
        return;
      }
      chunk = JSON.parse(content);

      if (!("Index" in chunk && "Total" in chunk && "Data" in chunk)) {
        return;
      }

      if (!(chunk["Index"] in self.сhunks)) {
        self.chunks[chunk["Index"]] = chunk;
        self.decodedChunks = Object.keys(self.chunks).length;
        self.totalChunks = chunk["Total"];
      }

      if (self.decodedChunks === self.totalChunks) {
        self.finished = true;
        data = "";
        for (var i = 0; i < self.totalChunks; ++i) {
          data = data + window.atob(self.chunks[i]["Data"]);
        }
        b64Data = window.btoa(data);
        self.scans.unshift({ date: +Date.now(), content: data });
        //self.scans.unshift({ date: +(Date.now()), content: b64Data });
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
      return "Decoded: " + this.decodedChunks + "/" + this.totalChunks;
    },
    selectCamera: function (camera) {
      this.activeCameraId = camera.id;
      this.scanner.start(camera);
    },
    nextCode: function () {
      this.finished = false;
      this.chunks = [];
      this.decodedChunks = 0;
      this.totalChunks = 0;
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
