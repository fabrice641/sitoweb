const data = [
	{ match: "Qatar-Equador", result: "0-2" },
	{ match: "Senegal-Netherlands", result: "0-2" },
	{ match: "Qatar-Senegal", result: "1-3" },
	{ match: "Netherlands-Equador", result: "1-1" },
	{ match: "Equador-Senegal", result: "1-2" },
	{ match: "Netherlands-Qatar", result: "2-0" },
	{ match: "England-Iran", result: "6-2" },
	{ match: "United States-Wales", result: "1-1" },
	{ match: "Wales-Iran", result: "0-2" },
	{ match: "England-United States", result: "0-0" },
	{ match: "Wales-England", result: "0-3" },
	{ match: "Iran-United States", result: "0-1" },
	{ match: "Argentina-Saudi Arabia", result: "1-2" },
	{ match: "Mexico-Poland", result: "0-0" },
	{ match: "Poland-Saudi Arabia", result: "2-0" },
	{ match: "Argentina-Mexico", result: "2-0" },
	{ match: "Poland-Argentina", result: "0-2" },
	{ match: "Saudi Arabia-Mexico", result: "1-2" },
	{ match: "Denmark-Tunisia", result: "0-0" },
	{ match: "France-Australia", result: "4-1" },
	{ match: "Tunisia-Australia", result: "0-1" },
	{ match: "France-Denmark", result: "2-1" },
	{ match: "Australia-Denmark", result: "1-0" },
	{ match: "Tunisia-France", result: "1-0" },
	{ match: "Germany-Japan", result: "1-2" },
	{ match: "Spain-Costa Rica", result: "7-0" },
	{ match: "Japan-Costa Rica", result: "0-1" },
	{ match: "Spain-Germany", result: "1-1" },
	{ match: "Japan-Spain", result: "2-1" },
	{ match: "Costa Rica-Germany", result: "2-4" },
	{ match: "Morocco-Croatia", result: "0-0" },
	{ match: "Belgium-Canada", result: "1-0" },
	{ match: "Belgium-Morocco", result: "0-2" },
	{ match: "Croatia-Canada", result: "4-1" },
	{ match: "Croatia-Belgium", result: "0-0" },
	{ match: "Canada-Morocco", result: "1-2" },
	{ match: "Switzerland-Cameroon", result: "1-0" },
	{ match: "Brazil-Serbia", result: "2-0" },
	{ match: "Cameroon-Serbia", result: "3-3" },
	{ match: "Brazil-Switzerland", result: "1-0" },
	{ match: "Serbia-Switzerland", result: "2-3" },
	{ match: "Cameroon-Brazil", result: "1-0" },
	{ match: "Uruguay-South Korea", result: "0-0" },
	{ match: "Portugal-Ghana", result: "3-2" },
	{ match: "South Korea-Ghana", result: "2-3" },
	{ match: "Portugal-Uruguay", result: "2-0" },
	{ match: "Ghana-Uruguay", result: "0-2" },
	{ match: "South Korea-Portugal", result: "2-1" },
	{ match: "Netherlands-United States", result: "3-1" },
	{ match: "Argentina-Australia", result: "2-1" },
	{ match: "Japan-Croatia", result: "1-1" },
	{ match: "Brazil-South Korea", result: "4-1" },
	{ match: "England-Senegal", result: "3-0" },
	{ match: "France-Poland", result: "3-1" },
	{ match: "Morocco-Spain", result: "0-0" },
	{ match: "Portugal-Switzerland", result: "6-1" }
];

// { ...data, goals }
const dataGoals = data.map((d) => {
	const { match, result } = d;
	const goals = result
		.split("-")
		.reduce((acc, curr) => acc + parseInt(curr, 10), 0);

	return {
		...d,
		goals
	};
});

// { goals, frequency }
const dataFrequency = Object.entries(
	dataGoals.reduce((acc, curr) => {
		acc[curr.goals] = acc[curr.goals] ? acc[curr.goals] + 1 : 1;
		return acc;
	}, {})
).map(([goals, frequency]) => ({ goals: parseInt(goals, 10), frequency }));

