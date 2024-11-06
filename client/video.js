const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

let mediaRecorder;
let stream;
let video;
startElem.addEventListener("click", async (e) => {
    console.log(await navigator.mediaDevices.enumerateDevices())
  stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
        displaySurface: "screen", // This ensures only the browser tab is shared
      },
      audio: false // Set
  });


  const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
    ? "video/webm; codecs=vp9"
    : "video/webm";

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: mime,
  });

  let chunks = [];

  mediaRecorder.addEventListener("dataavailable", (e) => {
    chunks.push(e.data);
  });

  mediaRecorder.addEventListener("stop", (e) => {
    let blob = new Blob(chunks, {
       type: chunks[0].type,
      //type: "video/webm" 
    });

    videoElem.src = blob;
    const a = document.createElement("a");
    a.href =  URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
    a.download = "screen-recording.mp4";
    a.click();

  });

  mediaRecorder.start();
});

stopElem.addEventListener("click", (e) => {
  mediaRecorder.stop();
  
});
