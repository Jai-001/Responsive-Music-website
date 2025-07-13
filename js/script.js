let currentSong = new Audio();
let songs;
let currFolder
function secondsToMMSS(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = secs.toString().padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`https://jai-001.github.io/Responsive-Music-website/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML="";
    for (const song of songs) {
        console.log(song.replaceAll("%20", " ").split("-").slice(0)[0])
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="./img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div></div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="./img/playbutton.svg" alt="">
                            </div>
                            </li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./img/pause.svg";
    }
    // currentSong.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    // buttons.style.right = '161px';
    // info.style.width = '410px';
}
async function displayAlbum(){
    let a = await fetch(`https://jai-001.github.io/Responsive-Music-website/Songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes("/Songs/")){
            let folder = e.href.split("/").splice(-1)[0];
            let a = await fetch(`https://jai-001.github.io/Responsive-Music-website/Songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="./img/play.svg" alt="">
                        </div>
                        <img src="/Songs/${folder}/cover.jpg"
                            alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
         songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);  
         playMusic(songs[0])
        })
        
    })
}
async function main() {

    await getSongs("Songs/ncs");
    playMusic(songs[0], true)

    //Display all the album on the page
    displayAlbum();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "./img/playbutton.svg";
        }
    })
    let buttons = document.getElementById('buttons')
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMMSS(currentSong.currentTime)} / ${secondsToMMSS(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //adding event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)*percent) /100;
    })
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })
    //adding eventlistner to close hamburger
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-121%";
    })

    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(0 < (index-1) && (index-1) < songs.length){
            playMusic(songs[index-1])
        }
    })
    //event listner for previous
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = parseInt(e.target.value)/100;
        if(currentSong.volume == 0){
            document.querySelector(".volume").src="./img/volumeoff.svg";
        }
        else if(currentSong.volume>0 && currentSong.volume*100<=50){
            document.querySelector(".volume").src="./img/midvol.svg";
        }
        else{
            document.querySelector(".volume").src="./img/volume.svg";
        }
    })
    document.querySelector(".volume").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","volumeoff.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src = e.target.src.replace("volumeoff.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}
main()
