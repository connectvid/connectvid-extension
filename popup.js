let selectedVideoObject = {};
let liveImageUrl = "";

document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("loginContainer");
  const screenshotContainer = document.getElementById("screenshotContainer");
  const verifyBtn = document.getElementById("verifyBtn");
  const extensionIdInput = document.getElementById("extensionId");
  const emailInput = document.getElementById("email");
  const loginError = document.getElementById("loginError");
  const screenshotImage = document.getElementById("screenshotImage");
  const captureBtn = document.getElementById("captureBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  // const uploadBtn = document.getElementById("uploadBtn");
  const createVideoButton = document.getElementById("createVideoButton");
  const generateVideo = document.getElementById("generateVideo");
  const getVideo = document.getElementById("getVideo");
  let screenshotUrl = null;

  // Load previously saved extension ID and email
  const savedExtensionId = localStorage.getItem("extensionId");
  const savedEmail = localStorage.getItem("email");
  console.log({ extensionIdInput, emailInput, savedExtensionId, savedEmail });
  extensionIdInput.value = savedExtensionId || "";
  emailInput.value = savedEmail || "";

  verifyBtn.addEventListener("click", () => {
    const enteredExtensionId = extensionIdInput.value;
    const enteredEmail = emailInput.value;

    // Send a verification request to the server
    // fetch("https://your-server-url.com/verify", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ extensionId: enteredExtensionId, email: enteredEmail }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     if (data.success) {
    //       localStorage.setItem("extensionId", enteredExtensionId);
    //       localStorage.setItem("email", enteredEmail);

    //       loginContainer.style.display = "none";
    //       screenshotContainer.style.display = "block";

    //       document.getElementById("verifiedExtensionId").textContent = enteredExtensionId;
    //       document.getElementById("verifiedEmail").textContent = enteredEmail;
    //     } else {
    //       loginError.textContent = "Verification failed. Please check your credentials.";
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error verifying credentials:", error);
    //   });

    //start
    localStorage.setItem("extensionId", enteredExtensionId);
    localStorage.setItem("email", enteredEmail);

    loginContainer.style.display = "none";
    screenshotContainer.style.display = "block";

    // document.getElementById("verifiedExtensionId").textContent =
    //   enteredExtensionId;
    // document.getElementById("verifiedEmail").textContent = enteredEmail;
    //end
  });

  captureBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureScreenshot" });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "screenshotCaptured") {
      screenshotImage.src = message.screenshotUrl;
      screenshotUrl = message.screenshotUrl;

      fetch(screenshotUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1];

            const formData = new FormData();
            formData.append("key", "bf04e3e8b2b7f6b939cea1da1932ba11");
            formData.append("image", base64Data);

            fetch("https://api.imgbb.com/1/upload", {
              method: "POST",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("ImgBB Response:", data?.data?.url);
                liveImageUrl = data?.data?.url;
                downloadBtn.disabled = false;
                // uploadBtn.disabled = false;
                createVideoButton.disabled = false;
                screenshotImage.style.display = "block";
              })
              .catch((error) => {
                console.error("Error uploading to ImgBB:", error);
              });
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => {
          console.error("Error fetching image data:", error);
        });
    }
  });

  downloadBtn.addEventListener("click", () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = screenshotUrl;
    downloadLink.download = "screenshot.png";
    downloadLink.click();
  });

  // uploadBtn.addEventListener("click", () => {
  //   if (screenshotUrl) {
  //     fetch(screenshotUrl)
  //       .then((response) => response.blob())
  //       .then((blob) => {
  //         const reader = new FileReader();
  //         reader.onloadend = () => {
  //           const base64Data = reader.result.split(",")[1];

  //           const formData = new FormData();
  //           formData.append("key", "bf04e3e8b2b7f6b939cea1da1932ba11");
  //           formData.append("image", base64Data);

  //           fetch("https://api.imgbb.com/1/upload", {
  //             method: "POST",
  //             body: formData,
  //           })
  //             .then((response) => response.json())
  //             .then((data) => {
  //               console.log("ImgBB Response:", data);
  //             })
  //             .catch((error) => {
  //               console.error("Error uploading to ImgBB:", error);
  //             });
  //         };
  //         reader.readAsDataURL(blob);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching image data:", error);
  //       });
  //   }
  // });
  createVideoButton.addEventListener("click", () => {
    console.log("I am clicked!");
    document.getElementById("screenshotContainer").style.display = "none";
    document.getElementById("suggestVideoContainer").style.display = "block";
    // Execute the suggestVideo function when the content script is loaded
    suggestVideo();
  });
  generateVideo.addEventListener("click", () => {
    console.log("generateVideo clicked!");
    document.getElementById("suggestVideoContainer").style.display = "none";
    document.getElementById("inputDetails").style.display = "block";
  });

  getVideo.addEventListener("click", () => {
    console.log("generatedVideo clicked!");
    document.getElementById("generatedVideo").style.display = "block";
    console.log(
      {
        extension: localStorage.getItem("extensionId"),
        gmail: localStorage.getItem("email"),
      },
      "this is the extension id",
      selectedVideoObject
    );
  });
});

// Define the suggestVideo function
function suggestVideo() {
  const apiUrl =
    "http://localhost:5000/api/v1/extension/get-templates/tweetsydotio@gmail.com/647ed317a0e424a1f17a5508";
  const suggestedVideosDiv = document.getElementById("suggestedVideos");

  // Show loading state
  suggestedVideosDiv.innerHTML = "<p>Loading...</p>";

  // Fetch data from the API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      suggestedVideosDiv.innerHTML = ""; // Clear loading state

      if (data?.isSuccess && data?.data && data?.data?.length > 0) {
        data?.data?.forEach((videoObj) => {
          const videoContainer = document.createElement("div");
          videoContainer.style.display = "flex";
          videoContainer.style.alignItems = "center";
          videoContainer.style.margin = "10px";

          const video = document.createElement("video");
          video.src = videoObj.video;
          video.controls = true;
          video.style.width = "70%";

          const generateButton = document.createElement("button");
          generateButton.textContent = "Generate Video";
          generateButton.style.marginLeft = "10px";

          generateButton.addEventListener("click", () => {
            console.log(
              videoObj,
              liveImageUrl,
              localStorage.getItem("extensionId"),
              localStorage.getItem("email")
            );

            selectedVideoObject = videoObj;
            document.getElementById("suggestVideoContainer").style.display =
              "none";
            document.getElementById("inputDetails").style.display = "block";
          });

          videoContainer.appendChild(video);
          videoContainer.appendChild(generateButton);
          suggestedVideosDiv.appendChild(videoContainer);
        });
      } else {
        suggestedVideosDiv.textContent = "No videos found.";
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      suggestedVideosDiv.textContent = "An error occurred while fetching data.";
    });
}
