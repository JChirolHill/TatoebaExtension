const constraints = { audio: true };
navigator.mediaDevices
    .getUserMedia(constraints)
    .then(() => {
        let chunks = [];

        const btnRows = document.querySelectorAll(`.sentence > [layout="row"]`);

        const originalBtnScale = 0.55;
        const biggerBtnScale = 1;

        // Add the record buttons to each sentence
        btnRows.forEach((btnRow) => {
            const nativeSpeakerAudioBtn = btnRow.querySelector(
                "audio-button .md-icon-button"
            );

            // Double check if audio available for this sentence
            const sentenceHasAudio =
                !nativeSpeakerAudioBtn.ariaLabel.includes("No audio");

            const recordBtn = document.createElement("button");
            recordBtn.classList.add("md-icon-button");
            recordBtn.classList.add("md-button");
            recordBtn.classList.add("md-ink-ripple");
            recordBtn.style.backgroundColor = "red";
            recordBtn.style.borderRadius = "50%";
            recordBtn.style.transition = "all 0.75s";
            recordBtn.style.scale = originalBtnScale;
            let isRecordBtnScaled = false;
            let recordBtnAnimation = null;

            if (navigator.mediaDevices) {
                navigator.mediaDevices
                    .getUserMedia(constraints)
                    .then((stream) => {
                        // Prepare media recorder
                        const mediaRecorder = new MediaRecorder(stream);
                        recordBtn.onmousedown = () => {
                            mediaRecorder.start();

                            recordBtn.style.scale = biggerBtnScale;
                            isRecordBtnScaled = true;

                            recordBtnAnimation = setInterval(() => {
                                if (isRecordBtnScaled) {
                                    recordBtn.style.scale = originalBtnScale;
                                    isRecordBtnScaled = false;
                                } else {
                                    recordBtn.style.scale = biggerBtnScale;
                                    isRecordBtnScaled = true;
                                }
                            }, 1000);
                        };

                        recordBtn.onmouseup = () => {
                            mediaRecorder.stop();
                            clearInterval(recordBtnAnimation);

                            recordBtn.style.scale = originalBtnScale;
                            isRecordBtnScaled = false;
                        };

                        mediaRecorder.onstop = (e) => {
                            const blob = new Blob(chunks, {
                                type: "audio/ogg; codecs=opus",
                            });
                            chunks = [];
                            const audioUrl = URL.createObjectURL(blob);
                            const audio = new Audio(audioUrl);
                            audio.play();

                            audio.onended = () => {
                                if (sentenceHasAudio) {
                                    nativeSpeakerAudioBtn.click();
                                }
                            };
                        };

                        mediaRecorder.ondataavailable = (e) => {
                            chunks.push(e.data);
                        };
                    })
                    .catch((err) => {
                        console.error(`The following error occurred: ${err}`);
                    });
                btnRow.appendChild(recordBtn);
            }
        });
    })
    .catch((error) => {
        console.log("Unable to load microphone: ", error);

        // Show top bar saying asking to check microphone permissions
        const errorBar = document.createElement("div");
        errorBar.style.position = "fixed";
        errorBar.style.top = "0";
        errorBar.style.right = "0";
        errorBar.style.zIndex = "70";
        errorBar.style.display = "flex";
        errorBar.style.alignItems = "center";
        errorBar.style.padding = "5px";
        errorBar.style.textAlign = "center";
        errorBar.style.backgroundColor = "#fff";
        errorBar.style.border = "3px red solid";
        errorBar.style.borderRadius = "10px";
        errorBar.style.padding = "5px";
        errorBar.innerHTML =
            "<div><strong>Tatoeba Recording Extension failed to load.</strong><br/>Please check your microphone permissions.</div>";

        const closeButton = document.createElement("div");
        closeButton.innerHTML = "X";
        closeButton.style.cursor = "pointer";
        closeButton.style.margin = "10px";
        closeButton.onclick = (event) => {
            event.target.parentNode.style.display = "none";
        };

        errorBar.appendChild(closeButton);
        document.body.appendChild(errorBar);
    });