const totalGoals = dataGoals.reduce((acc, curr) => acc + curr.goals, 0);
const maxGoals = d3.max(dataFrequency, (d) => d.goals);
const { goals: goalsMaxFrequency } = dataFrequency.find(
	(d) => d.frequency === d3.max(dataFrequency, (d) => d.frequency)
);

const width = 500;
const height = 120;

const strokeWidth = 8;
const rounding = 8;
const verticalStripes = 5;

const margin = {
	top: 20,
	right: 10,
	bottom: 10,
	left: 10
};

const radius = 8;

const scaleOffset = d3
	.scaleBand()
	.domain(d3.range(d3.max(dataGoals, (d) => d.goals) + 1))
	.range([0, width]);

// { ...dataGoals, x, y }
const dataNodes = dataGoals.map((d) => {
	const { goals } = d;
	const x = scaleOffset(goals) + scaleOffset.bandwidth() / 2;
	const y = height / 2;

	return {
		...d,
		x,
		y
	};
});

const simulation = d3
	.forceSimulation()
	.nodes(dataNodes)
	.force("collision", d3.forceCollide().radius(radius))
	.force(
		"x",
		d3.forceX().x((d) => d.x)
	)
	.force(
		"y",
		d3.forceY().y((d) => d.y)
	);

const root = d3.select("body").append("div").attr("id", "root");

const header = root.append("header");
header.append("h1").text("Just how many goals?");
header
	.append("p")
	.html(
		`Following the group stages and the round of 16, teams at the 2022 FIFA World Cup scored <strong>${totalGoals}</strong> times.`
	);

header
	.append("p")
	.html(
		`While the record is <strong>${maxGoals}</strong> goals, however, most matches ended with <strong>${goalsMaxFrequency}</strong>.`
	);

const svg = root
	.append("svg")
	.attr(
		"viewBox",
		`0 0 ${width + (margin.left + margin.right)} ${
			height + (margin.top + margin.bottom)
		}`
	);

const axisX = d3.axisBottom(scaleOffset).tickSize(0);

const group = svg
	.append("g")
	.attr("transform", `translate(${margin.left} ${margin.top})`);

const groupAxis = group.append("g");
const groupGoals = group.append("g");
const groupHighlight = group
	.append("g")
	.attr("transform", `translate(${width} ${-(strokeWidth + 1)})`)
	.attr("text-anchor", "end")
	.attr("fill", "currentColor")
	.attr("font-size", "13")
	.attr("font-weight", "700");

const groupDelaunay = group.append("g").attr("opacity", "0");

const groupAxisX = groupAxis
	.append("g")
	.attr("transform", `translate(0 ${height})`)
	.call(axisX);

const groupAxisY = groupAxis.append("g");

groupAxisX.select("path").remove();
groupAxisX.selectAll("text").attr("opacity", "0");

groupAxisX
	.selectAll("g.tick")
	.append("path")
	.attr("fill", "none")
	.attr("stroke", "var(--color-net, currentColor)")
	.attr("stroke-width", "1")
	.attr("d", `M 0 0 v ${-height}`);

groupAxisY
	.selectAll("path")
	.data(
		d3.range(verticalStripes).map((d, _, { length }) => (height / length) * d)
	)
	.enter()
	.append("path")
	.attr("fill", "none")
	.attr("stroke", "var(--color-net, currentColor)")
	.attr("stroke-width", "1")
	.attr("d", (d) => `M 0 ${d} h ${width}`);

groupAxis
	.append("path")
	.attr("fill", "none")
	.attr("stroke", "currentColor")
	.attr("stroke-width", strokeWidth)
	.attr("stroke-linejoin", "round")
	.attr(
		"d",
		`M 0 ${height}  v ${-(
			height - rounding
		)} a ${rounding} ${rounding} 0 0 1 ${rounding} ${-rounding} h ${
			width - rounding * 2
		} a ${rounding} ${rounding} 0 0 1 ${rounding} ${rounding} v ${
			height - rounding
		}`
	);

