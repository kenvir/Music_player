/** 
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ Pause/ Seek
 * 4. CD rotate
 * 5. Next/ Prev
 * 6. Random
 * 7. Next/ Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
*/
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
songs: [
    {
        name: 'Da tung vo gia',
        singer: 'Mr.Siro',
        path: './assets/music/song1.mp3',
        image: './assets/imgs/image1.jpg'
    },

    {
        name: 'Day dut noi dau',
        singer: 'Mr.Siro',
        path: './assets/music/song2.mp3',
        image: './assets/imgs/image2.jpg'
    },

    {
        name: 'Guong mat la lam',
        singer: 'Mr.Siro',
        path: './assets/music/song3.mp3',
        image: './assets/imgs/image3.jpg'
    },

    {
        name: 'Khoc cung em',
        singer: 'Mr.Siro&GRAY&Wind',
        path: './assets/music/song4.mp3',
        image: './assets/imgs/image4.jpg'
    },

    {
        name: 'Khong can them mot ai nua',
        singer: 'Mr.Siro',
        path: './assets/music/song5.mp3',
        image: './assets/imgs/image5.jpg'
    },
],

setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
},

render: function () {
    const htmls = this.songs.map((song, index) => {
        return `
            <div class="song ${index === this.currentIndex ? "active" : ""}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
        </div>
        `
    })
    playlist.innerHTML = htmls.join('');
},

defineProperties: function(){
    Object.defineProperty(this, 'currentSong', {
        get: function() {
            return this.songs[this.currentIndex]
        }
    })
},

handleEvents: function() {
    const _this = this
    const cdWidth = cd.offsetWidth

    //Xu ly CD quay va dung
    const cdThumbAnimate = cdThumb.animate([
        { transform: 'rotate(360deg)'}
    ], {
        duration: 10000,
        interations: Infinity
    })
    cdThumbAnimate.pause()

    //Xu ly phong to/ thu nho CD
    document.onscroll = function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const newcdWidth = cdWidth - scrollTop

        cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0
        cd.style.opacity = newcdWidth / cdWidth 
    }

    //Xu ly khi click play
    playBtn.onclick = function() {
        if (_this.isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
    }

    //Khi song duoc play
    audio.onplay = function() {
        _this.isPlaying = true
        player.classList.add('playing')
        cdThumbAnimate.play()
    }

    //Khi song bi pause
    audio.onpause = function() {
        _this.isPlaying = false
        player.classList.remove('playing')
        cdThumbAnimate.pause()
    }

    //Khi tien do bai hat thay doi
    audio.ontimeupdate = function() {
        if (audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            progress.value = progressPercent
        }
    }

    //Xu ly khi tua
    progress.onchange = function(e) {
        const seekTime = e.target.value * (audio.duration / 100)
        audio.currentTime = seekTime
    }

    //Khi next bai hat
    nextBtn.onclick = function() {
        if(_this.isRandom) {
            _this.playRandomSong()
        } else {
            _this.nextSong()
        }
        audio.play()
        _this.render()
        _this.scrollToActiveSong()
    }

    //Khi prev bai hat
    prevBtn.onclick = function() {
        if(_this.isRandom) {
            _this.playRandomSong()
        } else {
            _this.prevSong()
        }
        audio.play()
        _this.render()
    }

    //Xu ly bat / tat random
    randomBtn.onclick = function(e) {
        _this.isRandom = !_this.isRandom
        _this.setConfig('isRandom', _this.isRandom)
        randomBtn.classList.toggle('active', _this.isRandom)
    }

    // Xu ly lap lai mot bai hat
    repeatBtn.onclick = function(e) {
        _this.isRepeat = !_this.isRepeat
        _this.setConfig('isRepeat', _this.isRepeat)
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    //Xu ly khi het bai hat
    audio.onended = function() {
        if (_this.isRepeat) {
            audio.play()
        } else {
            nextBtn.click()
        }
    }

    //Lang nghe hanh vi click vao playlist
    playlist.onclick = function(e) {
        const songNode = e.target.closest('.song:not(.active)')

        if (songNode || e.target.closest('.option')) {   
            //Xu ly khi click vao song 
            if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index)
                _this.loadCurrentSong()
                audio.play()
                _this.render()
            }

            //Xu ly khi click vao song option
            if (e.target.closest('.option')) {

            }
        }
    }
},

scrollToActiveSong: function() {
    setTimeOut (() => {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        })
    }, 300)
},

loadCurrentSong: function() {
    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path

    console.log(heading, cdThumb, audio)
},

loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
},

nextSong: function() {
    this.currentIndex++
    if(this.currentIndex >= this.songs.length) {
        this.currentIndex = 0
    }
    this.loadCurrentSong()
},

prevSong: function() {
    this.currentIndex--
    if(this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
},

playRandomSong: function() {
    let newIndex
    do {
        newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)

    this.currentIndex = newIndex
    this.loadCurrentSong()
},

start: function() {
    //Gan cau hinh tu config vao object
    this.loadConfig()

    //Dinh nghia cac thuoc tinh cho object
    this.defineProperties()

    //Lang nghe/ xu ly cac su kien (DOM events)
    this.handleEvents()

    //Tai thong tin bai hat dau tien
    this.loadCurrentSong()

    //Render playlist
    this.render()

    //Hien thi trang thai ban dau cua btn repeat va random
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
}
}

app.start() 