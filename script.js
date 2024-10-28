console.log("lets have some javascript");
let songs;
let currfolder;
let currsong = new Audio();


// Function to convert seconds to minutes:seconds format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch songs from the folder
async function getsongs(folder) {
    let a = await fetch(`http://192.168.29.94:3000/${folder}`);
     mode: 'no-cors'
    currfolder = folder;
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    console.log(as);
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML += `<li>
                           <img src="music.svg" alt="">
                           <div class="info">
                            <div>
                             ${song.replaceAll("%20", " ")}
                            </div>
                            <div>Krish</div>
                           </div>
                           <div class="playnow">
                            <span>Play now</span>
                            <img class="invert" src="play.svg" alt="">
                           </div>
                         </li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

// Play the selected music track
const playmusic = (track, pause = false) => {
    track = decodeURIComponent(track);  // Decode the track name to handle %20 for spaces
    currsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currsong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

// Main function
async function main() {
    await getsongs("project-02/songs/ncs");
    console.log(songs);

    let play = document.querySelector("#play");
    let previous = document.querySelector("#previous");
    let next = document.querySelector("#next");

    play.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play();
            play.src = "pause.svg";
        } else {
            currsong.pause();
            play.src = "play.svg";
        }
    });

    currsong.addEventListener("timeupdate", () => {
        let duration = isNaN(currsong.duration) ? 0 : currsong.duration;
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currsong.currentTime)}/${secondsToMinutesSeconds(duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = (currsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous song
    previous.addEventListener("click", () => {
        currsong.pause();
        console.log("Previous clicked");
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    // Next song
    next.addEventListener("click", () => {
        currsong.pause();
        console.log("Next clicked");
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currsong.volume = parseInt(e.target.value) / 100;
        if (currsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg");
        }
    });

    // Handle folder cards
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        console.log(e);
        e.addEventListener("click", async (item) => {
            songs = await getsongs(`project-02/songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

// Run the main function
main();