// run the simulation before you draw the data points
while (simulation.alpha() > simulation.alphaMin()) {
	simulation.tick();
}

const groupsGoals = groupGoals
	.selectAll("g")
	.data(dataNodes)
	.enter()
	.append("g")
	.attr("transform", (d) => `translate(${d.x} ${d.y})`);

groupsGoals
	.append("use")
	.attr("x", -radius)
	.attr("y", -radius)
	.style("color", "var(--color-accent)")
	.attr("width", radius * 2)
	.attr("height", radius * 2)
	.attr("href", "#football-ball");

const delaunay = d3.Delaunay.from(
	dataNodes,
	(d) => d.x,
	(d) => d.y
);

const voronoi = delaunay.voronoi([0, 0, width, height]);

groupDelaunay
	.selectAll("path")
	.data(dataNodes)
	.enter()
	.append("path")
	.attr("d", (_, i) => voronoi.renderCell(i))
	.on("pointerenter", function (e, d) {
		groupsGoals
			.style("filter", "grayscale(0.7) brightness(0.5)")
			.filter(({ match }) => match === d.match)
			.style("filter", "grayscale(0) brightness(1)")
			.select("use")
			.transition()
			.duration(350)
			.attr("transform", "rotate(20) scale(1.25)");

		const { match, result } = d;
		groupHighlight
			.append("text")
			.html(
				`${match.replace(
					"-",
					" - "
				)} <tspan font-weight="initial" font-size="0.8em">ended</tspan> ${result.replace(
					"-",
					" - "
				)}`
			);
	})
	.on("pointerleave", function (e, d) {
		groupsGoals
			.style("filter", "grayscale(0) brightness(1)")
			.filter(({ match }) => match === d.match)
			.select("use")
			.transition()
			.attr("transform", "scale(1)");

		groupHighlight.select("text").remove();
	});




const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((navItem, i) => {
  navItem.addEventListener("click", () => {
    navItems.forEach((item, j) => {
      item.className = "nav-item";
    });
    navItem.className = "nav-item active";
  });
});

const containers = document.querySelectorAll(".containers");

containers.forEach((container) => {
  let isDragging = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.pageX - container.offsetLeft;
    const step = (x - startX) * 0.6;
    container.scrollLeft = scrollLeft - step;
  });

  container.addEventListener("mouseup", () => {
    isDragging = false;
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
  });
});

const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const rotatingImage = document.getElementById("rotatingImage");
const songName = document.querySelector(".music-player h2");
const artistName = document.querySelector(".music-player p");

let rotating = false;
let currentRotation = 0;
let rotationInterval;

const songs = [
  {
    title: "Redemption",
    name: "Besomorph & Coopex",
    source:
      "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Besomorph-Coopex-Redemption.mp3",
    cover:
      "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0",
  },
  {
    title: "What's The Problem?",
    name: "OSKI",
    source:
      "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/OSKI-Whats-The-Problem.mp3",
    cover:
      "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c",
  },
  {
    title: "Control",
    name: "Unknown Brain x Rival",
    source:
      "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Unknown-BrainxRival-Control.mp3",
    cover:
      "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61",
  },
];

let currentSongIndex = 0;

function startRotation() {
  if (!rotating) {
    rotating = true;
    rotationInterval = setInterval(rotateImage, 50);
  }
}

function pauseRotation() {
  clearInterval(rotationInterval);
  rotating = false;
}

function rotateImage() {
  currentRotation += 1;
  rotatingImage.style.transform = `rotate(${currentRotation}deg)`;
}

function updateSongInfo() {
  songName.textContent = songs[currentSongIndex].title;
  artistName.textContent = songs[currentSongIndex].name;
  song.src = songs[currentSongIndex].source;
  rotatingImage.src = songs[currentSongIndex].cover;

  song.addEventListener("loadeddata", function () {});
}

song.addEventListener("loadedmetadata", function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
});

