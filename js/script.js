let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMMSS(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        let res = await fetch(`https://jai-001.github.io/Responsive-Music-website/${folder}/songs.json`);
        songs = await res.json();

        let songUl = document.querySelector(".songlist ul");
        songUl.innerHTML = "";

        for (const song of songs) {
            songUl.innerHTML += `
                <li>
                    <img class="invert" src="./img/music.svg" alt="">
                    <div class="info">
                        <div>${decodeURIComponent(song)}</div>
                        <div></div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="./img/playbutton.svg" alt="">
                    </div>
                </li>`;
        }

        Array.from(songUl.getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => playMusic(songs[index]));
        });

    } catch (error) {
        console.error("Error loading songs:", error);
    }
    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `https://jai-001.github.io/Responsive-Music-website/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "./img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbum() {
    try {
        let a = await fetch(`https://jai-001.github.io/Responsive-Music-website/Songs`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let e of anchors) {
            if (e.href.includes("/Songs/")) {
                let folder = e.href.split("/").filter(Boolean).pop();
                try {
                    let infoRes = await fetch(`https://jai-001.github.io/Responsive-Music-website/Songs/${folder}/info.json`);
                    let info = await infoRes.json();

                    cardContainer.innerHTML += `
                        <div data-folder="Songs/${folder}" class="card">
                            <div class="play">
                                <img src="./img/play.svg" alt="">
                            </div>
                            <img src="https://jai-001.github.io/Responsive-Music-website/Songs/${folder}/cover.jpg" alt="">
                            <h2>${info.title}</h2>
                            <p>${info.description}</p>
                        </div>`;
                } catch (err) {
                    console.warn(`Missing info.json for folder: ${folder}`);
                }
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                songs = await getSongs(card.dataset.folder);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main() {
    songs = await getSongs("Songs/ncs");
    if (songs.length > 0) playMusic(songs[0], true);

    await displayAlbum();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "./img/playbutton.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        let progress = (currentSong.currentTime / currentSong.duration) * 100 || 0;
        document.querySelector(".songtime").innerHTML =
            `${secondsToMMSS(currentSong.currentTime)} / ${secondsToMMSS(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${progress}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.currentTime = currentSong.duration * percent;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-121%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        updateVolumeIcon();
    });

    document.querySelector(".volume").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
        updateVolumeIcon();
    });
}

function updateVolumeIcon() {
    const vol = currentSong.volume;
    const volumeIcon = document.querySelector(".volume");
    if (vol === 0) {
        volumeIcon.src = "./img/volumeoff.svg";
    } else if (vol > 0 && vol <= 0.5) {
        volumeIcon.src = "./img/midvol.svg";
    } else {
        volumeIcon.src = "./img/volume.svg";
    }
}

main();