song.addEventListener("ended", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

song.addEventListener("timeupdate", function () {
  if (!song.paused) {
    progress.value = song.currentTime;
  }
});

function playPause() {
  if (song.paused) {
    song.play();
    controlIcon.classList.add("fa-pause");
    controlIcon.classList.remove("fa-play");
    startRotation();
  } else {
    song.pause();
    controlIcon.classList.remove("fa-pause");
    controlIcon.classList.add("fa-play");
    pauseRotation();
  }
}

playPauseButton.addEventListener("click", playPause);

progress.addEventListener("input", function () {
  song.currentTime = progress.value;
});

progress.addEventListener("change", function () {
  song.play();
  controlIcon.classList.add("fa-pause");
  controlIcon.classList.remove("fa-play");
  startRotation();
});

forwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

backwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
});

updateSongInfo();

var swiper = new Swiper(".swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  loop: true,
  speed: 600,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 10,
    stretch: 120,
    depth: 200,
    modifier: 1,
    slideShadows: false,
  },
   on: {
    click(event) {
      swiper.slideTo(this.clickedIndex);
    },
  },
  pagination: {
    el: ".swiper-pagination",
  },
});




const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const shuffleButton = document.getElementById("shuffle");

const allSongs = [
  {
    id: 0,
    title: "Scratching The Surface",
    artist: "Quincy Larson",
    duration: "4:25",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/scratching-the-surface.mp3",
  },
  {
    id: 1,
    title: "Can't Stay Down",
    artist: "Quincy Larson",
    duration: "4:15",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cant-stay-down.mp3",
  },
  {
    id: 2,
    title: "Still Learning",
    artist: "Quincy Larson",
    duration: "3:51",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/still-learning.mp3",
  },
  {
    id: 3,
    title: "Cruising for a Musing",
    artist: "Quincy Larson",
    duration: "3:34",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cruising-for-a-musing.mp3",
  },
  {
    id: 4,
    title: "Never Not Favored",
    artist: "Quincy Larson",
    duration: "3:35",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/never-not-favored.mp3",
  },
  {
    id: 5,
    title: "From the Ground Up",
    artist: "Quincy Larson",
    duration: "3:12",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/from-the-ground-up.mp3",
  },
  {
    id: 6,
    title: "Walking on Air",
    artist: "Quincy Larson",
    duration: "3:25",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/walking-on-air.mp3",
  },
  {
    id: 7,
    title: "Can't Stop Me. Can't Even Slow Me Down.",
    artist: "Quincy Larson",
    duration: "3:52",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cant-stop-me-cant-even-slow-me-down.mp3",
  },
  {
    id: 8,
    title: "The Surest Way Out is Through",
    artist: "Quincy Larson",
    duration: "3:10",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/the-surest-way-out-is-through.mp3",
  },
  {
    id: 9,
    title: "Chasing That Feeling",
    artist: "Quincy Larson",
    duration: "2:43",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/chasing-that-feeling.mp3",
  },
];

const audio = new Audio();
let userData = {
  songs: [...allSongs],
  currentSong: null,
  songCurrentTime: 0,
};

const playSong = (id) => {
  const song = userData?.songs.find((song) => song.id === id);
  audio.src = song.src;
  audio.title = song.title;

  if (userData?.currentSong === null || userData?.currentSong.id !== song.id) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = userData?.songCurrentTime;
  }
  userData.currentSong = song;
  playButton.classList.add("playing");

  highlightCurrentSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();
  audio.play();
};

const pauseSong = () => {
  userData.songCurrentTime = audio.currentTime;
  
  playButton.classList.remove("playing");
  audio.pause();
};

const playNextSong = () => {
  if (userData?.currentSong === null) {
    playSong(userData?.songs[0].id);
  } else {
    const currentSongIndex = getCurrentSongIndex();
    const nextSong = userData?.songs[currentSongIndex + 1];

    playSong(nextSong.id);
  }
};

const playPreviousSong = () =>{
   if (userData?.currentSong === null) return;
   else {
    const currentSongIndex = getCurrentSongIndex();
    const previousSong = userData?.songs[currentSongIndex - 1];

    playSong(previousSong.id);
   }
};

const shuffle = () => {
  userData?.songs.sort(() => Math.random() - 0.5);
  userData.currentSong = null;
  userData.songCurrentTime = 0;

  renderSongs(userData?.songs);
  pauseSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();
};

const deleteSong = (id) => {
  if (userData?.currentSong?.id === id) {
    userData.currentSong = null;
    userData.songCurrentTime = 0;

    pauseSong();
    setPlayerDisplay();
  }

  userData.songs = userData?.songs.filter((song) => song.id !== id);
  renderSongs(userData?.songs); 
  highlightCurrentSong(); 
  setPlayButtonAccessibleText(); 

  if (userData?.songs.length === 0) {
    const resetButton = document.createElement("button");
    const resetText = document.createTextNode("Reset Playlist");

    resetButton.id = "reset";
    resetButton.ariaLabel = "Reset playlist";
    resetButton.appendChild(resetText);
    playlistSongs.appendChild(resetButton);

    resetButton.addEventListener("click", () => {
      userData.songs = [...allSongs];

      renderSongs(sortSongs()); 
      setPlayButtonAccessibleText();
      resetButton.remove();
    });

  }

};

const setPlayerDisplay = () => {
  const playingSong = document.getElementById("player-song-title");
  const songArtist = document.getElementById("player-song-artist");
  const currentTitle = userData?.currentSong?.title;
  const currentArtist = userData?.currentSong?.artist;

  playingSong.textContent = currentTitle ? currentTitle : "";
  songArtist.textContent = currentArtist ? currentArtist : "";
};

const highlightCurrentSong = () => {
  const playlistSongElements = document.querySelectorAll(".playlist-song");
  const songToHighlight = document.getElementById(
    `song-${userData?.currentSong?.id}`
  );

  playlistSongElements.forEach((songEl) => {
    songEl.removeAttribute("aria-current");
  });

  if (songToHighlight) songToHighlight.setAttribute("aria-current", "true");
};

const renderSongs = (array) => {
  const songsHTML = array
    .map((song)=> {
      return `
      <li id="song-${song.id}" class="playlist-song">
      <button class="playlist-song-info" onclick="playSong(${song.id})">
          <span class="playlist-song-title">${song.title}</span>
          <span class="playlist-song-artist">${song.artist}</span>
          <span class="playlist-song-duration">${song.duration}</span>
      </button>
      <button onclick="deleteSong(${song.id})" class="playlist-song-delete" aria-label="Delete ${song.title}">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#4d4d62"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.32587 5.18571C5.7107 4.90301 6.28333 4.94814 6.60485 5.28651L8 6.75478L9.39515 5.28651C9.71667 4.94814 10.2893 4.90301 10.6741 5.18571C11.059 5.4684 11.1103 5.97188 10.7888 6.31026L9.1832 7.99999L10.7888 9.68974C11.1103 10.0281 11.059 10.5316 10.6741 10.8143C10.2893 11.097 9.71667 11.0519 9.39515 10.7135L8 9.24521L6.60485 10.7135C6.28333 11.0519 5.7107 11.097 5.32587 10.8143C4.94102 10.5316 4.88969 10.0281 5.21121 9.68974L6.8168 7.99999L5.21122 6.31026C4.8897 5.97188 4.94102 5.4684 5.32587 5.18571Z" fill="white"/></svg>
        </button>
      </li>
      `;
    })
    .join("");

  playlistSongs.innerHTML = songsHTML;
};

const setPlayButtonAccessibleText = () => {
  const song = userData?.currentSong || userData?.songs[0];

  playButton.setAttribute(
    "aria-label",
    song?.title ? `Play ${song.title}` : "Play"
  );
};

const getCurrentSongIndex = () => userData?.songs.indexOf(userData?.currentSong);

playButton.addEventListener("click", () => {
    if (userData?.currentSong === null) {
    playSong(userData?.songs[0].id);
  } else {
    playSong(userData?.currentSong.id);
  }
});

pauseButton.addEventListener("click",  pauseSong);

nextButton.addEventListener("click", playNextSong);

previousButton.addEventListener("click", playPreviousSong);

shuffleButton.addEventListener("click", shuffle);

audio.addEventListener("ended", () => {
  const currentSongIndex = getCurrentSongIndex();
  const nextSongExists = userData?.songs[currentSongIndex + 1] !== undefined;

    if (nextSongExists) {
      playNextSong();
    } else {
      userData.currentSong = null;
      userData.songCurrentTime = 0;  
pauseSong();
setPlayerDisplay();
highlightCurrentSong();
setPlayButtonAccessibleText();

    }
});

const sortSongs = () => {
  userData?.songs.sort((a,b) => {
    if (a.title < b.title) {
      return -1;
    }

    if (a.title > b.title) {
      return 1;
    }

    return 0;
  });

  return userData?.songs;
};

renderSongs(sortSongs());
setPlayButtonAccessibleText();




const imageContainer = document.getElementById("imageContainer");
const imageElement = document.getElementById("myImage");

let scene, camera, renderer, planeMesh;
let isHovered = false;
let hoverDuration = 0;

const ANIMATION_CONFIG = {
  updateFrequency: 0.1,
  glitchIntensityMod: 0.5
};

// shaders
const vertexShader = `
    varying vec2 vUv;
    void main() {
       vUv = uv;
       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float glitchIntensity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec4 baseState = texture2D(tDiffuse, uv);

    if (glitchIntensity > 0.0) {
        float segment = floor(uv.y * 12.0); 
        float randomValue = fract(sin(segment * 12345.6789 + glitchIntensity) * 43758.5453); 
        vec2 offset = vec2(randomValue * 0.03, 0.0) * glitchIntensity;

        vec4 redGlitch = texture2D(tDiffuse, uv + offset);
        vec4 greenGlitch = texture2D(tDiffuse, uv - offset);
        vec4 blueGlitch = texture2D(tDiffuse, uv);

        if (mod(segment, 3.0) == 0.0) {
            gl_FragColor = vec4(redGlitch.r, greenGlitch.g, baseState.b, 1.0);
        } else if (mod(segment, 3.0) == 1.0) {
            gl_FragColor = vec4(baseState.r, greenGlitch.g, blueGlitch.b, 1.0);
        } else {
            gl_FragColor = vec4(redGlitch.r, baseState.g, blueGlitch.b, 1.0);
        }
    } else {
        gl_FragColor = baseState; 
    }
}
`;

function initializeScene(texture) {
  // camera setup
  camera = new THREE.PerspectiveCamera(
    80,
    imageElement.offsetWidth / imageElement.offsetHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  // scene creation
  scene = new THREE.Scene();
  
  // uniforms
  const shaderUniforms = {
    tDiffuse: { value: texture },
    glitchIntensity: { value: 0.0 }
  };

  // creating a plane mesh with materials
  planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader,
      fragmentShader
    })
  );

  // add mesh to scene
  scene.add(planeMesh);

  // render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(imageElement.offsetWidth, imageElement.offsetHeight);
  
  // create a new canvas in imageContainer
  imageContainer.appendChild(renderer.domElement);

  // if mouse is over the image, isHovered is true
  imageContainer.addEventListener("mouseover", function () {
    isHovered = true;
  });

  // if mouse is out of the image, isHovered is false and glitchIntensity value is 0
  imageContainer.addEventListener("mouseout", function () {
    isHovered = false;
    shaderUniforms.glitchIntensity.value = 0;
  });
}

// use the existing image from html in the canvas
initializeScene(new THREE.TextureLoader().load(imageElement.src));

animateScene();

function animateScene() {
  requestAnimationFrame(animateScene);
  
  if (isHovered) {
    hoverDuration += ANIMATION_CONFIG.updateFrequency;

    if (hoverDuration >= 0.5) {
      hoverDuration = 0;
      planeMesh.material.uniforms.glitchIntensity.value = Math.random() * ANIMATION_CONFIG.glitchIntensityMod;
    }
  }

  renderer.render(scene, camera);
}
